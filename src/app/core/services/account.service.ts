import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
// import { Environment } from '../../../base/environment';
// import { CreateAccountDTO, LoginDTO, RefreshTokenDTO, CreateDoctorDTO, UpdateDoctorDTO, CreateEmployeeDTO, UpdateEmployeeDTO } from '../../Interfaces/AccountModels';
import { environment } from './enviroment';
import {
  LoginDTO,
  RefreshTokenDTO,
  CreateDoctorDTO,
  UpdateDoctorDTO,
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
  DoctorViewDTO,
  UserViewDTO,
  CreateUserDTO,
  UpdateUserDTO,
  ChangePasswordDTO
} from '../Interfaces/all';
import { UserFullData } from '../Models/auth.models';

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

  getAllDoctors(): Observable<DoctorViewDTO[]> {
    return this.http.get<DoctorViewDTO[]>(`${this.apiUrl}AllDoctors`);
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
  getDoctoridByUserid(userid:string):Observable<any>
  {
        return this.http.get<any>(`${this.apiUrl}doctorId/${userid}`)
  }

  // User Management Methods
  getAllUsers(): Observable<UserViewDTO[]> {
    return this.http.get<UserViewDTO[]>(`${this.apiUrl}AllUsers`);
  }

  getUserById(id: string): Observable<UserViewDTO> {
    return this.http.get<UserViewDTO>(`${this.apiUrl}User/${id}`);
  }

  createUser(userData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}CreateUser`, userData);
  }

  updateUser(username: string, userData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}UpdateUser/${username}`, userData);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}DeleteUser/${id}`);
  }

  changePassword(passwordData: ChangePasswordDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}ChangePassword`, passwordData);
  }

  activateUser(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}ActivateUser/${id}`, {});
  }

  deactivateUser(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}DeactivateUser/${id}`, {});
  }

  assignRole(userId: string, role: string): Observable<any> {
    const data: changingroleDTO = {
      userId: userId,
      role: role
    };
    return this.http.patch(`${this.apiUrl}AssignRole`, data);
  }

  removeRole(userId: string, role: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}RemoveRole`, { userId :userId,role: role });
  }

  editAccount(username: string, accountData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}EditAccount/${username}`, accountData);
  }

  userfulldata():Observable<UserFullData>
  {
   // console.log('AccountService - Calling userfulldata API:', `${this.apiUrl}userfulldata`);
    return this.http.get<UserFullData>(`${this.apiUrl}userfulldata`);
  }
}
export interface  changingroleDTO
{
	 userId:string;
	 role:string;
}

