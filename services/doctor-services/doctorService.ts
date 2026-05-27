import { authFetch } from "@/utils/authFetch";
import { Doctor, FilterOptionsResponse, PaginatedDoctorsResponse } from "@/types/doctor";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const normalizeDoctor = (item: any): Doctor => {
  return {
    id: item.id ?? item.doctor_id ?? "",
    doctorName: item.doctorName || item.doctor_name || item.name || "",
    gender: item.gender || "",
    hprSpecialitys: item.hprSpecialitys || item.specialty || item.hpr_specialty || "",
    systemOfMedicine: item.systemOfMedicine || item.system_of_medicine || "",
    doctorMedicalQualifications___courseId_name: item.doctorMedicalQualifications___courseId_name || item.course_name || item.qualification || "",
    workExperienceInYear: Number(item.workExperienceInYear ?? item.experience ?? item.work_experience ?? item.work_experience_in_year ?? 0),
    hprWorkDetails___districtName: item.hprWorkDetails___districtName || item.district_name || item.district || "",
    currentCity: item.currentCity || item.district_name || item.district || "",
    hprWorkDetails___stateName: item.hprWorkDetails___stateName || item.state_name || item.state || item.state_source || "",
    stateMedicalCouncil: item.stateMedicalCouncil || item.council || "",
    piLanguage: item.piLanguage || item.pi_language || "",
    hprWorkDetails___facilityOwnership: item.hprWorkDetails___facilityOwnership || item.facility_ownership || "",
    hospitalName: item.hospitalName || item.hospital_name || "",
    registrationNumber: item.registrationNumber || item.registration_number || "",
    registrationYear: item.registrationYear || item.registration_year || 0,
    registrationStatus: item.registrationStatus || item.registration_status || "Unverified",
    status: item.status || "Active",
    phoneNumber: item.phoneNumber || item.phone_number || "",
    email: item.email || "",
    doctorType: item.doctorType || item.doctor_type || "",
    isRegistrationVerified: !!(item.isRegistrationVerified ?? item.is_registration_verified),
    isPhoneVerified: !!(item.isPhoneVerified ?? item.is_phone_verified),
    isEmailVerified: !!(item.isEmailVerified ?? item.is_email_verified),
    isQualificationsVerified: !!(item.isQualificationsVerified ?? item.is_qualifications_verified),
    isWorkVerified: !!(item.isWorkVerified ?? item.is_work_verified),

    // Nested fields expected by table UI
    "doctors_work.facilityLat": Number(item["doctors_work.facilityLat"] ?? item.facility_lat ?? item.facilityLat ?? 0),
    "doctors_work.facilityLong": Number(item["doctors_work.facilityLong"] ?? item.facility_long ?? item.facilityLong ?? 0),
    "doctors_main.stateName": item["doctors_main.stateName"] || item.state_source || item.state_name || item.state || "",
    "doctors_work.verificationStatus": item["doctors_work.verificationStatus"] || item.verification_status || "",
    "doctors_main.governmentEmployee": !!(item["doctors_main.governmentEmployee"] ?? item.government_employee),
    "doctors_work.facilityType": item["doctors_work.facilityType"] || item.facility_type || "",
    "doctors_work.facilityOwnership": item["doctors_work.facilityOwnership"] || item.facility_ownership || "",
    "doctors_qualifications.collegeId.name": item["doctors_qualifications.collegeId.name"] || item.college_name || item.college || "",
    isForeignEducated: !!(item.isForeignEducated ?? item.is_foreign_educated)
  };
};

export const doctorService = {
  /**
   * Fetches the doctors registry from the FastAPI backend using cursor pagination.
   * @param params Serialized URLSearchParams representing active filter values and pagination cursor/limit.
   */
  async getDoctors(params: URLSearchParams): Promise<PaginatedDoctorsResponse> {
    const queryStr = params.toString();
    const url = `${API_BASE}/doctors${queryStr ? "?" + queryStr : ""}`;

    const response = await authFetch(url);

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();
    const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
    return {
      items: items.map(normalizeDoctor),
      next_cursor: data?.next_cursor ?? null,
    };
  },

  /**
   * Fetches a specific doctor's detailed record dossier.
   * @param doctorId The unique integer ID of the doctor
   */
  async getDoctorById(doctorId: number): Promise<Doctor> {
    const url = `${API_BASE}/doctors/${doctorId}`;

    const response = await authFetch(url);

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();
    return normalizeDoctor(data);
  },

  /**
   * Fetches the complete filter options/vocabulary from the backend database.
   */
  async getFilterOptions(): Promise<FilterOptionsResponse> {
    const url = `${API_BASE}/doctors/filters/options`;

    const response = await authFetch(url);

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    return response.json();
  },
};
export type DoctorService = typeof doctorService;

