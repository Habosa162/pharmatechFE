import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../enviroment';
import { Observable } from 'rxjs';
import { CreateSurgery, SurgeryDto, UpdateSurgery } from '../../Interfaces/patient/surgeries/surgery';

@Injectable({
  providedIn: 'root'
})
export class SurgeryService {

  private SurgeryEndPoint = `${environment.apiUrl}/Surgery`; // Replace with your actual endpoint

  constructor(private http :HttpClient) { }

  getAllSurgeries(): Observable<SurgeryDto[]> {
    return this.http.get<SurgeryDto[]>(`${this.SurgeryEndPoint}`);
  }

  getSurgeryById(id: number): Observable<SurgeryDto> {
    return this.http.get<SurgeryDto>(`${this.SurgeryEndPoint}/${id}`);
  }

  getSurgeriesByPatientId(patientId: number): Observable<SurgeryDto[]> {
    return this.http.get<SurgeryDto[]>(`${this.SurgeryEndPoint}/patient/${patientId}`);
  }

  addSurgery(surgery: CreateSurgery): Observable<CreateSurgery> {
    return this.http.post<CreateSurgery>(`${this.SurgeryEndPoint}`, surgery);
  }

  updateSurgery(id: number, surgery: UpdateSurgery): Observable<UpdateSurgery> {
    return this.http.put<UpdateSurgery>(`${this.SurgeryEndPoint}/${id}`, surgery);
  }

  deleteSurgery(id: number): Observable<void> {
    return this.http.delete<void>(`${this.SurgeryEndPoint}/${id}`);
  }

  getSurgeriesByDateRange(startDate: Date, endDate: Date): Observable<SurgeryDto[]> {
    return this.http.get<SurgeryDto[]>(`${this.SurgeryEndPoint}/dateRange?startDate=${startDate}&endDate=${endDate}`);
  }

  getSurgeriesByDateRangeAndPatientId(startDate: Date, endDate: Date, patientId: number): Observable<SurgeryDto[]> {
    return this.http.get<SurgeryDto[]>(`${this.SurgeryEndPoint}/patient/${patientId}/dateRange?startDate=${startDate}&endDate=${endDate}`);
  }

  getSurgeriesByDateRangeAndDoctorId(startDate: Date, endDate: Date, doctorId: number): Observable<SurgeryDto[]> {
    return this.http.get<SurgeryDto[]>(`${this.SurgeryEndPoint}/doctor/${doctorId}/dateRange?startDate=${startDate}&enddate=${endDate}`);
  }


  getSurgeriesByDoctorId(doctorId: number): Observable<SurgeryDto[]> {
    return this.http.get<SurgeryDto[]>(`${this.SurgeryEndPoint}/doctor/${doctorId}`);
  }

  getSurgeriesBySurgeryDateAndPatientId(surgeryDate: Date, patientId: number): Observable<SurgeryDto[]> {
    return this.http.get<SurgeryDto[]>(`${this.SurgeryEndPoint}/patient/${patientId}/surgeryDate/${surgeryDate}?surgeryDate=${surgeryDate}`);
  }

  getSurgeriesBySurgeryDateAndDoctorId(surgeryDate: Date, doctorId: number): Observable<SurgeryDto[]> {
    return this.http.get<SurgeryDto[]>(`${this.SurgeryEndPoint}/doctor/${doctorId}/surgeryDate?surgeryDate=${surgeryDate}`);
  }

}
