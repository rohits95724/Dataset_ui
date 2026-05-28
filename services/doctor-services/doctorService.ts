import { authFetch } from "@/utils/authFetch";
import { Doctor, FilterOptionsResponse, PaginatedDoctorsResponse } from "@/types/doctor";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const normalizeImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (url.includes("localhost:8000")) {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "https://problock-api-825973751347.us-central1.run.app";
    let origin = "https://problock-api-825973751347.us-central1.run.app";
    try {
      if (base.startsWith("http")) {
        const urlObj = new URL(base);
        origin = urlObj.origin;
      }
    } catch (e) {
      console.error("Failed to parse NEXT_PUBLIC_API_BASE_URL", e);
    }
    return url.replace("http://localhost:8000", origin);
  }
  return url;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const normalizeDoctor = (item: any): Doctor => {
  const firstReg = Array.isArray(item.registrations) && item.registrations.length > 0 ? item.registrations[0] : null;
  const domesticQual = Array.isArray(item.qualifications_domestic) && item.qualifications_domestic.length > 0 ? item.qualifications_domestic[0] : null;
  const internationalQual = Array.isArray(item.qualifications_international) && item.qualifications_international.length > 0 ? item.qualifications_international[0] : null;
  const firstWork = Array.isArray(item.workplaces) && item.workplaces.length > 0 ? item.workplaces[0] : null;

  const defaultRegYear = firstReg?.registration_date 
    ? new Date(firstReg.registration_date).getFullYear() 
    : 0;

  const qualName = item.doctorMedicalQualifications___courseId_name || 
                   item.course_name || 
                   item.qualification || 
                   domesticQual?.course_name || 
                   internationalQual?.course_name || 
                   "";

  return {
    id: item.id ?? item.doctor_id ?? "",
    doctorName: item.doctorName || item.doctor_name || item.name || "",
    gender: item.gender || "",
    hprSpecialitys: item.hprSpecialitys || item.specialty || item.hpr_specialty || "",
    systemOfMedicine: item.systemOfMedicine || item.system_of_medicine || item.system_of_medicine || "",
    doctorMedicalQualifications___courseId_name: qualName,
    workExperienceInYear: Number(item.workExperienceInYear ?? item.experience ?? item.work_experience ?? item.work_experience_in_year ?? 0),
    hprWorkDetails___districtName: item.hprWorkDetails___districtName || item.district_name || item.district || firstWork?.district_name || "",
    currentCity: item.currentCity || item.district_name || item.district || firstWork?.district_name || "",
    hprWorkDetails___stateName: item.hprWorkDetails___stateName || item.state_name || item.state || item.state_source || firstWork?.state_name || "",
    stateMedicalCouncil: item.stateMedicalCouncil || item.council || firstReg?.council_name || "",
    piLanguage: item.piLanguage || item.pi_language || "",
    hprWorkDetails___facilityOwnership: item.hprWorkDetails___facilityOwnership || item.facility_ownership || firstWork?.facility_ownership || "",
    hospitalName: item.hospitalName || item.hospital_name || firstWork?.facility_name || "",
    registrationNumber: item.registrationNumber || item.registration_number || firstReg?.registration_no || "",
    registrationYear: item.registrationYear || item.registration_year || defaultRegYear,
    registrationStatus: item.registrationStatus || item.registration_status || (item.application_status === "verified" ? "Verified" : (item.application_status === "pending" ? "Pending" : "Unverified")),
    status: item.status || (item.work_status ? item.work_status : "Active"),
    phoneNumber: item.phoneNumber || item.phone_number || item.public_mobile_number || "",
    email: item.email || item.email_official || item.email_public || "",
    doctorType: item.doctorType || item.doctor_type || item.hpr_type || "",
    isRegistrationVerified: !!(item.isRegistrationVerified ?? item.is_registration_verified ?? item.council_verified),
    isPhoneVerified: !!(item.isPhoneVerified ?? item.is_phone_verified ?? item.mobile_verified),
    isEmailVerified: !!(item.isEmailVerified ?? item.is_email_verified ?? (item.email_official ? true : false)),
    isQualificationsVerified: !!(item.isQualificationsVerified ?? item.is_qualifications_verified ?? (domesticQual || internationalQual ? true : false)),
    isWorkVerified: !!(item.isWorkVerified ?? item.is_work_verified ?? (firstWork ? true : false)),

    // Additional live API fields
    hprId: item.hpr_id || "",
    applicationStatus: item.application_status || "",
    areYouCurrentlyWorking: item.are_you_currently_working !== undefined ? !!item.are_you_currently_working : undefined,
    profileCompleted: item.profile_completed !== undefined ? !!item.profile_completed : undefined,
    emailOfficial: item.email_official || "",
    emailPublic: item.email_public || "",
    publicMobileNumber: item.public_mobile_number || "",
    registrations: item.registrations || [],
    qualificationsDomestic: item.qualifications_domestic || [],
    qualificationsInternational: item.qualifications_international || [],
    workplaces: item.workplaces || [],

    // Nested fields expected by table UI
    "doctors_work.facilityLat": Number(item["doctors_work.facilityLat"] ?? item.facility_lat ?? item.facilityLat ?? firstWork?.facility_lat ?? 0),
    "doctors_work.facilityLong": Number(item["doctors_work.facilityLong"] ?? item.facility_long ?? item.facilityLong ?? firstWork?.facility_long ?? 0),
    "doctors_main.stateName": item["doctors_main.stateName"] || item.state_source || item.state_name || item.state || "",
    "doctors_work.verificationStatus": item["doctors_work.verificationStatus"] || item.verification_status || firstWork?.status || "",
    "doctors_main.governmentEmployee": !!(item["doctors_main.governmentEmployee"] ?? item.government_employee),
    "doctors_work.facilityType": item["doctors_work.facilityType"] || item.facility_type || firstWork?.facility_type || "",
    "doctors_work.facilityOwnership": item["doctors_work.facilityOwnership"] || item.facility_ownership || firstWork?.facility_ownership || "",
    "doctors_qualifications.collegeId.name": item["doctors_qualifications.collegeId.name"] || item.college_name || item.college || domesticQual?.college_name || internationalQual?.college_name || "",
    isForeignEducated: !!(item.isForeignEducated ?? item.is_foreign_educated),
    profile_pic_url: normalizeImageUrl(item.profile_pic_url || item.profilePicUrl),
    thumbnail_url: normalizeImageUrl(item.thumbnail_url || item.thumbnailUrl)
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

