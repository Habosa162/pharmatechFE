import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { NotFoundComponent } from './core/features/not-found/not-found.component';
import { LoginComponent } from './core/features/auth/login/login.component';
import { AppointmentComponent } from './core/features/appointments/appointment/appointment.component';
import { PatientListComponent } from './core/features/patients/patient-list/patient-list.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminDashboardComponent } from './core/features/dashboard/admin-dashboard/admin-dashboard.component';
import { MasterDashboadrComponent } from './core/features/Master/master-dashboadr/master-dashboadr.component';
import { EmployeeComponent } from './core/features/employees/employee/employee.component';
import { PatientProfileComponent } from './core/features/patients/patient-profile/patient-profile.component';
import { PatientAppointmentsComponent } from './core/features/patients/patient-appointments/patient-appointments.component';
import { OwnerDashboardComponent } from './core/features/dashboard/owner-dashboard/owner-dashboard.component';
import { DoctorAppointmentsComponent } from './core/features/doctors/doctor-appointments/doctor-appointments.component';
import { MyAppointmentsComponent } from './core/features/appointments/my-appointments/my-appointments.component';
import { DoctorSidebarComponent } from './core/features/doctors/doctor-sidebar';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {path:'appointments', component: AppointmentComponent},
  {path:'patients',component:PatientListComponent},



  {
    path: 'admin',
    canActivate: [AuthGuard],
    data: { role: 'Admin' },
    children: [
      {
        path: '',
        component:AdminDashboardComponent
      },
      {path:'patient-profile/:id', component: PatientProfileComponent},
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
      }
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
  

  { path: '**', component: NotFoundComponent },
];
