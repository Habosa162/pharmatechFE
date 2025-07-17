import { Injectable } from '@angular/core';
import { environment } from '../enviroment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AddLabtest, LabtestDto, UpdateLabtest } from '../../Interfaces/patient/labtests/labtest';

@Injectable({
  providedIn: 'root'
})
export class LabtestService {

  private LabtestEndPoint = `${environment.apiUrl}/Labtest`;

  constructor(private http:HttpClient) { }

  getAllLabtests():Observable<LabtestDto[]> {
    return this.http.get<LabtestDto[]>(`${this.LabtestEndPoint}`);
  }

  getLabtestById(id: number): Observable<LabtestDto> {
    return this.http.get<LabtestDto>(`${this.LabtestEndPoint}/${id}`);
  }

  getLabtestsByPatientId(patientId: number): Observable<LabtestDto[]> {
    return this.http.get<LabtestDto[]>(`${this.LabtestEndPoint}/patient/${patientId}`);
  }

  addLabtest(labtest: AddLabtest): Observable<LabtestDto> {
    return this.http.post<LabtestDto>(`${this.LabtestEndPoint}`, labtest);
  }

  updateLabtest(id: number, labtest: UpdateLabtest): Observable<LabtestDto> {
    return this.http.put<LabtestDto>(`${this.LabtestEndPoint}/${id}`, labtest);
  }

  deleteLabtest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.LabtestEndPoint}/${id}`);
  }

  getLabtestsByName(name: string): Observable<LabtestDto[]> {
    return this.http.get<LabtestDto[]>(`${this.LabtestEndPoint}/name/${name}`);
  }

  GetLabTestsByDateRange(startDate: Date, endDate: Date): Observable<LabtestDto[]> {
    return this.http.get<LabtestDto[]>(`${this.LabtestEndPoint}/dateRange?startDate=${startDate}&endDate=${endDate}`);
  }
  GetLabTestsByDateRangeandpatientId(startDate: Date, endDate: Date,patientId:number): Observable<LabtestDto[]> {
    return this.http.get<LabtestDto[]>(`${this.LabtestEndPoint}/patient/${patientId}/dateRange?startDate=${startDate}&endDate=${endDate}`);
  }


}
