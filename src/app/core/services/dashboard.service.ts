import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { AccountService } from './account.service';
import { PatientService } from './patients/patient.service';
import { AppointmentService } from './appintments/appointment.service';
import { EmployeeService } from './employees/employee.service';
import { TransactionService } from './transactions/transaction.service';
import { InvoiceService } from './appintments/invoice.service';
import { SurgeryService } from './patients/surgery.service';
import { LabtestService } from './clinics/labtest.service';
import { MedicationService } from './clinics/medication.service';
import { PositionService } from './employees/position.service';
import { DepartmentService } from './clinics/department.service';
import { AppointmentStatus } from '../Interfaces/all';
import { MedicalrecordService } from './patients/medicalrecord.service';

export interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  totalEmployees: number;
  totalAppointments: number;
  totalTransactions: number;
  totalInvoices: number;
  totalRevenue: number;
  totalMedicalRecords: number;
  totalSurgeries: number;
  totalLabTests: number;
  totalMedications: number;
  totalPositions: number;
  totalDepartments: number;
  pendingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  paidInvoices: number;
  unpaidInvoices: number;
  recentTransactions: any[];
  recentInvoices: any[];
  recentAppointments: any[];
  recentPatients: any[];
  recentDoctors: any[];
  recentEmployees: any[];
}

export interface RoleBasedStats {
  role: string;
  isDoctor: boolean;
  isEmployee: boolean;
  doctorId?: number;
  employeeId?: number;
  doctorStats?: {
    myPatients: number;
    myAppointments: number;
    mySurgeries: number;
    myMedicalRecords: number;
  };
  employeeStats?: {
    processedPayments: number;
    processedInvoices: number;
    customerInteractions: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private patientService: PatientService,
    private appointmentService: AppointmentService,
    private employeeService: EmployeeService,
    private transactionService: TransactionService,
    private invoiceService: InvoiceService,
    private medicalRecordService: MedicalrecordService,
    private surgeryService: SurgeryService,
    private labtestService: LabtestService,
    private medicationService: MedicationService,
    private positionService: PositionService,
    private departmentService: DepartmentService
  ) {}

  // Get comprehensive dashboard statistics for all users
  getDashboardStats(): Observable<DashboardStats> {
    return forkJoin({
      patients: this.patientService.getAllPatients().pipe(catchError(() => of([]))),
      doctors: this.accountService.getAllDoctors().pipe(catchError(() => of([]))),
      employees: this.employeeService.getAllEmployees().pipe(catchError(() => of([]))),
      appointments: this.appointmentService.getAppointments().pipe(catchError(() => of([]))),
      transactions: this.transactionService.getAllTransactions().pipe(catchError(() => of([]))),
      invoices: this.invoiceService.getAllInvoices().pipe(catchError(() => of([]))),
      medicalRecords: this.medicalRecordService.getAllMedicalRecords().pipe(catchError(() => of([]))),
      surgeries: this.surgeryService.getAllSurgeries().pipe(catchError(() => of([]))),
      labTests: this.labtestService.getAllLabtests().pipe(catchError(() => of([]))),
      medications: this.medicationService.getAllMedications().pipe(catchError(() => of([]))),
      positions: this.positionService.getAllPositions().pipe(catchError(() => of([]))),
      departments: this.departmentService.getAllDepartments().pipe(catchError(() => of([])))
    }).pipe(
      map(data => {
        const appointments = data.appointments as any[];
        const invoices = data.invoices as any[];
        const transactions = data.transactions as any[];

        console.log('Dashboard Data:', {
          patients: data.patients.length,
          doctors: data.doctors.length,
          employees: data.employees.length,
          appointments: appointments.length,
          transactions: transactions.length,
          invoices: invoices.length
        });

        return {
          totalPatients: data.patients.length,
          totalDoctors: data.doctors.length,
          totalEmployees: data.employees.length,
          totalAppointments: appointments.length,
          totalTransactions: transactions.length,
          totalInvoices: invoices.length,
          totalRevenue: this.calculateTotalRevenue(transactions, invoices),
          totalMedicalRecords: data.medicalRecords.length,
          totalSurgeries: data.surgeries.length,
          totalLabTests: data.labTests.length,
          totalMedications: data.medications.length,
          totalPositions: data.positions.length,
          totalDepartments: data.departments.length,
          pendingAppointments: this.countAppointmentsByStatus(appointments, AppointmentStatus.Scheduled),
          completedAppointments: this.countAppointmentsByStatus(appointments, AppointmentStatus.Completed),
          cancelledAppointments: this.countAppointmentsByStatus(appointments, AppointmentStatus.Cancelled),
          paidInvoices: this.countInvoicesByStatus(invoices, true),
          unpaidInvoices: this.countInvoicesByStatus(invoices, false),
          recentTransactions: this.getRecentItems(transactions, 5),
          recentInvoices: this.getRecentItems(invoices, 5),
          recentAppointments: this.getRecentItems(appointments, 5),
          recentPatients: this.getRecentItems(data.patients, 5),
          recentDoctors: this.getRecentItems(data.doctors, 5),
          recentEmployees: this.getRecentItems(data.employees, 5)
        };
      })
    );
  }

