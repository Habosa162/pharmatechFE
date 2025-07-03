export interface MedicationDTO {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string; // optional
}
export interface CreateMedication {
  name: string;
}


