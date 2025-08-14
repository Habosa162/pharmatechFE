import { Injectable, signal, computed } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { ILoginUser, UserFullData } from '../Models/auth.models';
import { HttpClient } from '@angular/common/http';
import { environment } from './enviroment';
import {  Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private AuthEndPoint = `${environment.apiUrl}/Account`;
  
  // Convert to signals for better reactivity
  private _isLoggedIn = signal<boolean>(false);
  private _userFullData = signal<UserFullData | null>(null);
  
  // Public signals
  public isLoggedInSignal = this._isLoggedIn.asReadonly();
  public userFullDataSignal = this._userFullData.asReadonly();
  
  // Computed signals for derived state
  public hasUserData = computed(() => this._userFullData() !== null);
  public userRoles = computed(() => this._userFullData()?.roles || []);
  public isDoctorSignal = computed(() => this._userFullData()?.isDoctor || false);
  public isEmployeeSignal = computed(() => this._userFullData()?.isEmployee || false);
  
  // Keep BehaviorSubject for backward compatibility with existing code
  private userFullDataSubject = new BehaviorSubject<UserFullData | null>(null);
  public userFullData$ = this.userFullDataSubject.asObservable();

  constructor(
    private http :HttpClient, 
    private routerService:Router,
    private accountService: AccountService
  ) { 
    // Initialize login state from localStorage
    this._isLoggedIn.set(!!localStorage.getItem('token'));
  }


  login(LoginObj: ILoginUser): Observable<any> {
    console.log(LoginObj);
    return this.http.post(`${this.AuthEndPoint}/login`, {
      usernameoremail : LoginObj.username,
      loginPassword : LoginObj.password
    });
  }

  // Set login state after successful login
  setLoginState(token: string): void {
    localStorage.setItem('token', token);
    this._isLoggedIn.set(true);
  }

  createAdmin(RegisterObj: FormData): Observable<any> {
    console.log(RegisterObj);
    return this.http.post(this.AuthEndPoint, RegisterObj);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Use signal-based login state
  isLoggedIn(): boolean {
    return this._isLoggedIn();
  }

  getTokenFromCookie(): string | null {
    const name = 'token=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');

    for (let cookie of cookieArray) {
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length);
      }
    }
    return null;
  }

  logout(): void {
    localStorage.removeItem('token');
    // Update signals
    this._isLoggedIn.set(false);
    this._userFullData.set(null);
    this.userFullDataSubject.next(null);
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

  getUserId(): string | null {
    const decodedToken = this.getDecodedToken();
    if (!decodedToken) return null;
    // Use the same claim as in getUserData()
    return decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || null;
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

  // Role checking methods - ONLY use UserFullData roles from API
  hasRole(role: string): boolean {
    const userData = this._userFullData();
    console.log('AuthService - hasRole called for:', role, 'User data:', userData);
    if (!userData || !userData.roles) {
      console.log('AuthService - hasRole: No user data or roles');
      return false;
    }
    const result = userData.roles.some(storedRole => storedRole.toUpperCase() === role.toUpperCase());
    console.log('AuthService - hasRole result:', result, 'Roles:', userData.roles);
    return result;
  }

  hasAnyRole(roles: string[]): boolean {
    const userData = this._userFullData();
    console.log('AuthService - hasAnyRole called for:', roles, 'User data:', userData);
    if (!userData || !userData.roles) {
      console.log('AuthService - hasAnyRole: No user data or roles');
      return false;
    }
    const result = roles.some(role => userData.roles.some(storedRole => storedRole.toUpperCase() === role.toUpperCase()));
    console.log('AuthService - hasAnyRole result:', result, 'Roles:', userData.roles);
    return result;
  }

  getHighestRole(): string | null {
    const userData = this._userFullData();
    console.log('AuthService - getHighestRole called, User data:', userData);
    if (!userData || !userData.roles) {
      console.log('AuthService - getHighestRole: No user data or roles');
      return null;
    }
    
    const roleHierarchy = ['MASTER', 'OWNER', 'ADMIN', 'ACCOUNTANT', 'USER'];
    
    for (const role of roleHierarchy) {
      // Convert stored roles to uppercase for comparison
      if (userData.roles.some(storedRole => storedRole.toUpperCase() === role)) {
        console.log('AuthService - getHighestRole result:', role);
        return role;
      }
    }
    
    console.log('AuthService - getHighestRole: No matching role found');
    return null;
  }

  // Use signal-based doctor/employee checks
  isDoctor(): boolean {
    return this.isDoctorSignal();
  }

  isEmployee(): boolean {
    return this.isEmployeeSignal();
  }

  loadUserFullData(): void {
    if (this.isLoggedIn()) {
      console.log('AuthService - Loading user full data...');
      console.log('AuthService - API Endpoint:', `${this.AuthEndPoint}/userfulldata`);
      
      this.accountService.userfulldata().subscribe({
        next: (data: UserFullData) => {
          console.log('AuthService - User full data loaded successfully:', data);
          // Update both signals and BehaviorSubject for backward compatibility
          this._userFullData.set(data);
          this.userFullDataSubject.next(data);
        },
        error: (error) => {
          console.error('AuthService - Error loading user full data:', error);
          console.error('AuthService - Error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            url: error.url
          });
          this._userFullData.set(null);
          this.userFullDataSubject.next(null);
        },
        complete: () => {
          console.log('AuthService - User full data loading completed');
        }
      });
    } else {
      console.log('AuthService - User not logged in, cannot load data');
    }
  }

  getUserFullData(): UserFullData | null {
    return this._userFullData();
  }

  // Method to check if user can access specific features based on role hierarchy
  canAccessFeature(feature: string): boolean {
    const highestRole = this.getHighestRole();
    if (!highestRole) return false;

    const featureAccess: { [key: string]: string[] } = {
      'user_management': ['MASTER', 'OWNER', 'ADMIN'],
      'doctor_management': ['MASTER', 'OWNER', 'ADMIN'],
      'patient_management': ['MASTER', 'OWNER', 'ADMIN'],
      'financial_reports': ['MASTER', 'OWNER', 'ADMIN', 'ACCOUNTANT'],
      'inventory_management': ['MASTER', 'OWNER', 'ADMIN', 'ACCOUNTANT'],
      'system_settings': ['MASTER', 'OWNER', 'ADMIN']
    };

    const requiredRoles = featureAccess[feature] || [];
    return requiredRoles.includes(highestRole);
  }
}
