import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import { Environment } from '../../../base/environment';
import { Observable } from 'rxjs';
import { environment } from '../enviroment';
import { AppointmentDetails,UpdateAppointmentDTO,CreateAppointmentDTO } from '../../Interfaces/all';
// import { environment } from './enviroment';
// import { AppointmentDetails, CreateAppointmentDTO, UpdateAppointmentDTO } from '../Interfaces/all';
// import { CreateAppointmentDTO, UpdateAppointmentDTO, AppointmentDetails } from '../../Interfaces/Appointment';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private apiUrl = `${environment.apiUrl}/Appointment`;

  constructor(private http: HttpClient) { }

  getAppointments(): Observable<AppointmentDetails[]> {
    return this.http.get<AppointmentDetails[]>(`${this.apiUrl}`);
  }
 getPatientAppointments(patiendid:number): Observable<AppointmentDetails[]> {
    return this.http.get<AppointmentDetails[]>(`${this.apiUrl}/PatientAppointments/${patiendid}`);
  }

   getDoctorAppointments(Doctorid:number): Observable<AppointmentDetails[]> {
    return this.http.get<AppointmentDetails[]>(`${this.apiUrl}/DoctorAppointments/${Doctorid}`);
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
  myappointments(id:string): Observable<AppointmentDetails[]> {
    return this.http.get<AppointmentDetails[]>(`${this.apiUrl}/MyAppointments/${id}`);
  }
}

