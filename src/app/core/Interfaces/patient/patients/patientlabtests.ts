export interface PatientLabTestDTO {
  id:number;
  result: string;
  testDate: Date;
  labTestName: string;
  patientName: string;
  status: PatientLabTestStatus;
}

export interface CreatePatientLabTestDTO {
  labTestId: number;
  patientId: number;
}

export interface UpdatePatientLabTestDTO {
  result: string;
}

export enum PatientLabTestStatus {
  Pending = 0,
  Completed = 1,
  Cancelled = 2
}

