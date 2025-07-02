import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import { Environment } from '../../../base/environment';
import { Observable } from 'rxjs';
import { environment } from './enviroment';
import { AppointmentDetails, CreateAppointmentDTO, UpdateAppointmentDTO } from '../Interfaces/all';
// import { CreateAppointmentDTO, UpdateAppointmentDTO, AppointmentDetails } from '../../Interfaces/Appointment';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private apiUrl = `${environment.apiUrl}/appointment`;

  constructor(private http: HttpClient) { }

  getAppointments(): Observable<AppointmentDetails[]> {
    return this.http.get<AppointmentDetails[]>(`${this.apiUrl}`);
  }

  getAppointmentById(id: number): Observable<AppointmentDetails> {
    return this.http.get<AppointmentDetails>(`${this.apiUrl}/${id}`);
  }

  createAppointment(dto: CreateAppointmentDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}`, dto);
  }

  updateAppointment(id: number, dto: UpdateAppointmentDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, dto);
  }

  deleteAppointment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

