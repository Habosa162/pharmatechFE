import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../enviroment';
import { Observable } from 'rxjs';
import { Allmedicalrecords, Createmedicalrecord, MedicalrecordDto, Updatemedicalrecord } from '../../Interfaces/patient/medicalrecords/medicalrecord';

@Injectable({
  providedIn: 'root'
})
export class MedicalrecordService {

  private MedicalrecordEndPoint = `${environment.apiUrl}/MedicalRecord`;
  constructor(private http :HttpClient) { }

  getAllMedicalRecords():Observable<Allmedicalrecords[]> {
    return this.http.get<Allmedicalrecords[]>(`${this.MedicalrecordEndPoint}`);
  }

  getMedicalRecordById(id: number): Observable<MedicalrecordDto> {
    return this.http.get<MedicalrecordDto>(`${this.MedicalrecordEndPoint}/${id}`);
  }

  getMedicalRecordsByPatientId(patientId: number): Observable<Allmedicalrecords[]> {
    return this.http.get<Allmedicalrecords[]>(`${this.MedicalrecordEndPoint}/patient/${patientId}`);
  }

  getMedicalRecordsByClinicId(clinicId: number): Observable<Allmedicalrecords[]> {
    return this.http.get<Allmedicalrecords[]>(`${this.MedicalrecordEndPoint}/clinic/${clinicId}`);
  }

  addMedicalRecord(medicalrecord: Createmedicalrecord): Observable<Createmedicalrecord> {
    return this.http.post<Createmedicalrecord>(`${this.MedicalrecordEndPoint}`, medicalrecord);
  }

  updateMedicalRecord(id: number, medicalrecord: Updatemedicalrecord): Observable<Updatemedicalrecord> {
    return this.http.put<Updatemedicalrecord>(`${this.MedicalrecordEndPoint}/${id}`, medicalrecord);
  }

  deleteMedicalRecord(id: number): Observable<void> {
    return this.http.delete<void>(`${this.MedicalrecordEndPoint}/${id}`);
  }

}
