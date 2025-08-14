import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { AccountService } from './account.service';
import { UserFullData } from '../Models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private userFullDataSubject = new BehaviorSubject<UserFullData | null>(null);
  public userFullData$ = this.userFullDataSubject.asObservable();

  constructor(
    private authService: AuthService,
    private accountService: AccountService
  ) {
    // Subscribe to auth service user full data changes
    this.authService.userFullData$.subscribe(data => {
      this.userFullDataSubject.next(data);
    });
  }

  // Get current user's full data
  getUserFullData(): UserFullData | null {
    return this.userFullDataSubject.value;
  }

  // Check if user is a doctor
  isDoctor(): boolean {
    const userData = this.getUserFullData();
    return userData?.isDoctor || false;
  }

  // Check if user is an employee
  isEmployee(): boolean {
    const userData = this.getUserFullData();
    return userData?.isEmployee || false;
  }

  // Get user's highest role
  getHighestRole(): string | null {
    const userData = this.getUserFullData();
    if (!userData || !userData.roles) return null;
    
    const roleHierarchy = ['MASTER', 'OWNER', 'ADMIN', 'ACCOUNTANT', 'USER'];
    
    for (const role of roleHierarchy) {
      if (userData.roles.includes(role)) {
        return role;
      }
    }
    
    return null;
  }

  // Check if user has a specific role
  hasRole(role: string): boolean {
    const userData = this.getUserFullData();
    if (!userData || !userData.roles) return false;
    return userData.roles.includes(role.toUpperCase());
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles: string[]): boolean {
    const userData = this.getUserFullData();
    if (!userData || !userData.roles) return false;
    return roles.some(role => userData.roles.includes(role.toUpperCase()));
  }

  // Check if user can access specific features based on role hierarchy
  canAccessFeature(feature: string): boolean {
    const highestRole = this.getHighestRole();
    if (!highestRole) return false;

    const featureAccess: { [key: string]: string[] } = {
      'user_management': ['MASTER', 'OWNER', 'ADMIN'],
      'doctor_management': ['MASTER', 'OWNER', 'ADMIN'],
      'patient_management': ['MASTER', 'OWNER', 'ADMIN'],
      'financial_reports': ['MASTER', 'OWNER', 'ADMIN', 'ACCOUNTANT'],
      'inventory_management': ['MASTER', 'OWNER', 'ADMIN', 'ACCOUNTANT'],
      'system_settings': ['MASTER', 'OWNER', 'ADMIN'],
      'business_analytics': ['MASTER', 'OWNER'],
      'audit_logs': ['MASTER'],
      'global_configuration': ['MASTER']
    };

    const requiredRoles = featureAccess[feature] || [];
    return requiredRoles.includes(highestRole);
  }

  // Get doctor ID for the current user (if they are a doctor)
  getDoctorId(): Observable<number | null> {
    return new Observable(observer => {
      if (!this.isDoctor()) {
        observer.next(null);
        observer.complete();
        return;
      }

      const userId = this.authService.getUserId();
      if (!userId) {
        observer.next(null);
        observer.complete();
        return;
      }

      this.accountService.getDoctoridByUserid(userId).subscribe({
        next: (data) => {
          observer.next(data.doctorid || null);
          observer.complete();
        },
        error: (error) => {
          console.error('Error getting doctor ID:', error);
          observer.next(null);
          observer.complete();
        }
      });
    });
  }

  // Get employee ID for the current user (if they are an employee)
  getEmployeeId(): Observable<number | null> {
    return new Observable(observer => {
      if (!this.isEmployee()) {
        observer.next(null);
        observer.complete();
        return;
      }

      // For now, return null as we don't have a direct method to get employee ID
      // You can implement this based on your backend API
      observer.next(null);
      observer.complete();
    });
  }

  // Check if user can access doctor-specific features
  canAccessDoctorFeatures(): boolean {
    return this.isDoctor();
  }

  // Check if user can access employee-specific features
  canAccessEmployeeFeatures(): boolean {
    return this.isEmployee();
  }

  // Check if user can access financial features
  canAccessFinancialFeatures(): boolean {
    return this.hasAnyRole(['ACCOUNTANT', 'ADMIN', 'OWNER', 'MASTER']);
  }

  // Check if user can manage users
  canManageUsers(): boolean {
    return this.hasAnyRole(['MASTER', 'OWNER', 'ADMIN']);
  }

  // Check if user can manage inventory
  canManageInventory(): boolean {
    return this.hasAnyRole(['MASTER', 'OWNER', 'ADMIN', 'ACCOUNTANT']);
  }

  // Check if user can access system settings
  canAccessSystemSettings(): boolean {
    return this.hasAnyRole(['MASTER', 'OWNER', 'ADMIN']);
  }

  // Check if user can access business analytics
  canAccessBusinessAnalytics(): boolean {
    return this.hasAnyRole(['MASTER', 'OWNER']);
  }

  // Load user full data
  loadUserFullData(): void {
    this.authService.loadUserFullData();
  }
} 