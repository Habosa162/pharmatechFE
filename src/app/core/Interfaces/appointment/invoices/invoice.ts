import { PaymentMethod } from "../../all";

export interface InvoiceDto {
  createdAt: string;          // ISO 8601 date string, e.g., "2025-07-03T15:00:00Z"
  totalAmount: number;        // decimal → number
  paidAmount: number;         // decimal → number
  isPaid: boolean;
  paymentMethod: PaymentMethod;
  appointmentId: number;
  clinicName: string;
  patientName: string;
}
export interface AllInvoices {
  id: number;
  createdAt: string;     // ISO 8601 date string
  totalAmount: number;   // decimal → number
  paidAmount: number;    // decimal → number
  isPaid: boolean;
  paymentMethod: PaymentMethod;
}

export interface CreateInvoice {
  appointmentId: number;
  totalAmount: number;
  paidAmount: number;
  isPaid: boolean;          // default false in C#, set when creating object in TS
  paymentMethod: PaymentMethod; // default Cash in C#, set when creating object in TS
}

export interface UpdateInvoice {
  totalAmount: number;
  paidAmount: number;
  paymentMethod: PaymentMethod; // default is Cash in C#, set when creating object in TS
}
