import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { NotFoundComponent } from './core/features/not-found/not-found.component';
import { LoginComponent } from './core/features/auth/login/login.component';

import { PatientListComponent } from './core/features/patients/patient-list/patient-list.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminDashboardComponent } from './core/features/dashboard/admin-dashboard/admin-dashboard.component';
import { MasterDashboadrComponent } from './core/features/dashboard/master-dashboadr/master-dashboadr.component';
import { DoctorDashboardComponent } from './core/features/dashboard/doctor-dashboard/doctor-dashboard.component';
import { EmployeeComponent } from './core/features/employees/employee/employee.component';
import { PatientProfileComponent } from './core/features/patients/patient-profile/patient-profile.component';
import { PatientAppointmentsComponent } from './core/features/patients/patient-appointments/patient-appointments.component';
import { OwnerDashboardComponent } from './core/features/dashboard/owner-dashboard/owner-dashboard.component';
import { DoctorAppointmentsComponent } from './core/features/doctors/doctor-appointments/doctor-appointments.component';
import { MyAppointmentsComponent } from './core/features/appointments/my-appointments/my-appointments.component';
import { DoctorSidebarComponent } from './core/features/doctors/doctor-sidebar';

import { DoctorListComponent } from './core/features/doctors/doctor-list/doctor-list.component';
import { InvoiceListComponent } from './core/features/billing/invoice-list/invoice-list.component';
import { InvoiceDetailsComponent } from './core/features/billing/invoice-details/invoice-details.component';
import { InvoiceEditComponent } from './core/features/billing/invoice-edit/invoice-edit.component';


