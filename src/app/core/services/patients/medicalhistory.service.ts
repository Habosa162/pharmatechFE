import { Injectable } from '@angular/core';
import { environment } from '../enviroment';
import { HttpClient } from '@angular/common/http';
import { CreateMedicalHistoryDTO, MedicalHistory, UpdateMedicalHistoryDTO } from '../../Interfaces/patient/patients/medicalhistory';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MedicalhistoryService {

   private baseUrl = `${environment.apiUrl}/MedicalHistory`; // Replace with your actual API URL

  constructor(private http: HttpClient) {}

  getAllMedicalHistories(): Observable<MedicalHistory[]> {
    return this.http.get<MedicalHistory[]>(this.baseUrl);
  }

  getMedicalHistoryById(id: number): Observable<MedicalHistory> {
    return this.http.get<MedicalHistory>(`${this.baseUrl}/${id}`);
  }
  getMedicalHistoryByPatientId(id: number): Observable<MedicalHistory[]> {
    return this.http.get<MedicalHistory[]>(`${this.baseUrl}/ByPatient/${id}`);
  }

  addMedicalHistory(history: CreateMedicalHistoryDTO): Observable<any> {
    return this.http.post(this.baseUrl, history);
  }

  updateMedicalHistory(id: number, history: UpdateMedicalHistoryDTO): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, history);
  }
}
