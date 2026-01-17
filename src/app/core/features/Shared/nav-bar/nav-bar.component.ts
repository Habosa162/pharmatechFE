import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {
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
    // Log navigation state for debugging
  //  this.logNavigationState();
    // Log current route for debugging
   // this.logCurrentRoute();
    // Debug navigation conflicts
    // this.debugNavigationConflicts();
  }

  // Debug method to log user data
  public debugUserData() {
    const userData = this.authService.getUserFullData();
    const isDoctor = this.authService.isDoctor();
    const isEmployee = this.authService.isEmployee();
    const highestRole = this.authService.getHighestRole();

    // console.log('Main Navbar - User Data Debug:', {
    //   userData,
    //   isDoctor,
    //   isEmployee,
    //   highestRole,
    //   canAccessAdmin: this.canAccessAdmin(),
    //   canAccessDoctor: this.canAccessDoctor(),
    //   canAccessEmployee: this.canAccessEmployee(),
    //   canAccessMaster: this.canAccessMaster(),
    //   canAccessOwner: this.canAccessOwner(),
    //   canAccessAccountant: this.canAccessAccountant()
    // });
  }

  // Reload user data method
  public reloadUserData() {
    console.log('Main Navbar - Manually reloading user data...');
    this.authService.loadUserFullData();

    // Debug after reload
    setTimeout(() => {
      this.debugUserData();
    }, 1000);
  }

  logout(){
    this.authService.logout();
    // Assuming router is available in the component's context
    // If not, you might need to inject it or access it differently
    // For now, commenting out as per original file's structure
    // this.router.navigate(['/login']);
  }

  // Helper methods for template - updated to use new role system
  canCreateUser(): boolean {
    const result = this.authService.hasAnyRole(['MASTER', 'OWNER', 'ADMIN']);
    // console.log('Main Navbar - canCreateUser:', result);
    return result;
  }

  canAccessAdmin(): boolean {
    const result = this.authService.hasAnyRole(['MASTER', 'OWNER', 'ADMIN']);
    // console.log('Main Navbar - canAccessAdmin:', result);
    return result;
  }

  canAccessDoctor(): boolean {
    const result = this.authService.isDoctor();
    // console.log('Main Navbar - canAccessDoctor:', result);
    return result;
  }

  canAccessEmployee(): boolean {
    const result = this.authService.isEmployee();
    // console.log('Main Navbar - canAccessEmployee:', result);
    return result;
  }

  canAccessAccountant(): boolean {
    const result = this.authService.hasRole('ACCOUNTANT');
    // console.log('Main Navbar - canAccessAccountant:', result);
    return result;
  }

  canAccessMaster(): boolean {
    const result = this.authService.hasRole('MASTER');
    // console.log('Main Navbar - canAccessMaster:', result);
    return result;
  }

  canAccessOwner(): boolean {
    const result = this.authService.hasRole('OWNER');
    // console.log('Main Navbar - canAccessOwner:', result);
    return result;
  }

  canAccessFinancial(): boolean {
    const result = this.authService.hasAnyRole(['ACCOUNTANT', 'ADMIN', 'OWNER', 'MASTER']);
    // console.log('Main Navbar - canAccessFinancial:', result);
    return result;
  }

  canManageUsers(): boolean {
    const result = this.authService.hasAnyRole(['MASTER', 'OWNER', 'ADMIN']);
    // console.log('Main Navbar - canManageUsers:', result);
    return result;
  }

  canManageInventory(): boolean {
    const result = this.authService.hasAnyRole(['MASTER', 'OWNER', 'ADMIN', 'ACCOUNTANT']);
    // console.log('Main Navbar - canManageInventory:', result);
    return result;
  }

  canAccessSystemSettings(): boolean {
    const result = this.authService.hasAnyRole(['MASTER', 'OWNER', 'ADMIN']);
    // console.log('Main Navbar - canAccessSystemSettings:', result);
    return result;
  }

  // New method to determine primary role for navigation when user has multiple roles
  getPrimaryRole(): string {
    const roles = this.authService.userRoles();
    const rolePriority = ['MASTER', 'OWNER', 'ADMIN', 'ACCOUNTANT', 'USER'];

    for (const priorityRole of rolePriority) {
      if (roles.includes(priorityRole)) {
        return priorityRole;
      }
    }
    return 'USER';
  }

  // Method to check if user should see multiple role panels
  shouldShowMultiplePanels(): boolean {
    const roles = this.authService.userRoles();
    const hasDoctorAccess = this.authService.isDoctor();
    const hasEmployeeAccess = this.authService.isEmployee();

    return roles.length > 1 || hasDoctorAccess || hasEmployeeAccess;
  }

  // Method to get all accessible roles for the user
  getAccessibleRoles(): string[] {
    const roles = this.authService.userRoles();
    return roles.filter((role: string) =>
      this.authService.hasRole(role)
    );
  }

  // Method to check if a specific role panel should be shown
  shouldShowRolePanel(role: string): boolean {
    if (role === 'DOCTOR') {
      return this.authService.isDoctor();
    }

    if (role === 'EMPLOYEE') {
      return this.authService.isEmployee();
    }

    // For other roles, use the role-based logic
    const primaryRole = this.getPrimaryRole();
    const roles = this.authService.userRoles();

    // Always show the primary role panel
    if (role === primaryRole) {
      return true;
    }

    // Show secondary role panels only if user has multiple roles
    if (roles.length > 1) {
      return this.authService.hasRole(role);
    }

    return false;
  }

  // Method to get navigation suggestions for users with multiple roles
  getNavigationSuggestions(): string[] {
    const suggestions = [];

    if (this.authService.isDoctor()) {
      suggestions.push('Use Doctor Panel for patient care and appointments');
    }

    if (this.authService.isEmployee()) {
      suggestions.push('Use Employee Panel for administrative tasks');
    }

    const roles = this.authService.userRoles();
    if (roles.includes('ADMIN')) {
      suggestions.push('Use Admin Panel for system management');
    }

    return suggestions;
  }

  // Method to log current navigation state
  logNavigationState(): void {
    // console.log('Navigation State Debug:', {
    //   currentRoles: this.authService.userRoles(),
    //   primaryRole: this.getPrimaryRole(),
    //   hasMultipleRoles: this.shouldShowMultiplePanels(),
    //   canAccessDoctor: this.canAccessDoctor(),
    //   canAccessEmployee: this.canAccessEmployee(),
    //   shouldShowDoctorPanel: this.shouldShowRolePanel('DOCTOR'),
    //   shouldShowEmployeePanel: this.shouldShowRolePanel('EMPLOYEE'),
    //   navigationSuggestions: this.getNavigationSuggestions()
    // });
  }

  // Method to log current route information
  logCurrentRoute(): void {
    // console.log('Current Route Debug:', {
    //   currentUrl: window.location.href,
    //   currentPath: window.location.pathname,
    //   userRoles: this.authService.userRoles(),
    //   isDoctor: this.authService.isDoctor(),
    //   isEmployee: this.authService.isEmployee(),
    //   primaryRole: this.getPrimaryRole()
    // });
  }

  // Method to debug navigation conflicts
  debugNavigationConflicts(): void {
    // console.log('Navigation Conflicts Debug:', {
    //   doctorRoutes: [
    //     '/doctor',
    //     '/doctor/dashboard',
    //     '/doctor/appointments',
    //     '/doctor/patients',
    //     '/doctor/schedule'
    //   ],
    //   employeeRoutes: [
    //     '/employee',
    //     '/employee/dashboard',
    //     '/employee/payments',
    //     '/employee/transactions',
    //     '/employee/invoices'
    //   ],
    //   currentPath: window.location.pathname,
    //   shouldShowDoctorPanel: this.shouldShowRolePanel('DOCTOR'),
    //   shouldShowEmployeePanel: this.shouldShowRolePanel('EMPLOYEE'),
    //   canAccessDoctor: this.canAccessDoctor(),
    //   canAccessEmployee: this.canAccessEmployee()
    // });
  }
}