  // Get role-based statistics for specific user types
  getRoleBasedStats(): Observable<RoleBasedStats> {
    const userData = this.authService.getUserFullData();
    const isDoctor = this.authService.isDoctor();
    const isEmployee = this.authService.isEmployee();
    const highestRole = this.authService.getHighestRole();

    console.log('Role Based Stats - User Data:', {
      userData,
      isDoctor,
      isEmployee,
      highestRole
    });

    const baseStats: RoleBasedStats = {
      role: highestRole || 'USER',
      isDoctor,
      isEmployee
    };

    if (isDoctor) {
      return this.getDoctorStats(baseStats);
    } else if (isEmployee) {
      return this.getEmployeeStats(baseStats);
    } else {
      return of(baseStats);
    }
  }

  // Get doctor-specific statistics
  private getDoctorStats(baseStats: RoleBasedStats): Observable<RoleBasedStats> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return of(baseStats);
    }

    return this.accountService.getDoctoridByUserid(userId).pipe(
      switchMap(data => {
        const doctorId = data.doctorid;
        if (!doctorId) {
          return of(baseStats);
        }

        baseStats.doctorId = doctorId;
        
        return forkJoin({
          patients: this.patientService.getPatientsByDoctorId(doctorId).pipe(catchError(() => of([]))),
          appointments: this.appointmentService.getDoctorAppointments(doctorId).pipe(catchError(() => of([]))),
          surgeries: this.surgeryService.getSurgeriesByDoctorId(doctorId).pipe(catchError(() => of([]))),
          medicalRecords: this.medicalRecordService.getAllMedicalRecords().pipe(catchError(() => of([])))
        }).pipe(
          map(doctorData => ({
            ...baseStats,
            doctorStats: {
              myPatients: doctorData.patients.length,
              myAppointments: doctorData.appointments.length,
              mySurgeries: doctorData.surgeries.length,
              myMedicalRecords: doctorData.medicalRecords.length
            }
          }))
        );
      })
    );
  }

  // Get employee-specific statistics
  private getEmployeeStats(baseStats: RoleBasedStats): Observable<RoleBasedStats> {
    // For now, return basic stats. You can implement employee-specific logic later
    return of({
      ...baseStats,
      employeeStats: {
        processedPayments: 0,
        processedInvoices: 0,
        customerInteractions: 0
      }
    });
  }

  // Get dashboard data for specific role
  getRoleDashboardData(): Observable<{ general: DashboardStats; role: RoleBasedStats }> {
    return forkJoin({
      general: this.getDashboardStats(),
      role: this.getRoleBasedStats()
    });
  }

  // Get quick statistics for specific entity
  getQuickStats(entity: string): Observable<number> {
    switch (entity) {
      case 'patients':
        return this.patientService.getAllPatients().pipe(
          map(patients => patients.length),
          catchError(() => of(0))
        );
      case 'doctors':
        return this.accountService.getAllDoctors().pipe(
          map(doctors => doctors.length),
          catchError(() => of(0))
        );
      case 'appointments':
        return this.appointmentService.getAppointments().pipe(
          map(appointments => appointments.length),
          catchError(() => of(0))
        );
      case 'invoices':
        return this.invoiceService.getAllInvoices().pipe(
          map(invoices => invoices.length),
          catchError(() => of(0))
        );
      case 'transactions':
        return this.transactionService.getAllTransactions().pipe(
          map(transactions => transactions.length),
          catchError(() => of(0))
        );
      default:
        return of(0);
    }
  }

  // Get recent data for specific entity
  getRecentData(entity: string, limit: number = 5): Observable<any[]> {
    switch (entity) {
      case 'patients':
        return this.patientService.getAllPatients().pipe(
          map(patients => this.getRecentItems(patients, limit)),
          catchError(() => of([]))
        );
      case 'doctors':
        return this.accountService.getAllDoctors().pipe(
          map(doctors => this.getRecentItems(doctors, limit)),
          catchError(() => of([]))
        );
      case 'appointments':
        return this.appointmentService.getAppointments().pipe(
          map(appointments => this.getRecentItems(appointments, limit)),
          catchError(() => of([]))
        );
      case 'invoices':
        return this.invoiceService.getAllInvoices().pipe(
          map(invoices => this.getRecentItems(invoices, limit)),
          catchError(() => of([]))
        );
      case 'transactions':
        return this.transactionService.getAllTransactions().pipe(
          map(transactions => this.getRecentItems(transactions, limit)),
          catchError(() => of([]))
        );
      default:
        return of([]);
    }
  }

  // Helper methods
  private calculateTotalRevenue(transactions: any[], invoices: any[]): number {
    const transactionRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const invoiceRevenue = invoices.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
    return transactionRevenue + invoiceRevenue;
  }

  private countAppointmentsByStatus(appointments: any[], status: AppointmentStatus): number {
    console.log('Counting appointments by status:', status, 'Appointments:', appointments);
    return appointments.filter(apt => apt.status === status).length;
  }

  private countInvoicesByStatus(invoices: any[], isPaid: boolean): number {
    return invoices.filter(inv => inv.isPaid === isPaid).length;
  }

  private getRecentItems(items: any[], limit: number): any[] {
    return items
      .sort((a, b) => new Date(b.createdAt || b.createdDate || 0).getTime() - new Date(a.createdAt || a.createdDate || 0).getTime())
      .slice(0, limit);
  }

  // Get financial summary
  getFinancialSummary(): Observable<{
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    monthlyRevenue: number;
    monthlyExpenses: number;
  }> {
    return forkJoin({
      transactions: this.transactionService.getAllTransactions().pipe(catchError(() => of([]))),
      invoices: this.invoiceService.getAllInvoices().pipe(catchError(() => of([])))
    }).pipe(
      map(data => {
        const transactions = data.transactions as any[];
        const invoices = data.invoices as any[];

        const totalRevenue = transactions
          .filter(t => t.type === 1) // Income
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        const totalExpenses = transactions
          .filter(t => t.type === 2) // Expense
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        const invoiceRevenue = invoices
          .filter(i => i.isPaid)
          .reduce((sum, i) => sum + (i.paidAmount || 0), 0);

        const totalTotalRevenue = totalRevenue + invoiceRevenue;
        const netProfit = totalTotalRevenue - totalExpenses;

        // Calculate monthly figures (simplified)
        const currentMonth = new Date().getMonth();
        const monthlyRevenue = transactions
          .filter(t => t.type === 1 && new Date(t.date).getMonth() === currentMonth)
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        const monthlyExpenses = transactions
          .filter(t => t.type === 2 && new Date(t.date).getMonth() === currentMonth)
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        return {
          totalRevenue: totalTotalRevenue,
          totalExpenses,
          netProfit,
          monthlyRevenue,
          monthlyExpenses
        };
      })
    );
  }

  // Get appointment statistics
  getAppointmentStats(): Observable<{
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  }> {
    return this.appointmentService.getAppointments().pipe(
      map(appointments => {
        const total = appointments.length;
        console.log('Appointment Stats - All appointments:', appointments);
        
        const pending = appointments.filter(apt => apt.status === AppointmentStatus.Scheduled).length;
        const completed = appointments.filter(apt => apt.status === AppointmentStatus.Completed).length;
        const cancelled = appointments.filter(apt => apt.status === AppointmentStatus.Cancelled).length;

        const today = new Date();
        const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const todayCount = appointments.filter(apt => 
          new Date(apt.appointmentDate).toDateString() === today.toDateString()
        ).length;

        const weekCount = appointments.filter(apt => 
          new Date(apt.appointmentDate) >= thisWeek
        ).length;

        const monthCount = appointments.filter(apt => 
          new Date(apt.appointmentDate) >= thisMonth
        ).length;

        return {
          total,
          pending,
          completed,
          cancelled,
          today: todayCount,
          thisWeek: weekCount,
          thisMonth: monthCount
        };
      }),
      catchError(() => of({
        total: 0,
        pending: 0,
        completed: 0,
        cancelled: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0
      }))
    );
  }
} 