import { Gender } from "../../all";

export interface PatientDto {
  name: string;
  phoneNumber: string;
  dateOfBirth: string; // Use ISO 8601 date string format (e.g., '1990-01-01')
  gender: Gender; // You need to define the Gender enum/type separately
  surgeryCount: number;
  medicalRecordsCount: number;
  appointmentsCount: number;
  clinicIds: number[];
}

export interface CreatePatient {
  name: string;
  phoneNumber: string;
  dateofBirth: string; // Use ISO 8601 date string format (e.g., '1990-01-01')
  gender : Gender;
}

export interface UpdatePatient {
  id: number;
  name: string;
  phoneNumber: string;
  dateofBirth: string; // Use ISO 8601 date string format (e.g., '1990-01-01')
  gender : Gender;
}
