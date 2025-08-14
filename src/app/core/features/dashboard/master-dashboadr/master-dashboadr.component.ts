import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { DashboardService, DashboardStats, RoleBasedStats } from '../../../services/dashboard.service';

@Component({
  selector: 'app-master-dashboadr',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './master-dashboadr.component.html',
  styleUrl: './master-dashboadr.component.css'
})
export class MasterDashboadrComponent implements OnInit {
  // Dashboard statistics
  dashboardStats: DashboardStats | null = null;
  roleStats: RoleBasedStats | null = null;
  
  // Loading states
  loading = true;
  error: string | null = null;

  // User role information
  userRole: string = '';
  isDoctor: boolean = false;
  isEmployee: boolean = false;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Load user data when component initializes
    if (this.authService.isLoggedIn()) {
      this.authService.loadUserFullData();
      this.loadDashboardData();
    }
  }

  loadDashboardData() {
    this.loading = true;
    this.error = null;

    // Get both general and role-based dashboard data
    this.dashboardService.getRoleDashboardData().subscribe({
      next: (data) => {
        this.dashboardStats = data.general;
        this.roleStats = data.role;
        this.userRole = data.role.role;
        this.isDoctor = data.role.isDoctor;
        this.isEmployee = data.role.isEmployee;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.error = 'Failed to load dashboard data. Please try again.';
        this.loading = false;
      }
    });
  }

  // Helper methods for template
  getTotalPatients(): number {
    return this.dashboardStats?.totalPatients || 0;
  }

  getTotalDoctors(): number {
    return this.dashboardStats?.totalDoctors || 0;
  }

  getTotalEmployees(): number {
    return this.dashboardStats?.totalEmployees || 0;
  }

  getTotalAppointments(): number {
    return this.dashboardStats?.totalAppointments || 0;
  }

  getTotalRevenue(): number {
    return this.dashboardStats?.totalRevenue || 0;
  }

  getTotalInvoices(): number {
    return this.dashboardStats?.totalInvoices || 0;
  }

  getTotalMedicalRecords(): number {
    return this.dashboardStats?.totalMedicalRecords || 0;
  }

  getTotalSurgeries(): number {
    return this.dashboardStats?.totalSurgeries || 0;
  }

  getTotalLabTests(): number {
    return this.dashboardStats?.totalLabTests || 0;
  }

  getTotalMedications(): number {
    return this.dashboardStats?.totalMedications || 0;
  }

  getTotalPositions(): number {
    return this.dashboardStats?.totalPositions || 0;
  }

  getTotalDepartments(): number {
    return this.dashboardStats?.totalDepartments || 0;
  }

  getPendingAppointments(): number {
    return this.dashboardStats?.pendingAppointments || 0;
  }

  getCompletedAppointments(): number {
    return this.dashboardStats?.completedAppointments || 0;
  }

  getCancelledAppointments(): number {
    return this.dashboardStats?.cancelledAppointments || 0;
  }

  getPaidInvoices(): number {
    return this.dashboardStats?.paidInvoices || 0;
  }

  getUnpaidInvoices(): number {
    return this.dashboardStats?.unpaidInvoices || 0;
  }

  // Doctor-specific methods
  getMyPatients(): number {
    return this.roleStats?.doctorStats?.myPatients || 0;
  }

  getMyAppointments(): number {
    return this.roleStats?.doctorStats?.myAppointments || 0;
  }

  getMySurgeries(): number {
    return this.roleStats?.doctorStats?.mySurgeries || 0;
  }

  getMyMedicalRecords(): number {
    return this.roleStats?.doctorStats?.myMedicalRecords || 0;
  }

  // Employee-specific methods
  getProcessedPayments(): number {
    return this.roleStats?.employeeStats?.processedPayments || 0;
  }

  getProcessedInvoices(): number {
    return this.roleStats?.employeeStats?.processedInvoices || 0;
  }

  getCustomerInteractions(): number {
    return this.roleStats?.employeeStats?.customerInteractions || 0;
  }

  // Navigation methods
  navigateToPatients() {
    if (this.isDoctor) {
      this.router.navigate(['/doctor/patients']);
    } else {
      this.router.navigate(['/admin/patients']);
    }
  }

  navigateToAppointments() {
    if (this.isDoctor) {
      this.router.navigate(['/doctor/appointments']);
    } else {
      this.router.navigate(['/admin/appointments']);
    }
  }

  navigateToInvoices() {
    if (this.isEmployee) {
      this.router.navigate(['/employee/invoices']);
    } else {
      this.router.navigate(['/admin/invoices']);
    }
  }

  navigateToTransactions() {
    if (this.isEmployee) {
      this.router.navigate(['/employee/transactions']);
    } else {
      this.router.navigate(['/transactions']);
    }
  }

  // Refresh dashboard data
  refreshDashboard() {
    this.loadDashboardData();
  }

  // Get dashboard title based on user role
  getDashboardTitle(): string {
    if (this.userRole === 'MASTER') {
      return 'Master Dashboard';
    } else if (this.userRole === 'OWNER') {
      return 'Owner Dashboard';
    } else if (this.userRole === 'ADMIN') {
      return 'Admin Dashboard';
    } else if (this.isDoctor) {
      return 'Doctor Dashboard';
    } else if (this.isEmployee) {
      return 'Employee Dashboard';
    } else if (this.userRole === 'ACCOUNTANT') {
      return 'Financial Dashboard';
    } else {
      return 'User Dashboard';
    }
  }

  // Check if user can access specific features
  canAccessAdminFeatures(): boolean {
    return this.authService.hasAnyRole(['MASTER', 'OWNER', 'ADMIN']);
  }

  canAccessFinancialFeatures(): boolean {
    return this.authService.hasAnyRole(['ACCOUNTANT', 'ADMIN', 'OWNER', 'MASTER']);
  }

  canAccessDoctorFeatures(): boolean {
    return this.isDoctor;
  }

  canAccessEmployeeFeatures(): boolean {
    return this.isEmployee;
  }
}
