import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { DashboardService, DashboardStats, RoleBasedStats } from '../../../services/dashboard.service';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor-dashboard.component.html',
  styleUrl: './doctor-dashboard.component.css'
})
export class DoctorDashboardComponent implements OnInit {
  dashboardStats: DashboardStats | null = null;
  roleStats: RoleBasedStats | null = null;
  
  loading = true;
  error: string | null = null;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.authService.loadUserFullData();
      this.loadDashboardData();
    }
  }

  loadDashboardData() {
    this.loading = true;
    this.error = null;

    this.dashboardService.getRoleDashboardData().subscribe({
      next: (data) => {
        this.dashboardStats = data.general;
        this.roleStats = data.role;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.error = 'Failed to load dashboard data. Please try again.';
        this.loading = false;
      }
    });
  }

  // Navigation methods
  navigateToMyPatients() {
    this.router.navigate(['/doctor/patients']);
  }

  navigateToMyAppointments() {
    this.router.navigate(['/doctor/appointments']);
  }

  navigateToMySurgeries() {
    this.router.navigate(['/doctor/surgeries']);
  }

  navigateToMedicalRecords() {
    this.router.navigate(['/doctor/medical-records']);
  }

  navigateToSchedule() {
    this.router.navigate(['/doctor/schedule']);
  }

  navigateToPrescriptions() {
    this.router.navigate(['/doctor/prescriptions']);
  }

  refreshDashboard() {
    this.loadDashboardData();
  }
} 