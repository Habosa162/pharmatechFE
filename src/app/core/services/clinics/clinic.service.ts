import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { Environment } from '../../../base/environment';
import { Observable } from 'rxjs';
import { environment } from '../enviroment';
import { ClinicViewDTO,CreateClinicDTO,UpdateClinicDTO } from '../../Interfaces/all';
// import { environment } from './enviroment';
// import { ClinicViewDTO,CreateClinicDTO,UpdateClinicDTO } from '../Interfaces/all';
// import { ClinicViewDTO, CreateClinicDTO, UpdateClinicDTO } from '../../Interfaces/Clinic';

@Injectable({
  providedIn: 'root'
})
export class ClinicService {

  private apiUrl = `${environment.apiUrl}/clinic`;

  constructor(private http: HttpClient) {}

  getAllClinics(): Observable<ClinicViewDTO[]> {
    return this.http.get<ClinicViewDTO[]>(`${this.apiUrl}`);
  }

  getClinicById(id: number): Observable<ClinicViewDTO> {
    return this.http.get<ClinicViewDTO>(`${this.apiUrl}/${id}`);
  }

  getClinicsByDoctorId(doctorId: number): Observable<ClinicViewDTO[]> {
    return this.http.get<ClinicViewDTO[]>(`${this.apiUrl}/getByDoctorid/${doctorId}`);
  }

  getClinicsByLocation(location: string): Observable<ClinicViewDTO[]> {
    return this.http.get<ClinicViewDTO[]>(`${this.apiUrl}/getByLocation/${location}`);
  }

  getClinicsBySpeciality(speciality: string): Observable<ClinicViewDTO[]> {
    return this.http.get<ClinicViewDTO[]>(`${this.apiUrl}/getByspeciality/${speciality}`);
  }

  getClinicsByOwnerName(ownerName: string): Observable<ClinicViewDTO[]> {
    return this.http.get<ClinicViewDTO[]>(`${this.apiUrl}/getbyOwner/${ownerName}`);
  }

  createClinic(dto: CreateClinicDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}`, dto);
  }

  updateClinic(dto: UpdateClinicDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}`, dto);
  }

  deleteClinic(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
