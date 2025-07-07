import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { Environment } from '../../../base/environment';
import { Observable } from 'rxjs';
// import { DepartmentViewDTO, CreateDepartmentDTO, UpdateDepartmentDTO } from '../../Interfaces/Department';
import { environment } from '../enviroment';
import { DepartmentViewDTO, CreateDepartmentDTO, UpdateDepartmentDTO, DoctorDepartmentViewDTO } from '../../Interfaces/all';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  private apiUrl = `${environment.apiUrl}/department`;

  constructor(private http: HttpClient) {}

  getAllDepartments(): Observable<DepartmentViewDTO[]> {
    return this.http.get<DepartmentViewDTO[]>(`${this.apiUrl}`);
  }

  getDepartmentById(id: number): Observable<DepartmentViewDTO> {
    return this.http.get<DepartmentViewDTO>(`${this.apiUrl}/${id}`);
  }

  getDepartmentsByClinicId(clinicId: number): Observable<DepartmentViewDTO[]> {
    return this.http.get<DepartmentViewDTO[]>(`${this.apiUrl}/by-clinic/${clinicId}`);
  }

  createDepartment(dto: CreateDepartmentDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}`, dto);
  }

  updateDepartment(dto: UpdateDepartmentDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}`, dto);
  }

  deleteDepartment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  getDoctorDepartments():Observable<DoctorDepartmentViewDTO[]>{
     return this.http.get<DoctorDepartmentViewDTO[]>(`${this.apiUrl}/DoctorDepartments`);
  }
}
