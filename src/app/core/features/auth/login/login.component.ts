import { CommonModule } from '@angular/common';
import { HttpContext } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {  Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private router:Router) {}
    onLogin() {
      console.log('Logging in with', this.username, this.password);
      // TODO: Call authService and validate login
      // this.router.navigate(['/dashboard']); // just a placeholder route
    }
}