import { AdminDataManagementComponent } from './core/features/Shared/admin-data-management/admin-data-management.component';
import { AppointmentDetailsComponent } from './core/features/appointments/appointment-details/appointment-details.component';
import { MedicalHistoryComponent } from './core/features/patients/medical-history/medical-history.component';
import { PatientLabTestsComponent } from './core/features/patients/patient-lab-tests/patient-lab-tests.component';
import { PatientMedicalRecordsComponent } from './core/features/patients/patient-medical-records/patient-medical-records.component';
import { PatientSurgeriesComponent } from './core/features/patients/patient-surgeries/patient-surgeries.component';
import { PatientPrescriptionsComponent } from './core/features/patients/patient-prescriptions/patient-prescriptions.component';
import { DoctorProfileComponent } from './core/features/doctors/doctor-profile/doctor-profile.component';
import { InventoryComponent } from './core/features/inventory/inventory.component';
import { TransactionComponent } from './core/features/transactions/transaction.component';
import { DepartmentManagementComponent } from './core/features/departments/department-management/department-management.component';
import { PrescriptionDetailsComponent } from './core/features/patients/prescription-details/prescription-details.component';
import { UserManagementComponent } from './core/features/users/user-management/user-management.component';
import { MyAppointmentsClinicComponent } from './core/features/appointments/my-appointments-clinic/my-appointments-clinic.component';
import { AdminLayoutComponent } from './core/layouts/admin-layout/admin-layout.component';
import { MedicalRecordDetailsComponent } from './core/features/patients/medical-record-details/medical-record-details.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  // {path:'appointments', component: AppointmentComponent},
  // {path:'patients',component:PatientListComponent},

  {
    path: 'admin',
    // component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    data: { role: 'Admin' },
    children: [
      // {path:'patient-medical-history/:patientId', component: MedicalHistoryComponent},
      {
        path: '',
        component:MasterDashboadrComponent
      },
      {
        path: 'dashboard',
        component:AdminDashboardComponent
      },
      { path: 'doctors', component: DoctorListComponent },
      { path: 'patients', component: PatientListComponent },
      { path: 'invoices', component: InvoiceListComponent },
      { path: 'users', component: UserManagementComponent },
      { path: 'invoices/:id', component: InvoiceDetailsComponent },
      { path: 'invoices/edit/:id', component: InvoiceEditComponent },
      { path: 'admin-data-management', component: AdminDataManagementComponent },
      { path: 'prescriptions/:id', component: PrescriptionDetailsComponent },
      { path: 'medical-record-details/:id', component: MedicalRecordDetailsComponent },
    ]
  },
  
  {
    path: 'owner',
    canActivate: [AuthGuard],
    data: { role: 'Owner' },
    children: [
      {
        path: '',
        component:OwnerDashboardComponent
      },
    ]
  },

  {
    path: 'master',
    canActivate: [AuthGuard],
    data: { role: 'Master' },
    children: [
      {
        path: '',
        component:MasterDashboadrComponent
      },
      {path: 'masterdashboard', component: MasterDashboadrComponent},
    ]
  },

  {
    path: 'employee',
    canActivate: [AuthGuard],
    data: { role: 'Employee' },
    children: [
      { path: 'dashboard', component: EmployeeComponent },
      { path: 'payments', component: TransactionComponent },
      { path: 'transactions', component: TransactionComponent },
      { path: 'invoices', component: InvoiceListComponent },
      { path: 'customer-service', component: EmployeeComponent },
    ]
  },

  // Doctor-specific routes
  {
    path: 'doctor',
    canActivate: [AuthGuard],
    children: [
      { path: '', component: DoctorDashboardComponent },
      { path: 'dashboard', component: DoctorDashboardComponent },
      { path: 'appointments', component: MyAppointmentsComponent },
      { path: 'patients', component: PatientListComponent },
      { path: 'schedule', component: DoctorSidebarComponent },
      { path: 'medical-records', component: MedicalHistoryComponent },
      { path: 'prescriptions', component: PrescriptionDetailsComponent },
      { path: 'my-appointments', component: MyAppointmentsComponent },
      { path: 'my-patients', component: PatientListComponent },
    ]
  },

  // Accountant-specific routes
  {
    path: 'accountant',
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: EmployeeComponent },
      { path: 'reports', component: EmployeeComponent },
      { path: 'transactions', component: TransactionComponent },
      { path: 'invoices', component: InvoiceListComponent },
      { path: 'tax-reports', component: EmployeeComponent },
      { path: 'budget-planning', component: EmployeeComponent },
    ]
  },

  // User-specific routes
  {
    path: 'user',
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: EmployeeComponent },
      { path: 'appointments', component: MyAppointmentsComponent },
      { path: 'profile', component: PatientProfileComponent },
      { path: 'settings', component: EmployeeComponent },
    ]
  },

  { path: 'patientAppointments/:id', component: PatientAppointmentsComponent },
  { path: 'doctorAppointments/:id', component: DoctorAppointmentsComponent },
  { path: 'MyAppointments', component: MyAppointmentsComponent },
  { path: 'prescriptions/:id', component: PrescriptionDetailsComponent },
  { path: 'appointment-details/:id', component: AppointmentDetailsComponent },
  // { path: 'appointment', component: AppointmentComponent },

  {path:'patient-medical-history/:id', component: MedicalHistoryComponent},
  {path:'patient-lab-tests/:id', component: PatientLabTestsComponent},
  {path:'patient-medical-records/:id', component: PatientMedicalRecordsComponent},
  {path:'patient-surgeries/:id', component: PatientSurgeriesComponent},
  {path:'patient-prescriptions/:id', component: PatientPrescriptionsComponent},
  {path:'patient-profile/:id', component: PatientProfileComponent},
  // {path:'DoctorsList', component: DoctorListComponent},
  {path:'doctors/:id', component: DoctorProfileComponent},
  {path:'medical-record-details/:id', component: MedicalRecordDetailsComponent},

  // New comprehensive inventory and transaction routes
  {path:'inventory', component: InventoryComponent},
  {path:'transactions', component: TransactionComponent},
  {path:'departments', component: DepartmentManagementComponent},
  {path:'allemployees', component: EmployeeComponent},
  {path:'my-appointments-clinic', component: MyAppointmentsClinicComponent},
  { path: 'users', component: UserManagementComponent },
  { path: '**', component: NotFoundComponent },
];
