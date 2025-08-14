// sidebar.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  protected authService = inject(AuthService);

  // Use signals for reactive data
  public isLoggedIn = this.authService.isLoggedInSignal;
  public userFullData = this.authService.userFullDataSignal;
  public userRoles = this.authService.userRoles;
  public isDoctor = this.authService.isDoctorSignal;
  public isEmployee = this.authService.isEmployeeSignal;

  ngOnInit() {
    // Debug user data on component initialization
    this.debugUserData();
  }

  // Debug method to log user data
  public debugUserData() {
    const userData = this.authService.getUserFullData();
    const isDoctor = this.authService.isDoctor();
    const isEmployee = this.authService.isEmployee();
    const highestRole = this.authService.getHighestRole();
    
    console.log('Sidebar - User Data Debug:', {
      userData,
      isDoctor,
      isEmployee,
      highestRole,
      canAccessAdmin: this.canAccessAdmin(),
      canAccessDoctor: this.canAccessDoctor(),
      canAccessEmployee: this.canAccessEmployee(),
      canAccessMaster: this.canAccessMaster(),
      canAccessOwner: this.canAccessOwner(),
      canAccessAccountant: this.canAccessAccountant()
    });
  }

  // Reload user data method
  public reloadUserData() {
    console.log('Sidebar - Manually reloading user data...');
    this.authService.loadUserFullData();
    
    // Debug after reload
    setTimeout(() => {
      this.debugUserData();
    }, 1000);
  }

  // Helper methods for template - updated to use new role system
  canAccessAdmin(): boolean {
    const result = this.authService.hasAnyRole(['MASTER', 'OWNER', 'ADMIN']);
    console.log('canAccessAdmin:', result);
    return result;
  }

  canAccessDoctor(): boolean {
    const result = this.authService.isDoctor();
    console.log('canAccessDoctor:', result);
    return result;
  }

  canAccessEmployee(): boolean {
    const result = this.authService.isEmployee();
    console.log('canAccessEmployee:', result);
    return result;
  }

  canAccessAccountant(): boolean {
    const result = this.authService.hasRole('ACCOUNTANT');
    console.log('canAccessAccountant:', result);
    return result;
  }

  canAccessFinancial(): boolean {
    const result = this.authService.hasAnyRole(['ACCOUNTANT', 'ADMIN', 'OWNER', 'MASTER']);
    console.log('canAccessFinancial:', result);
    return result;
  }

  canManageUsers(): boolean {
    const result = this.authService.hasAnyRole(['MASTER', 'OWNER', 'ADMIN']);
    console.log('canManageUsers:', result);
    return result;
  }

  canManageInventory(): boolean {
    const result = this.authService.hasAnyRole(['MASTER', 'OWNER', 'ADMIN', 'ACCOUNTANT']);
    console.log('canManageInventory:', result);
    return result;
  }

  canAccessMaster(): boolean {
    const result = this.authService.hasRole('MASTER');
    console.log('canAccessMaster:', result);
    return result;
  }

  canAccessOwner(): boolean {
    const result = this.authService.hasRole('OWNER');
    console.log('canAccessOwner:', result);
    return result;
  }

  canAccessSystemSettings(): boolean {
    const result = this.authService.hasAnyRole(['MASTER', 'OWNER', 'ADMIN']);
    console.log('canAccessSystemSettings:', result);
    return result;
  }

  canAccessBusinessAnalytics(): boolean {
    const result = this.authService.hasAnyRole(['MASTER', 'OWNER']);
    console.log('canAccessBusinessAnalytics:', result);
    return result;
  }

  logout() {
    this.authService.logout();
  }
}
