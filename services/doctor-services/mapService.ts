import { authFetch } from "@/utils/authFetch";
import { PaginatedMapDoctorsResponse } from "@/types/doctor";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export const mapService = {
  /**
   * Fetches lightweight doctor locations for rendering map markers.
   * @param params Serialized URLSearchParams representing active filter values.
   */
  async getDoctors(params: URLSearchParams): Promise<PaginatedMapDoctorsResponse> {
    const queryStr = params.toString();
    const url = `${API_BASE}/doctors/map${queryStr ? "?" + queryStr : ""}`;

    const response = await authFetch(url);

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();
    
    // Normalize response: API can return items or data directly
    const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
    
    return {
      items,
      next_cursor: data?.next_cursor ?? null,
    };
  },
};

export type MapService = typeof mapService;
