import { Injectable } from '@angular/core';
import { environment } from '../enviroment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CreatePatient, PatientDto } from '../../Interfaces/patient/patients/patient';


@Injectable({
  providedIn: 'root'
})
export class PatientService {

    private PatientEndPoint = `${environment.apiUrl}/`;

  constructor(private http: HttpClient) { }

  getAllPatients(): Observable<PatientDto[]> {
    return this.http.get<PatientDto[]>(`${this.PatientEndPoint}patient`);
  }

  getPatientById(id: number): Observable<PatientDto> {
    return this.http.get<PatientDto>(`${this.PatientEndPoint}patient/${id}`);
  }

  getPatientsByClinicId(clinicId: number): Observable<PatientDto[]> {
    return this.http.get<PatientDto[]>(`${this.PatientEndPoint}patient/getpatientsbyclinicid/${clinicId}`);
  }

  getPatientsByDoctorId(doctorId: number): Observable<PatientDto[]> {
    return this.http.get<PatientDto[]>(`${this.PatientEndPoint}patient/getpatientsbydoctorid/${doctorId}`);
  }

  getPatientByName(name: string): Observable<PatientDto[]> {
    return this.http.get<PatientDto[]>(`${this.PatientEndPoint}patient/searchbypatientname/${name}`);
  }
  getPatientByPhoneNumber(phoneNumber: string): Observable<PatientDto[]> {
    return this.http.get<PatientDto[]>(`${this.PatientEndPoint}patient/searchbypatientphonenumber/${phoneNumber}`);
  }

  addpatient(patient: CreatePatient): Observable<PatientDto> {
    return this.http.post<PatientDto>(`${this.PatientEndPoint}patient/addpatient`, patient);
  }
  updatePatient(id: number, patient: PatientDto): Observable<PatientDto> {
    return this.http.put<PatientDto>(`${this.PatientEndPoint}patient/${id}`, patient);
  }
  deletePatient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.PatientEndPoint}patient/${id}`);
  }

}
