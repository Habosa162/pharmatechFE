
export interface MonthlyReportDto {
  clinicName: string;
  month: number;
  year: number;
  generatedAt: string;
  financial: FinancialSummaryDto;
  doctorActivity: DoctorActivitySummaryDto;
}

export interface FinancialSummaryDto {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  categoryBreakdown: CategoryBreakdownDto[];
  invoiceSummary: InvoiceSummaryDto;
}

export interface CategoryBreakdownDto {
  categoryName: string;
  totalAmount: number;
  type: 'Income' | 'Expense';
}

export interface InvoiceSummaryDto {
  totalInvoices: number;
  totalInvoiceAmount: number;
  cashAmount: number;
  otherAmount: number;
  topInvoices: InvoiceRowDto[];
}

export interface InvoiceRowDto {
  patientName: string;
  serviceName: string;
  doctorName: string;
  amount: number;
  paymentMethod: string;
  date: string;
}

export interface DoctorActivitySummaryDto {
  totalActiveDoctors: number;
  totalAppointments: number;
  doctors: DoctorStatsDto[];
}

export interface DoctorStatsDto {
  name: string;
  specialization: string;
  departments: string[];
  appointmentCount: number;
  revenuePercentage: number;
  revenueContribution: number;
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];






