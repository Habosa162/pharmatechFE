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
import { TransactionSearchDto, TransactionSortBy, SortDirection } from '../Models/transactions/transactions.model';
import { PagedResult } from '../Models/Helpers/helperModels.model';

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

  // ------------------ DASHBOARD STATS ------------------
  getDashboardStats(): Observable<DashboardStats> {
    const transactionSearchDto: TransactionSearchDto = {
      clinicId: 1,
      pageNumber: 1,
      pageSize: 100,
      sortBy: TransactionSortBy.Date,
      sortDirection: SortDirection.Desc
    };

    return forkJoin({
      patients: this.patientService.getAllPatients().pipe(catchError(() => of([]))),
      doctors: this.accountService.getAllDoctors().pipe(catchError(() => of([]))),
      employees: this.employeeService.getAllEmployees().pipe(catchError(() => of([]))),
      appointments: this.appointmentService.getAppointments().pipe(catchError(() => of([]))),
      transactions: this.transactionService.getAllTransactions(transactionSearchDto)
        .pipe(catchError(() => of({ items: [], totalCount: 0 }))),
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
        const transactionsPaged = data.transactions as PagedResult<any>;
        const transactions = transactionsPaged.items;

        return {
          totalPatients: data.patients.length,
          totalDoctors: data.doctors.length,
          totalEmployees: data.employees.length,
          totalAppointments: appointments.length,
          totalTransactions: transactionsPaged.totalCount,
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

  // ------------------ ROLE BASED STATS ------------------
  getRoleBasedStats(): Observable<RoleBasedStats> {
    const isDoctor = this.authService.isDoctor();
    const isEmployee = this.authService.isEmployee();
    const highestRole = this.authService.getHighestRole();

    const baseStats: RoleBasedStats = {
      role: highestRole || 'USER',
      isDoctor,
      isEmployee
    };

    if (isDoctor) return this.getDoctorStats(baseStats);
    if (isEmployee) return this.getEmployeeStats(baseStats);
    return of(baseStats);
  }

  private getDoctorStats(baseStats: RoleBasedStats): Observable<RoleBasedStats> {
    const userId = this.authService.getUserId();
    if (!userId) return of(baseStats);

    return this.accountService.getDoctoridByUserid(userId).pipe(
      switchMap(data => {
        const doctorId = data.doctorid;
        if (!doctorId) return of(baseStats);

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

  private getEmployeeStats(baseStats: RoleBasedStats): Observable<RoleBasedStats> {
    return of({
      ...baseStats,
      employeeStats: {
        processedPayments: 0,
        processedInvoices: 0,
        customerInteractions: 0
      }
    });
  }

  getRoleDashboardData(): Observable<{ general: DashboardStats; role: RoleBasedStats }> {
    return forkJoin({
      general: this.getDashboardStats(),
      role: this.getRoleBasedStats()
    });
  }

  // ------------------ QUICK STATS ------------------
  getQuickStats(entity: string): Observable<number> {
    switch (entity) {
      case 'patients':
        return this.patientService.getAllPatients().pipe(
          map(p => p.length),
          catchError(() => of(0))
        );
      case 'doctors':
        return this.accountService.getAllDoctors().pipe(
          map(d => d.length),
          catchError(() => of(0))
        );
      case 'appointments':
        return this.appointmentService.getAppointments().pipe(
          map(a => a.length),
          catchError(() => of(0))
        );
      case 'invoices':
        return this.invoiceService.getAllInvoices().pipe(
          map(i => i.length),
          catchError(() => of(0))
        );
      case 'transactions':
        const searchDto: TransactionSearchDto = {
          clinicId: 1,
          pageNumber: 1,
          pageSize: 5,
          sortBy: TransactionSortBy.Date,
          sortDirection: SortDirection.Desc
        };
        return this.transactionService.getAllTransactions(searchDto).pipe(
          map(result => result.totalCount),
          catchError(() => of(0))
        );
      default:
        return of(0);
    }
  }

  getRecentData(entity: string, limit: number = 5): Observable<any[]> {
    switch (entity) {
      case 'patients':
        return this.patientService.getAllPatients().pipe(
          map(p => this.getRecentItems(p, limit)),
          catchError(() => of([]))
        );
      case 'doctors':
        return this.accountService.getAllDoctors().pipe(
          map(d => this.getRecentItems(d, limit)),
          catchError(() => of([]))
        );
      case 'appointments':
        return this.appointmentService.getAppointments().pipe(
          map(a => this.getRecentItems(a, limit)),
          catchError(() => of([]))
        );
      case 'invoices':
        return this.invoiceService.getAllInvoices().pipe(
          map(i => this.getRecentItems(i, limit)),
          catchError(() => of([]))
        );
      case 'transactions':
        const searchDto: TransactionSearchDto = {
          clinicId: 1,
          pageNumber: 1,
          pageSize: limit,
          sortBy: TransactionSortBy.Date,
          sortDirection: SortDirection.Desc
        };
        return this.transactionService.getAllTransactions(searchDto).pipe(
          map(result => this.getRecentItems(result.items, limit)),
          catchError(() => of([]))
        );
      default:
        return of([]);
    }
  }

  // ------------------ HELPERS ------------------
  private calculateTotalRevenue(transactions: any[], invoices: any[]): number {
    const transactionRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    return transactionRevenue; // يمكن إضافة إيرادات الفواتير لو حابب
  }

  private countAppointmentsByStatus(appointments: any[], status: AppointmentStatus): number {
    return appointments.filter(a => a.status === status).length;
  }

  private countInvoicesByStatus(invoices: any[], isPaid: boolean): number {
    return invoices.filter(i => i.isPaid === isPaid).length;
  }

  private getRecentItems(items: any[], limit: number): any[] {
    return items
      .sort((a, b) => new Date(b.createdAt || b.createdDate || 0).getTime() - new Date(a.createdAt || a.createdDate || 0).getTime())
      .slice(0, limit);
  }
}
