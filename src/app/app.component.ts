import { Component } from '@angular/core';
import { MainLayoutComponent } from "./core/layouts/main-layout/main-layout.component";
import { AdminLayoutComponent } from './core/layouts/admin-layout/admin-layout.component';
import { MasterLayoutComponent } from './core/layouts/master-layout/master-layout.component';
import { AuthService } from './core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [ CommonModule, MainLayoutComponent,AdminLayoutComponent,MasterLayoutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'pharmatechFE';
  constructor(protected authService:AuthService){}
}
