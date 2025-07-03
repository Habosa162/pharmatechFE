import { Prescription } from "../prescriptions/prescription";


export interface Medicalrecord {
  visitDate: string; // ISO 8601 format, e.g., "2025-07-03T14:30:00Z"
  notes?: string; // optional
  doctorName: string;
  patientName: string;
  prescriptions: Prescription[];
  labtestsCount: number;
}

export interface Allmedicalrecords {
  id: number;
  visitDate: string; // ISO 8601 format, e.g., "2025-07-03T10:00:00Z"
  doctorName: string;
  patientName: string;
  prescriptionsCount: number;
  labtestsCount: number;
}

export interface Createmedicalrecord{
  visitDate: string; // ISO 8601 format, e.g., "2025-07-03T14:30:00Z"
  notes?: string; // optional
  appointmentId: number;
  patientId: number;
}

export interface Updatemedicalrecord{
  visitDate: string; // ISO 8601 format, e.g., "2025-07-03T14:30:00Z"
  notes?: string; // optional
  doctorId: number;
}


