import { ILoginUser } from './../../../Models/auth.models';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  onLogin() {
    const loginData: ILoginUser = {
      username: this.username,
      password: this.password
    };

    this.authService.login(loginData).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        const role = this.authService.getUserRole();
        if (role === 'Admin') {
          this.router.navigate(['/admin']);
        } else if (role === 'Master') {
          this.router.navigate(['/master']);
        } else if (role === 'Employee') {
          this.router.navigate(['/employee']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        console.error('Login failed:', err);
        this.errorMessage = 'Invalid credentials. Please try again.';
      }
    });
  }
}
