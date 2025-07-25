export interface MedicalHistory {
  id: number;
  patientid: number;
  allergies?: string[];
  chronicDiseases?: string[];
  surgeries?: string[];
  familyHistory: string;
  medications?: string[];
  notes: string;
  recordDate: string; // ISO string
}

export interface CreateMedicalHistoryDTO {
  patientId: number;
  allergies?: string[];
  chronicDiseases?: string[];
  surgeries?: string[];
  familyHistory: string;
  medications?: string[];
  notes: string;
}

export interface UpdateMedicalHistoryDTO {
  allergies?: string[];
  chronicDiseases?: string[];
  surgeries?: string[];
  familyHistory: string;
  medications?: string[];
  notes: string;
}