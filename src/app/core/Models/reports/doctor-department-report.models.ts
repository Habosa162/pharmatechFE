
export interface DoctorDepartmentReportDto {
  clinicName: string;
  generatedAt: string;
  totalDoctors: number;
  activeDoctors: number;
  inactiveDoctors: number;
  departments: DepartmentReportDto[];
  allDoctors: DoctorDetailDto[];
}

export interface DepartmentReportDto {
  departmentName: string;
  isActive: boolean;
  totalDoctors: number;
  totalAppointments: number;
  totalRevenue: number;
  topDoctor: DoctorDetailDto | null;
  doctors: DoctorDetailDto[];
}

export interface DoctorDetailDto {
  name: string;
  specialization: string;
  phoneNumber: string;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
  departments: string[];
  appointmentCount: number;
  revenuePercentage: number;
  revenueContribution: number;
}

// models/half-month-report.models.ts
export interface HalfMonthReportDto {
  clinicName: string;
  generatedAt: string;
  periodFrom: string;
  periodTo: string;
  periodLabel: string;
  financial: FinancialSummaryDto;
  doctorActivity: DoctorActivitySummaryDto;
}

// Re-export shared types (already defined in monthly-report.models.ts)
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
