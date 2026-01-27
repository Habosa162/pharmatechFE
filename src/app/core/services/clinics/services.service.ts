import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { Environment } from '../../../base/environment';
import { Observable } from 'rxjs';
import { environment } from '../enviroment';
import { ClinicViewDTO,CreateClinicDTO,UpdateClinicDTO } from '../../Interfaces/all';
import { CreateServiceDto, ServiceDto } from '../../Interfaces/clinic/medications/services';
import { AuthService } from '../auth.service';
// import { environment } from './enviroment';
// import { ClinicViewDTO,CreateClinicDTO,UpdateClinicDTO } from '../Interfaces/all';
// import { ClinicViewDTO, CreateClinicDTO, UpdateClinicDTO } from '../../Interfaces/Clinic';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  private apiUrl = `${environment.apiUrl}/service`;
authservice= inject(AuthService);
  constructor(private http: HttpClient) {}
  createService(dto: CreateServiceDto): Observable<any> {
    this.authservice.getUserData().ClinicId;
    dto.clinicId = this.authservice.getUserData().ClinicId;
    console.log(dto,'dto');

    // dto.name='استشارة'
    return this.http.post(`${this.apiUrl}`, dto);
  }

  getAllServices(): Observable<ServiceDto[]> {
    return this.http.get<ServiceDto[]>(`${this.apiUrl}`);
  } 
  
  deleteService(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
 
}
