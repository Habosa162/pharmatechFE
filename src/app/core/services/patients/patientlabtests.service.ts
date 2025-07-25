import { Injectable } from '@angular/core';
import { environment } from '../enviroment';
import { HttpClient } from '@angular/common/http';
import { PatientLabTestDTO,CreatePatientLabTestDTO,UpdatePatientLabTestDTO } from '../../Interfaces/patient/patients/patientlabtests';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientlabtestsService {



private apiUrl = `${environment.apiUrl}/PatientLabTest`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<PatientLabTestDTO[]> {
    return this.http.get<PatientLabTestDTO[]>(`${this.apiUrl}`);
  }

  getById(id: number): Observable<PatientLabTestDTO> {
    return this.http.get<PatientLabTestDTO>(`${this.apiUrl}/${id}`);
  }

  getByPatientId(patientId: number): Observable<PatientLabTestDTO[]> {
    return this.http.get<PatientLabTestDTO[]>(`${this.apiUrl}/by-patient/${patientId}`);
  }

  getByDateRange(startDate: Date, endDate: Date): Observable<PatientLabTestDTO[]> {
    return this.http.get<PatientLabTestDTO[]>(
      `${this.apiUrl}/by-dates?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
    );
  }

  getByPatientAndDateRange(patientId: number, startDate: Date, endDate: Date): Observable<PatientLabTestDTO[]> {
    return this.http.get<PatientLabTestDTO[]>(
      `${this.apiUrl}/by-patient-date-range?patientId=${patientId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
    );
  }

  addLabTest(data: CreatePatientLabTestDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data);
  }

  updateLabTest(id: number, data: UpdatePatientLabTestDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteLabTest(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  exists(id: number): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/exists/${id}`);
  }

  existsByPatientId(patientId: number): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/exists-by-patient/${patientId}`);
  }

}
