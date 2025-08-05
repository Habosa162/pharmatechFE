import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../services/appintments/appointment.service';
import { AppointmentDetails, AppointmentStatus } from '../../../Interfaces/all';

@Component({
  selector: 'app-my-appointments-clinic',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-appointments-clinic.component.html',
  styleUrl: './my-appointments-clinic.component.css'
})
export class MyAppointmentsClinicComponent implements OnInit {
  // Data arrays
  appointments: AppointmentDetails[] = [];
  filteredAppointments: AppointmentDetails[] = [];
  
  // Loading states
  loading = false;
  updatingStatus = false;
  
  // Messages
  success = '';
  error = '';
  
  // Filters
  searchTerm = '';
  selectedStatus: string = 'all';
  selectedDate: string = '';
  
  // Clinic ID (you can make this configurable later)
  clinicId: number = 1; // Default clinic ID, can be changed as needed

  constructor(
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  // Load data methods
  loadAppointments(): void {
    this.loading = true;
    this.appointmentService.getAppointmentsByClinicId(this.clinicId).subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.filteredAppointments = appointments;
        console.log('Loaded appointments for clinic:', this.clinicId, appointments);
        this.loading = false;
        this.onFilterChange();
      },
      error: (err) => {
        this.error = 'Failed to load appointments: ' + err.message;
        this.loading = false;
      }
    });
  }

  // Filter methods
  onFilterChange(): void {
    console.log('Filtering appointments...');
    console.log('Search term:', this.searchTerm);
    console.log('Selected status:', this.selectedStatus);
    console.log('Selected date:', this.selectedDate);
    
    this.filteredAppointments = this.appointments.filter(appointment => {
      const matchesSearch = !this.searchTerm || 
        appointment.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        appointment.doctorName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        appointment.departmentName.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.selectedStatus === 'all' || 
        appointment.status.toString() === this.selectedStatus;
      
      const matchesDate = !this.selectedDate || 
        appointment.appointmentDate.startsWith(this.selectedDate);
      
      return matchesSearch && matchesStatus && matchesDate;
    });
    
    console.log('Filtered appointments count:', this.filteredAppointments.length);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'all';
    this.selectedDate = '';
    this.onFilterChange();
  }

  // Status update methods
  updateAppointmentStatus(appointment: AppointmentDetails, newStatus: AppointmentStatus): void {
    this.updatingStatus = true;
    
    this.appointmentService.editstatus(appointment.id, newStatus).subscribe({
      next: () => {
        this.success = `Appointment status updated to ${this.getStatusText(newStatus)}`;
        this.updatingStatus = false;
        this.loadAppointments(); // Reload to get updated data
        this.clearMessages();
      },
      error: (err) => {
        this.error = 'Failed to update appointment status: ' + err.message;
        this.updatingStatus = false;
      }
    });
  }

  onStatusChange(appointment: AppointmentDetails, event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target && target.value) {
      const newStatus = parseInt(target.value) as AppointmentStatus;
      this.updateAppointmentStatus(appointment, newStatus);
    }
  }

  // Helper methods
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  getStatusBadgeClass(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.Scheduled: return 'badge-primary';
      case AppointmentStatus.Completed: return 'badge-success';
      case AppointmentStatus.Cancelled: return 'badge-danger';
      case AppointmentStatus.NoShow: return 'badge-warning';
      default: return 'badge-secondary';
    }
  }

  getStatusText(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.Scheduled: return 'Scheduled';
      case AppointmentStatus.Completed: return 'Completed';
      case AppointmentStatus.Cancelled: return 'Cancelled';
      case AppointmentStatus.NoShow: return 'No Show';
      default: return 'Unknown';
    }
  }

  getStatusOptions(): { value: AppointmentStatus; text: string }[] {
    return [
      { value: AppointmentStatus.Scheduled, text: 'Scheduled' },
      { value: AppointmentStatus.Completed, text: 'Completed' },
      { value: AppointmentStatus.Cancelled, text: 'Cancelled' },
      { value: AppointmentStatus.NoShow, text: 'No Show' }
    ];
  }

  clearMessages(): void {
    setTimeout(() => {
      this.success = '';
      this.error = '';
    }, 3000);
  }

  // Method to change clinic ID (for future use)
  changeClinicId(newClinicId: number): void {
    this.clinicId = newClinicId;
    this.loadAppointments();
  }
} 