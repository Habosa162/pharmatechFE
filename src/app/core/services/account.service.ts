import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
// import { Environment } from '../../../base/environment';
// import { CreateAccountDTO, LoginDTO, RefreshTokenDTO, CreateDoctorDTO, UpdateDoctorDTO, CreateEmployeeDTO, UpdateEmployeeDTO } from '../../Interfaces/AccountModels';
import { environment } from './enviroment';
import { LoginDTO, RefreshTokenDTO, CreateDoctorDTO, UpdateDoctorDTO, CreateEmployeeDTO, UpdateEmployeeDTO } from '../Interfaces/all';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = `${environment.apiUrl}/Account/`;

  constructor(private http: HttpClient) { }

  login(dto: LoginDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}login`, dto);
  }

  register(dto: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}Register`, dto);
  }

  refreshToken(dto: RefreshTokenDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}Refresh-Token`, dto);
  }

  isAuthenticated(): Observable<any> {
    return this.http.get(`${this.apiUrl}IsAuthenticated`);
  }

  makeAdmin(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}MakeAdmin`, userId);
  }

  removeAdmin(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}RemoveAdmin`, userId);
  }

  makeOwner(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}MakeOwner`, userId);
  }

  removeOwner(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}RemoveOwner`, userId);
  }

  makeDoctor(dto: CreateDoctorDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}MakeDoctor`, dto);
  }

  updateDoctor(dto: UpdateDoctorDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}UpdateDoctor`, dto);
  }

  deleteDoctor(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}DeleteDoctor/${id}`);
  }

  makeEmployee(dto: CreateEmployeeDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}MakeEmployee`, dto);
  }

  updateEmployee(dto: UpdateEmployeeDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}UpdateEmployee`, dto);
  }

  deleteEmployee(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}DeleteEmployee/${id}`, {});
  }

  getAllDoctors(): Observable<any> {
    return this.http.get(`${this.apiUrl}AllDoctors`);
  }

  getDoctorById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}AllDoctors/${id}`);
  }

  getDoctorsByClinicId(clinicId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}DoctorByClinicId/${clinicId}`);
  }

  getDoctorsByPatientId(patientId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}DoctorByPatientId/${patientId}`);
  }
}
