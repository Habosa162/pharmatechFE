import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../enviroment';
import { Observable } from 'rxjs';
import { CreateMedication, MedicationDto } from '../../Interfaces/clinic/medications/medication';

@Injectable({
  providedIn: 'root'
})
export class MedicationService {

  private MedicationEndPoint = `${environment.apiUrl}/Medication`; // Replace with your actual endpoint
  constructor(private http :HttpClient) { }

  getAllMedications():Observable<MedicationDto[]> {
    return this.http.get<MedicationDto[]>(`${this.MedicationEndPoint}`);
  }

  getMedicationById(id: number): Observable<MedicationDto> {
    return this.http.get<MedicationDto>(`${this.MedicationEndPoint}/${id}`);
  }

  addMedication(medication: CreateMedication): Observable<CreateMedication> {
    return this.http.post<CreateMedication>(`${this.MedicationEndPoint}`, medication);
  }

  updateMedication(id: number, medication: CreateMedication): Observable<CreateMedication> {
    return this.http.put<CreateMedication>(`${this.MedicationEndPoint}/${id}`, medication);
  }

  deleteMedication(id: number): Observable<void> {
    return this.http.delete<void>(`${this.MedicationEndPoint}/${id}`);
  }

  getMedicationsByPatientId(patientId: number): Observable<MedicationDto[]> {
    return this.http.get<MedicationDto[]>(`${this.MedicationEndPoint}/patient/${patientId}`);
  }

  getMedicationsByPrecriptionId(prescriptionId: number): Observable<MedicationDto[]> {
    return this.http.get<MedicationDto[]>(`${this.MedicationEndPoint}/prescription/${prescriptionId}`);
  }

}
