import { PaymentMethod } from "../../all";

export interface InvoiceDto {
  id: number;
  createdAt: string;          // ISO 8601 date string, e.g., "2025-07-03T15:00:00Z"
  totalAmount: number;        // decimal → number
 

  paymentMethod: PaymentMethod | string; // Backend returns string, frontend displays
  patientId?:number;
  doctorId:number;
  departmentId:number;
  description?:string;
  serviceId:number;
  clinicName: string;
  patientName: string;
}
export interface AllInvoices {
  id: number;
  createdAt: string;     // ISO 8601 date string
  totalAmount: number;   // decimal → number
  patientId?:number;
  doctorId:number;
  departmentId:number;
  description?:string;
  serviceId:number;
  paymentMethod: PaymentMethod | string; // Backend returns string, frontend displays
  clinicId?:number;
  clinicName?: string;
}

export interface CreateInvoice {

  patenId?:number;
  doctorId:number;
  departmentId:number;
  description?:string;
  serviceId:number
  totalAmount: number;
  paymentMethod: PaymentMethod; // Send enum value (number) to backend
}

export interface UpdateInvoice {
  totalAmount: number;
  // paidAmount: number;
  paymentMethod: PaymentMethod; // Send enum value to backend
}
