import { MedicationDTO } from "../../clinic/medications/medication";

export interface Prescription {
  diagnosis: string;
  prescriptionDate: string; // ISO 8601 format, e.g., "2025-07-03T12:00:00Z"
  followUpDate: string;     // Same format as above
  patientName: string;
  doctorName: string;
  clinicName: string;
  medications: MedicationDTO[];
}

export interface AllPrescriptions {
  id: number;
  diagnosis: string;
  prescriptionDate: string; // ISO 8601 string (e.g., "2025-07-03T12:00:00Z")
  medicalRecordId: number;
  patientName: string;
  doctorName: string;
  clinicName: string;
}

export interface PrescriptionMedication {
  id: number;
  diagnosis: string;
  prescriptionDate: string; // ISO 8601 format e.g. "2025-07-03T15:00:00Z"
  followUpDate: string;     // ISO format as well
  patientName: string;
  doctorName: string;
  clinicName: string;
  medications: MedicationDTO[];
}

export interface CreatePrescription {
  diagnosis: string;
  prescriptionDate: string; // ISO 8601 format, e.g., "2025-07-03T14:00:00Z"
  followUpDate: string;     // Same format
  medicalRecordId: number;
  medicationsIds: number[]; // IDs of selected medications
}

export interface UpdatePrescription {
  diagnosis: string;
  prescriptionDate?: string; // ISO 8601 date string, optional because of default value in C#
  followUpDate: string;      // ISO 8601 date string
  medicationsIds: number[];
}
