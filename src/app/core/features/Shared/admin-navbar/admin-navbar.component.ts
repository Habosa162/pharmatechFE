import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-navbar.component.html',
  styleUrls: ['./admin-navbar.component.css']
})
export class AdminNavbarComponent implements OnInit {
  protected authService = inject(AuthService);

  // Use signals for reactive data
  public isLoggedIn = this.authService.isLoggedInSignal;
  public userFullData = this.authService.userFullDataSignal;
  public userRoles = this.authService.userRoles;
  public isDoctor = this.authService.isDoctorSignal;
  public isEmployee = this.authService.isEmployeeSignal;

  // Component state
  activeTab: string = 'admin-dashboard';

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
    
    console.log('Admin Navbar - User Data Debug:', {
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
    console.log('Admin Navbar - Manually reloading user data...');
    this.authService.loadUserFullData();
    
    // Debug after reload
    setTimeout(() => {
      this.debugUserData();
    }, 1000);
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  // Helper methods for template - updated to use new role system
  canAccessAdmin(): boolean {
    const result = this.authService.hasAnyRole(['MASTER', 'OWNER', 'ADMIN']);
    console.log('Admin Navbar - canAccessAdmin:', result);
    return result;
  }

  canAccessDoctor(): boolean {
    const result = this.authService.isDoctor();
    console.log('Admin Navbar - canAccessDoctor:', result);
    return result;
  }

  canAccessEmployee(): boolean {
    const result = this.authService.isEmployee();
    console.log('Admin Navbar - canAccessEmployee:', result);
    return result;
  }

  canAccessAccountant(): boolean {
    const result = this.authService.hasRole('ACCOUNTANT');
    console.log('Admin Navbar - canAccessAccountant:', result);
    return result;
  }

  canAccessFinancial(): boolean {
    const result = this.authService.hasAnyRole(['ACCOUNTANT', 'ADMIN', 'OWNER', 'MASTER']);
    console.log('Admin Navbar - canAccessFinancial:', result);
    return result;
  }

  canManageUsers(): boolean {
    const result = this.authService.hasAnyRole(['MASTER', 'OWNER', 'ADMIN']);
    console.log('Admin Navbar - canManageUsers:', result);
    return result;
  }

  canManageInventory(): boolean {
    const result = this.authService.hasAnyRole(['MASTER', 'OWNER', 'ADMIN', 'ACCOUNTANT']);
    console.log('Admin Navbar - canManageInventory:', result);
    return result;
  }

  canAccessMaster(): boolean {
    const result = this.authService.hasRole('MASTER');
    console.log('Admin Navbar - canAccessMaster:', result);
    return result;
  }

  canAccessOwner(): boolean {
    const result = this.authService.hasRole('OWNER');
    console.log('Admin Navbar - canAccessOwner:', result);
    return result;
  }

  canAccessSystemSettings(): boolean {
    const result = this.authService.hasAnyRole(['MASTER', 'OWNER', 'ADMIN']);
    console.log('Admin Navbar - canAccessSystemSettings:', result);
    return result;
  }

  canAccessBusinessAnalytics(): boolean {
    const result = this.authService.hasAnyRole(['MASTER', 'OWNER']);
    console.log('Admin Navbar - canAccessBusinessAnalytics:', result);
    return result;
  }
}
