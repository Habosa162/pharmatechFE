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
  }

  // Debug method to log user data
  public debugUserData() {
    const userData = this.authService.getUserFullData();
    const isDoctor = this.authService.isDoctor();
    const isEmployee = this.authService.isEmployee();
    const highestRole = this.authService.getHighestRole();
    
    console.log('Main Navbar - User Data Debug:', {
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
    console.log('Main Navbar - canCreateUser:', result);
    return result;
  }

  canAccessAdmin(): boolean {
    const result = this.authService.hasAnyRole(['MASTER', 'OWNER', 'ADMIN']);
    console.log('Main Navbar - canAccessAdmin:', result);
    return result;
  }

  canAccessDoctor(): boolean {
    const result = this.authService.isDoctor();
    console.log('Main Navbar - canAccessDoctor:', result);
    return result;
  }

  canAccessEmployee(): boolean {
    const result = this.authService.isEmployee();
    console.log('Main Navbar - canAccessEmployee:', result);
    return result;
  }

  canAccessAccountant(): boolean {
    const result = this.authService.hasRole('ACCOUNTANT');
    console.log('Main Navbar - canAccessAccountant:', result);
    return result;
  }

  canAccessMaster(): boolean {
    const result = this.authService.hasRole('MASTER');
    console.log('Main Navbar - canAccessMaster:', result);
    return result;
  }

  canAccessOwner(): boolean {
    const result = this.authService.hasRole('OWNER');
    console.log('Main Navbar - canAccessOwner:', result);
    return result;
  }

  canAccessFinancial(): boolean {
    const result = this.authService.hasAnyRole(['ACCOUNTANT', 'ADMIN', 'OWNER', 'MASTER']);
    console.log('Main Navbar - canAccessFinancial:', result);
    return result;
  }

  canManageUsers(): boolean {
    const result = this.authService.hasAnyRole(['MASTER', 'OWNER', 'ADMIN']);
    console.log('Main Navbar - canManageUsers:', result);
    return result;
  }

  canManageInventory(): boolean {
    const result = this.authService.hasAnyRole(['MASTER', 'OWNER', 'ADMIN', 'ACCOUNTANT']);
    console.log('Main Navbar - canManageInventory:', result);
    return result;
  }

  canAccessSystemSettings(): boolean {
    const result = this.authService.hasAnyRole(['MASTER', 'OWNER', 'ADMIN']);
    console.log('Main Navbar - canAccessSystemSettings:', result);
    return result;
  }
}
