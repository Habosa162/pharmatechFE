import { ILoginUser } from './../../../Models/auth.models';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  private translateService = inject(TranslateService);

  constructor(private router: Router, protected authService: AuthService) {}

  onLogin() {
    const loginData: ILoginUser = {
      username: this.username,
      password: this.password
    };
 
    this.authService.login(loginData).subscribe({
      next: (res) => {
        // Use the new signal-based login state management
        this.authService.setLoginState(res.token);
        
        // Load user full data after successful login
        this.authService.loadUserFullData();
        
        // Wait a bit for the data to load, then navigate based on role
        setTimeout(() => {
          const highestRole = this.authService.getHighestRole();
          const isDoctor = this.authService.isDoctor();
          const isEmployee = this.authService.isEmployee();
          
          if (highestRole === 'MASTER') {
            this.router.navigate(['/master']);
          } else if (highestRole === 'OWNER') {
            this.router.navigate(['/owner']);
          } else if (highestRole === 'ADMIN') {
            this.router.navigate(['/admin']);
          } else if (isDoctor) {
            this.router.navigate(['/doctor/dashboard']);
          } else if (isEmployee) {
            this.router.navigate(['/employee/dashboard']);
          } else if (highestRole === 'ACCOUNTANT') {
            this.router.navigate(['/accountant/dashboard']);
          } else {
            this.router.navigate(['/user/dashboard']);
          }
        }, 500);
      },
      error: (err) => {
       // console.error('Login failed:', err);
        this.translateService.get('LOGIN.INVALID_CREDENTIALS').subscribe(translation => {
          this.errorMessage = translation;
        });
      }
    });
  }
}
