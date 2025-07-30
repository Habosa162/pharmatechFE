import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { NotFoundComponent } from './core/features/not-found/not-found.component';
import { LoginComponent } from './core/features/auth/login/login.component';
import { AppointmentComponent } from './core/features/appointments/appointment/appointment.component';
import { PatientListComponent } from './core/features/patients/patient-list/patient-list.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminDashboardComponent } from './core/features/dashboard/admin-dashboard/admin-dashboard.component';
import { MasterDashboadrComponent } from './core/features/dashboard/master-dashboadr/master-dashboadr.component';
import { EmployeeComponent } from './core/features/employees/employee/employee.component';
import { PatientProfileComponent } from './core/features/patients/patient-profile/patient-profile.component';
import { PatientAppointmentsComponent } from './core/features/patients/patient-appointments/patient-appointments.component';
import { OwnerDashboardComponent } from './core/features/dashboard/owner-dashboard/owner-dashboard.component';
import { DoctorAppointmentsComponent } from './core/features/doctors/doctor-appointments/doctor-appointments.component';
import { MyAppointmentsComponent } from './core/features/appointments/my-appointments/my-appointments.component';
import { DoctorSidebarComponent } from './core/features/doctors/doctor-sidebar';
import { AppointmentListComponent } from './core/features/appointments/appointment-list/appointment-list.component';
import { DoctorListComponent } from './core/features/doctors/doctor-list/doctor-list.component';
import { InvoiceListComponent } from './core/features/billing/invoice-list/invoice-list.component';
import { TransactionsListComponent } from './core/features/transactions/transactions-list/transactions-list.component';
import { InventoryCategoryComponent } from './core/features/inventory/inventory-category/inventory-category.component';
import { InventoryItemsComponent } from './core/features/inventory/inventory-items/inventory-items.component';
import { InventoryTransactionsComponent } from './core/features/inventory/inventory-transactions/inventory-transactions.component';
import { AdminDataManagementComponent } from './core/features/Shared/admin-data-management/admin-data-management.component';
import { OwnerLayoutComponent } from './core/layouts/owner-layout/owner-layout.component';
import { PrescriptionService } from './core/services/patients/prescription.service';
import { PatientPrescriptionComponent } from './core/features/patients/PatientPrescriptions/patient-prescription/patient-prescription.component';
import { AppointmentDetailsComponent } from './core/features/appointments/appointment-details/appointment-details.component';
import { MedicalHistoryComponent } from './core/features/patients/medical-history/medical-history.component';
import { PatientLabTestsComponent } from './core/features/patients/patient-lab-tests/patient-lab-tests.component';
import { PatientMedicalRecordsComponent } from './core/features/patients/patient-medical-records/patient-medical-records.component';
import { PatientSurgeriesComponent } from './core/features/patients/patient-surgeries/patient-surgeries.component';
import { PatientPrescriptionsComponent } from './core/features/patients/patient-prescriptions/patient-prescriptions.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  // {path:'appointments', component: AppointmentComponent},
  // {path:'patients',component:PatientListComponent},



  {
    path: 'admin',
    canActivate: [AuthGuard],
    data: { role: 'Admin' },
    children: [
      {
        path: '',
        component:MasterDashboadrComponent
      },
      {
        path: 'admin-dashboard',
        component:MasterDashboadrComponent
      },
      { path: 'appointments', component: AppointmentListComponent },
      { path: 'doctors', component: DoctorListComponent },
      { path: 'patients', component: PatientListComponent },
      { path: 'appointments', component: AppointmentListComponent },
      { path: 'invoices', component: InvoiceListComponent },
      { path: 'transactions', component: TransactionsListComponent },
      { path: 'inventorycategories', component: InventoryCategoryComponent },
      { path: 'inventoryitmes', component: InventoryItemsComponent },
      { path: 'inventorytransactions', component: InventoryTransactionsComponent },
      { path: 'admin-data-management', component: AdminDataManagementComponent },
      // {path:'patient-medical-history/:patientId', component: MedicalHistoryComponent},
    ]
  },

  {
    path: 'owner',
    canActivate: [AuthGuard],
    data: { role: 'Owner' },
    children: [
      {
        path: '',
        component:MasterDashboadrComponent
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
      {
        path: '',
        component:EmployeeComponent
      }

    ]
  },

  { path: 'patientAppointments/:id', component: PatientAppointmentsComponent },
  { path: 'doctorAppointments/:id', component: DoctorAppointmentsComponent },
  { path: 'MyAppointments', component: MyAppointmentsComponent },
  { path: 'doctorview', component: DoctorSidebarComponent },
  { path: 'prescriptions', component: PatientPrescriptionComponent },
  { path: 'appointment-details/:id', component: AppointmentDetailsComponent },
  // { path: 'appointment', component: AppointmentComponent },

  {path:'patient-medical-history/:id', component: MedicalHistoryComponent},
  {path:'patient-lab-tests/:id', component: PatientLabTestsComponent},
  {path:'patient-medical-records/:id', component: PatientMedicalRecordsComponent},
  {path:'patient-surgeries/:id', component: PatientSurgeriesComponent},
  {path:'patient-prescriptions/:id', component: PatientPrescriptionsComponent},
   {path:'patient-profile/:id', component: PatientProfileComponent},

  { path: '**', component: NotFoundComponent },
];
