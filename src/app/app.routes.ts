import { Routes } from '@angular/router';
import { NotFoundComponent } from './core/features/not-found/not-found.component';
import { LoginComponent } from './core/features/auth/login/login.component';

import { PatientListComponent } from './core/features/patients/patient-list/patient-list.component';
import { PatientProfileComponent } from './core/features/patients/patient-profile/patient-profile.component';
import { PatientAppointmentsComponent } from './core/features/patients/patient-appointments/patient-appointments.component';
import { MedicalHistoryComponent } from './core/features/patients/medical-history/medical-history.component';
import { PatientLabTestsComponent } from './core/features/patients/patient-lab-tests/patient-lab-tests.component';
import { PatientMedicalRecordsComponent } from './core/features/patients/patient-medical-records/patient-medical-records.component';
import { PatientSurgeriesComponent } from './core/features/patients/patient-surgeries/patient-surgeries.component';
import { PatientPrescriptionsComponent } from './core/features/patients/patient-prescriptions/patient-prescriptions.component';
import { PrescriptionDetailsComponent } from './core/features/patients/prescription-details/prescription-details.component';
import { MedicalRecordDetailsComponent } from './core/features/patients/medical-record-details/medical-record-details.component';

import { AdminDashboardComponent } from './core/features/dashboard/admin-dashboard/admin-dashboard.component';
import { MasterDashboadrComponent } from './core/features/dashboard/master-dashboadr/master-dashboadr.component';
import { DoctorDashboardComponent } from './core/features/dashboard/doctor-dashboard/doctor-dashboard.component';
import { OwnerDashboardComponent } from './core/features/dashboard/owner-dashboard/owner-dashboard.component';

import { DoctorListComponent } from './core/features/doctors/doctor-list/doctor-list.component';
import { DoctorProfileComponent } from './core/features/doctors/doctor-profile/doctor-profile.component';
import { DoctorAppointmentsComponent } from './core/features/doctors/doctor-appointments/doctor-appointments.component';
import { DoctorSidebarComponent } from './core/features/doctors/doctor-sidebar';

import { AppointmentDetailsComponent } from './core/features/appointments/appointment-details/appointment-details.component';
import { MyAppointmentsComponent } from './core/features/appointments/my-appointments/my-appointments.component';
import { MyAppointmentsClinicComponent } from './core/features/appointments/my-appointments-clinic/my-appointments-clinic.component';
import { ServicesComponent } from './core/features/appointments/services/services.component';

import { InvoiceListComponent } from './core/features/billing/invoice-list/invoice-list.component';
import { InvoiceDetailsComponent } from './core/features/billing/invoice-details/invoice-details.component';
import { InvoiceEditComponent } from './core/features/billing/invoice-edit/invoice-edit.component';

import { TransactionComponent } from './core/features/reports/transactions/transaction.component';
import { MonthlyReportComponent } from './core/features/reports/monthly-report/monthly-report.component';
import { DoctorDepartmentReportComponent } from './core/features/reports/doctor-department-report/doctor-department-report.component';
import { HalfMonthReportComponent } from './core/features/reports/half-month-report/half-month-report.component';

import { EmployeeComponent } from './core/features/employees/employee/employee.component';
import { UserManagementComponent } from './core/features/users/user-management/user-management.component';
import { DepartmentManagementComponent } from './core/features/departments/department-management/department-management.component';
import { InventoryComponent } from './core/features/inventory/inventory.component';
import { AdminDataManagementComponent } from './core/features/Shared/admin-data-management/admin-data-management.component';

import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { ownerGuard } from './core/guards/owner.guard';
import { ReceptionistGuard } from './core/guards/receptionist.guard';
import { MasterGuard } from './core/guards/master.guard';
import { AccountantGuard } from './core/guards/accountant.guard';
import { DoctorGuard } from './core/guards/doctor.guard';
// TODO: create DoctorGuard and AccountantGuard


