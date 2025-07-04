import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../enviroment';
import { Observable } from 'rxjs';
import { CreatePosition, PositionDto, UpdatePosition } from '../../Interfaces/employee/positions/position';

@Injectable({
  providedIn: 'root'
})
export class PositionService {


  private positionEndPoint = `${environment.apiUrl}/positions`; // Replace with your actual endpoint
  constructor(private http: HttpClient) { }

  getAllPositions() : Observable<PositionDto[]>{
    return this.http.get<PositionDto[]>(`${this.positionEndPoint}`);
  }

  getPositionById(id: number): Observable<PositionDto> {
    return this.http.get<PositionDto>(`${this.positionEndPoint}/${id}`);
  }

  addPosition(position: CreatePosition): Observable<CreatePosition> {
    return this.http.post<CreatePosition>(`${this.positionEndPoint}`, position);
  }

  updatePosition(id: number, position: UpdatePosition): Observable<UpdatePosition> {
    return this.http.put<UpdatePosition>(`${this.positionEndPoint}/${id}`, position);
  }

  deletePosition(id: number): Observable<void> {
    return this.http.delete<void>(`${this.positionEndPoint}/${id}`);
  }

  getPositionsByName(name: string): Observable<PositionDto[]> {
    return this.http.get<PositionDto[]>(`${this.positionEndPoint}/GetByName/${name}`);
  }

  getPositionsByClinicId(clinicId: number): Observable<PositionDto[]> {
    return this.http.get<PositionDto[]>(`${this.positionEndPoint}/clinic/${clinicId}`);
  }

  getPositionsByDepartmentId(departmentId: number): Observable<PositionDto[]> {
    return this.http.get<PositionDto[]>(`${this.positionEndPoint}/department/${departmentId}`);
  }
}
