export interface MedicationDto {
  id:number;
  name: string;
  concentration:string;
  // dosage: string;
  // frequency: string;
  // duration: string;
  // notes?: string; // optional
}
export interface CreateMedication {
  name: string;
  concentration:string;
}