export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // ─────────────────────────────────────────────
  // MASTER  (system-wide, no clinic scope)
  // ─────────────────────────────────────────────
  {
    path: 'master',
    canActivate: [AuthGuard, MasterGuard],
    children: [
      { path: '',              component: MasterDashboadrComponent },
      { path: 'dashboard',     component: MasterDashboadrComponent },
    ]
  },

  // ─────────────────────────────────────────────
  // ADMIN  (full clinic management)
  // ─────────────────────────────────────────────
  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    children: [
      { path: '',                         component: AdminDashboardComponent },
      { path: 'dashboard',                component: AdminDashboardComponent },

      // Doctors
      { path: 'doctors',                  component: DoctorListComponent },
      { path: 'doctors/:id',              component: DoctorProfileComponent },

      // Patients
      { path: 'patients',                 component: PatientListComponent },
      { path: 'patients/:id/profile',     component: PatientProfileComponent },
      { path: 'patients/:id/appointments',component: PatientAppointmentsComponent },
      { path: 'patients/:id/medical-history',    component: MedicalHistoryComponent },
      { path: 'patients/:id/lab-tests',          component: PatientLabTestsComponent },
      { path: 'patients/:id/medical-records',    component: PatientMedicalRecordsComponent },
      { path: 'patients/:id/surgeries',          component: PatientSurgeriesComponent },
      { path: 'patients/:id/prescriptions',      component: PatientPrescriptionsComponent },

      // Appointments & Medical records
      { path: 'appointments/:id',         component: AppointmentDetailsComponent },
      { path: 'medical-records/:id',      component: MedicalRecordDetailsComponent },
      { path: 'prescriptions/:id',        component: PrescriptionDetailsComponent },

      // Billing
      { path: 'invoices',                 component: InvoiceListComponent },
      { path: 'invoices/:id',             component: InvoiceDetailsComponent },
      { path: 'invoices/edit/:id',        component: InvoiceEditComponent },
      { path: 'services',                 component: ServicesComponent },

      // Finance
      { path: 'transactions',             component: TransactionComponent },
      { path: 'inventory',                component: InventoryComponent },

      // Staff & Org
      { path: 'employees',                component: EmployeeComponent },
      { path: 'departments',              component: DepartmentManagementComponent },
      { path: 'users',                    component: UserManagementComponent },

      // Reports
      { path: 'reports/monthly',          component: MonthlyReportComponent },
      { path: 'reports/doctors',          component: DoctorDepartmentReportComponent },
      { path: 'reports/half-month',       component: HalfMonthReportComponent },

      // Data management
      { path: 'data-management',          component: AdminDataManagementComponent },
    ]
  },

  // ─────────────────────────────────────────────
  // OWNER  (clinic owner — read-heavy, reporting)
  // ─────────────────────────────────────────────
  {
    path: 'owner',
    canActivate: [AuthGuard, ownerGuard],
    children: [
      { path: '',                         component: OwnerDashboardComponent },

      // Doctors
      { path: 'doctors',                  component: DoctorListComponent },
      { path: 'doctors/:id',              component: DoctorProfileComponent },

      // Patients
      { path: 'patients',                 component: PatientListComponent },

      // Reports
      { path: 'reports/monthly',          component: MonthlyReportComponent },
      { path: 'reports/doctors',          component: DoctorDepartmentReportComponent },
      { path: 'reports/half-month',       component: HalfMonthReportComponent },
    ]
  },

  // ─────────────────────────────────────────────
  // RECEPTIONIST  (front desk operations)
  // ─────────────────────────────────────────────
  {
    path: 'receptionist',
    canActivate: [AuthGuard, ReceptionistGuard],
    children: [
      // Appointments
      { path: 'appointments',             component: MyAppointmentsClinicComponent },
      { path: 'appointments/:id',         component: AppointmentDetailsComponent },

      // Patients
      { path: 'patients',                 component: PatientListComponent },
      { path: 'patients/:id/profile',     component: PatientProfileComponent },
      { path: 'patients/:id/appointments',component: PatientAppointmentsComponent },

      // Billing & Finance
      { path: 'invoices',                 component: InvoiceListComponent },
      { path: 'invoices/:id',             component: InvoiceDetailsComponent },
      { path: 'transactions',             component: TransactionComponent },

      // Services
      { path: 'services',                 component: ServicesComponent },
    ]
  },

  // ─────────────────────────────────────────────
  // DOCTOR  (clinical work)
  // TODO: replace AuthGuard with a dedicated DoctorGuard
  // ─────────────────────────────────────────────
  {
    path: 'doctor',
    canActivate: [AuthGuard,DoctorGuard], // TODO: DoctorGuard
    children: [
      { path: '',                         component: DoctorDashboardComponent },
      { path: 'dashboard',                component: DoctorDashboardComponent },

      // Appointments
      { path: 'appointments',             component: MyAppointmentsComponent },
      { path: 'appointments/:id',         component: AppointmentDetailsComponent },
      { path: 'schedule',                 component: DoctorSidebarComponent },

      // Patients
      { path: 'patients',                 component: PatientListComponent },
      { path: 'patients/:id/profile',     component: PatientProfileComponent },
      { path: 'patients/:id/medical-history',   component: MedicalHistoryComponent },
      { path: 'patients/:id/medical-records',   component: PatientMedicalRecordsComponent },
      { path: 'patients/:id/prescriptions',     component: PatientPrescriptionsComponent },
      { path: 'patients/:id/lab-tests',         component: PatientLabTestsComponent },
      { path: 'patients/:id/surgeries',         component: PatientSurgeriesComponent },

      // Records & prescriptions
      { path: 'medical-records/:id',      component: MedicalRecordDetailsComponent },
      { path: 'prescriptions/:id',        component: PrescriptionDetailsComponent },
    ]
  },

  // ─────────────────────────────────────────────
  // ACCOUNTANT  (finance & reporting)
  // TODO: replace AuthGuard with a dedicated AccountantGuard
  // ─────────────────────────────────────────────
  {
    path: 'accountant',
    canActivate: [AuthGuard,AccountantGuard], // TODO: AccountantGuard
    children: [
      { path: '',                         component: EmployeeComponent },
      { path: 'dashboard',                component: EmployeeComponent },
      { path: 'transactions',             component: TransactionComponent },
      { path: 'invoices',                 component: InvoiceListComponent },
      { path: 'invoices/:id',             component: InvoiceDetailsComponent },
      { path: 'reports/monthly',          component: MonthlyReportComponent },
      { path: 'reports/half-month',       component: HalfMonthReportComponent },
      // TODO: tax-reports and budget-planning need their own components
    ]
  },

  // ─────────────────────────────────────────────
  // FALLBACK
  // ─────────────────────────────────────────────
  { path: '**', component: NotFoundComponent },
];