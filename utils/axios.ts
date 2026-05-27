import { API_URL, apiEndPoints } from "@/constant/api";
import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";

// Create axios instances
const unauthenticatedInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000, 
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const authenticatedInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Retry logic for unauthenticatedInstance (network errors only)
unauthenticatedInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };

    if (
      !config ||
      (config._retryCount || 0) >= 2 ||
      error.response?.status === 401 ||
      error.response?.status === 403
    ) {
      return Promise.reject(error);
    }

    config._retryCount = (config._retryCount || 0) + 1;

    const delay = Math.pow(2, config._retryCount) * 1000; // exponential backoff
    await new Promise((resolve) => setTimeout(resolve, delay));

    return unauthenticatedInstance(config);
  }
);

// Token refresh state management
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Function to handle token refresh
const refreshAccessToken = async (): Promise<string> => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token found");
    }

    const response = await unauthenticatedInstance.post(apiEndPoints.refreshToken, {
      refreshToken: refreshToken,
    });

    if (!response.data?.data?.accessToken) {
      throw new Error("Invalid refresh token response");
    }

    const { accessToken } = response.data.data;
    // Note: Backend doesn't send new refresh token, keep existing one

    // Save new access token in localStorage
    localStorage.setItem("accessToken", accessToken);

    return accessToken;
  } catch (error) {
    console.error("Refresh token error:", error);
    // Clear tokens on refresh failure
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    throw error;
  }
};

// Request interceptor for authenticatedInstance
authenticatedInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip adding token for auth endpoints
    if (config.url?.includes("/auth/refresh-token") || config.url?.includes("/auth/login") || config.url?.includes("/auth/register")) {
      return config;
    }

    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // If no access token, check if we have a refresh token
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const newToken = await refreshAccessToken();
          config.headers.Authorization = `Bearer ${newToken}`;
        } catch (error) {
          // If refresh fails, clear storage and let the response interceptor handle it
          console.log(error)
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor for authenticatedInstance
authenticatedInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Skip refresh logic for auth endpoints, non-401 errors, or already retried requests
    if (
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/refresh-token") ||
      error.response?.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();

        // Notify all queued requests with new token
        refreshSubscribers.forEach((callback) => callback(newToken));
        refreshSubscribers = [];

        // Update original request with new token and retry
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return authenticatedInstance(originalRequest);
      } catch (refreshError) {
        // Clear tokens and redirect on refresh failure
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        refreshSubscribers = []; // Clear the queue
        
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login?error=session_expired";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // If already refreshing, queue the request
    return new Promise((resolve, reject) => {
      refreshSubscribers.push((token: string) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        authenticatedInstance(originalRequest)
          .then(resolve)
          .catch(reject);
      });
    });
  }
);

export { authenticatedInstance, unauthenticatedInstance };