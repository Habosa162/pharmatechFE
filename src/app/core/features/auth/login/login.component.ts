import { ILoginUser } from './../../../Models/auth.models';
import { CommonModule } from '@angular/common';
import { HttpContext } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {  Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private router:Router,private authService:AuthService) {}
    onLogin() {
      console.log('Logging in with', this.username, this.password);
     this.authService.login({username : this.username,password :  this.password}).subscribe((res)=>{
        localStorage.setItem('token', res.token); 
        console.log(res);
     },(err)=>{
      console.log(err);
      
     })
    }
}
