import { Component } from '@angular/core';
import { AppointmentService } from '../../../services/appintments/appointment.service';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentDetails } from '../../../Interfaces/all';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-appointments',
  imports: [CommonModule],
  templateUrl: './my-appointments.component.html',
  styleUrl: './my-appointments.component.css'
})
export class MyAppointmentsComponent {
 appointments: AppointmentDetails[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private route:ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDoctorAppointments();
  }

  doctorId!:number
  loadDoctorAppointments(): void {
    this.loading = true;
    this.error = null;

    // const userData = this.authService.getUserData();
    // if (!userData || !userData.ID) {
    //   this.error = 'Unable to get user information';
    //   this.loading = false;
    //   return;
    // }

    // // Assuming the user ID from token corresponds to the doctor ID
    // const doctorId = parseInt(userData.ID);
    const userid=this.authService.getUserId()!;
    this.appointmentService.myappointments(userid).subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        console.log(this.appointments);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading doctor appointments:', error);
        this.error = 'Failed to load appointments';
        this.loading = false;
      }
    });
  }

  getStatusClass(status: number | string): string {
    // Handle both numeric and string status values
    const statusValue = typeof status === 'string' ? status.toLowerCase() : status;
    
    switch (statusValue) {
      case 0:
      case 'scheduled':
        return 'status-scheduled';
      case 1:
      case 'completed':
        return 'status-completed';
      case 2:
      case 'cancelled':
        return 'status-cancelled';
      case 3:
      case 'noshow':
        return 'status-noshow';
      default:
        return 'status-default';
    }
  }

  getStatusText(status: number | string): string {
    // Handle both numeric and string status values
    const statusValue = typeof status === 'string' ? status.toLowerCase() : status;
    
    switch (statusValue) {
      case 0:
      case 'scheduled':
        return 'Scheduled';
      case 1:
      case 'completed':
        return 'Completed';
      case 2:
      case 'cancelled':
        return 'Cancelled';
      case 3:
      case 'noshow':
        return 'No Show';
      default:
        return 'Unknown';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  startExamination(appointmentId: number): void {
    this.router.navigate(['/appointment-details', appointmentId]);
  }
}
