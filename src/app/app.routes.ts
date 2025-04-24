import { Routes } from '@angular/router';
import { NotFoundComponent } from './core/features/not-found/not-found.component';
import { LoginComponent } from './core/features/auth/login/login.component';
import { AppointmentComponent } from './core/features/appointments/appointment/appointment.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {path:'appointments', component: AppointmentComponent},
  { path: '**', component: NotFoundComponent },
];
