import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ILoginUser } from '../Models/auth.models';
import { HttpClient } from '@angular/common/http';
import { environment } from './enviroment';
import {  Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  private AuthEndPoint = `${environment.apiUrl}/Account`;

  private RegisterEndPoint = `${environment.apiUrl}/Auth/register`;


  constructor(private http :HttpClient , private routerService:Router) { }


  login(LoginObj: ILoginUser): Observable<any> {
    console.log(LoginObj);
    return this.http.post(`${this.AuthEndPoint}/login`, LoginObj);
  }

  createAdmin(RegisterObj: FormData): Observable<any> {
    console.log(RegisterObj);
    return this.http.post(this.RegisterEndPoint, RegisterObj);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    this.routerService.navigate(['/login']);
  }
  getDecodedToken():any{
    const token  = this.getToken();
    if (!token) return null;
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
  getUserData(): any {
  const decodedToken = this.getDecodedToken();
  if (!decodedToken) return null;
  const userData = {
  ID : decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || null,
  Name: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || null,
  Email: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || null,
  ProfileImg: decodedToken['profileImg'] || null,
  Role : decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null,
  };
  return userData;
  }

  getUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT
      return payload.username || null; // Adjust based on backend response
    } catch (error) {
      return null;
    }
  }

    getUserRole(): string | null {
      const decodedToken = this.getDecodedToken();
      if (!decodedToken) return "Employee";
      const role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      if (!role) return "Employee";
      try {
        return role ;
      } catch (error) {
        return null;
      }
    }

}
