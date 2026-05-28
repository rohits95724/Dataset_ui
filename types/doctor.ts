export interface Registration {
  id?: number;
  council_name: string;
  registration_no: string;
  registration_date: string;
  due_date: string;
  is_renewable: string;
  is_nuid: boolean;
  council_status: string;
  status: string;
}

export interface Qualification {
  id?: number;
  course_name: string;
  country_name?: string;
  college_name: string;
  university_name: string;
  qualification_year: number;
  qualification_month?: string;
  active: boolean;
}

export interface Workplace {
  id?: number;
  facility_name?: string;
  facility_type?: string;
  facility_ownership?: string;
  district_name?: string;
  state_name?: string;
  facility_lat?: number;
  facility_long?: number;
}

export interface Doctor {
  id: string | number;
  doctorName: string;
  gender: string;
  hprSpecialitys: string;
  systemOfMedicine: string;
  doctorMedicalQualifications___courseId_name: string;
  workExperienceInYear: number;
  hprWorkDetails___districtName: string;
  currentCity?: string;
  hprWorkDetails___stateName: string;
  stateMedicalCouncil: string;
  piLanguage: string;
  hprWorkDetails___facilityOwnership: string;
  hospitalName: string;
  registrationNumber: string;
  registrationYear: number;
  registrationStatus: string;
  status: string;
  phoneNumber: string;
  email: string;
  doctorType: string;
  isRegistrationVerified: boolean;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  isQualificationsVerified: boolean;
  isWorkVerified: boolean;

  // Additional detail fields from live API response
  hprId?: string;
  applicationStatus?: string;
  areYouCurrentlyWorking?: boolean;
  profileCompleted?: boolean;
  emailOfficial?: string;
  emailPublic?: string;
  publicMobileNumber?: string;
  registrations?: Registration[];
  qualificationsDomestic?: Qualification[];
  qualificationsInternational?: Qualification[];
  workplaces?: Workplace[];

  // Nested backend database columns / specific fields
  "doctors_work.facilityLat"?: number;
  "doctors_work.facilityLong"?: number;
  "doctors_main.stateName"?: string;
  "doctors_work.verificationStatus"?: string;
  "doctors_main.governmentEmployee"?: boolean;
  "doctors_work.facilityType"?: string;
  "doctors_work.facilityOwnership"?: string;
  "doctors_qualifications.collegeId.name"?: string;
  isForeignEducated?: boolean;
}

export interface PaginatedDoctorsResponse {
  items: Doctor[];
  next_cursor: number | null;
}

export interface FilterOptionsResponse {
  states: string[];
  genders: string[];
  system_of_medicine: string[];
  facility_types: string[];
  ownerships: string[];
  specialties: string[];
  workplace_verification_statuses: string[];
  colleges: string[];
}
