import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroment';
import { Employee, CreateEmployeeDTO, UpdateEmployeeDTO, EmployeeViewDto } from '../../Interfaces/all';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/Employee`;

  constructor(private http: HttpClient) { }

  getAllEmployees(): Observable<EmployeeViewDto[]> {
    return this.http.get<EmployeeViewDto[]>(`${this.apiUrl}`);
  }

  getEmployeeById(id: number): Observable<EmployeeViewDto> {
    return this.http.get<EmployeeViewDto>(`${this.apiUrl}/${id}`);
  }

  createEmployee(employee: CreateEmployeeDTO): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, employee);
  }

  updateEmployee(id: number, employee: CreateEmployeeDTO): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, employee);
  }

  deleteEmployee(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getEmployeesByClinicId(clinicId: number): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/GetEmployeesByClinicId/${clinicId}`);
  }

  getEmployeesByPositionId(positionId: number): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/GetEmployeesByPositionId/${positionId}`);
  }
}
