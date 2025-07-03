export interface SurgeryDTO {
  id: number;
  name: string;
  surgeryDate?: string;  // optional because of default value in C#
  patientName: string;
  doctorName: string;
}

export interface CreateSurgery {
  name: string;
  description?: string;      // optional because of nullable in C#
  surgeryDate?: string;      // optional, default DateTime.Now in C#
  patientId: number;
  doctorId: number;
  // clinicId?: number;       // uncomment if needed
  // departmentId?: number;   // uncomment if needed
  // positionId?: number;     // uncomment if needed
}

export interface UpdateSurgery {
  name: string;
  description?: string;     // optional (nullable in C#)
  surgeryDate?: string;     // optional because of default value DateTime.Now
  patientId: number;
  doctorId: number;
  // clinicId?: number;     // uncomment if needed
  // departmentId?: number; // uncomment if needed
  // positionId?: number;   // uncomment if needed
}
