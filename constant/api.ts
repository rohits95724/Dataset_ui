export const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const apiEndPoints = {
    login: "/auth/login",
    signup: "/auth/register",
    forgetPassword: "/auth/forgot-password",
    resetPassword: (token:string) =>` /auth/reset-password/${token}`,
    refreshToken: "/auth/refresh-token",
    logout: "/auth/logout",
    getUserProfile: "/auth/me",
    updateProfile: "/auth/profile",
    changePassword: "/auth/change-password",
    
};