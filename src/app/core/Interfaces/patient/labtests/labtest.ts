
export interface LabtestDto {
  id: number;
  name: string;
  reference: string;
  // testDate: Date; // ISO 8601 date string, e.g. '2025-07-03T12:34:56Z'
  // patientName: string;
  // medicalRecordId: number;
}
export interface AddLabtest {
  name: string;
  reference: string;
  // testDate: Date; // ISO date-time string (e.g., "2025-07-03T10:15:30Z")
  // medicalRecordId: number;
}
export interface UpdateLabtest {
  name: string;
  reference: string;
  // testDate: Date; // ISO date-time string (e.g., "2025-07-03T10:15:30Z")
}
