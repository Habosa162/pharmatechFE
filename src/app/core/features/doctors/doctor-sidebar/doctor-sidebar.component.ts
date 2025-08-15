import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentService } from '../../../services/appintments/appointment.service';
import { PatientService } from '../../../services/patients/patient.service';
import { SurgeryService } from '../../../services/patients/surgery.service';
import { LabtestService } from '../../../services/clinics/labtest.service';
import { AuthService } from '../../../services/auth.service';
import { AccountService } from '../../../services/account.service';
import { AppointmentStatus } from '../../../Interfaces/all';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-doctor-sidebar',
  imports: [FormsModule, CommonModule],
  templateUrl: './doctor-sidebar.component.html',
  styleUrls: ['./doctor-sidebar.component.css']
})
export class DoctorSidebarComponent implements OnInit {
  activeTab: string = 'appointments';
  appointments: any[] = [];
  patients: any[] = [];
  surgeries: any[] = [];
  labtests: any[] = [];
  doctorId: number | null = null;
  userid: string | null = "";
  
  // Error handling
  error: string | null = null;
  loading: boolean = false;

  constructor(
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private surgeryService: SurgeryService,
    private labtestService: LabtestService,
    private authService: AuthService,
    private accountservice: AccountService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userid = this.authService.getUserId();
    if (!this.doctorId) {
      this.accountservice.getDoctoridByUserid(this.userid!).subscribe({
        next: (data) => {
          console.log("data is", data);
          this.doctorId = data.doctorid;
          this.loadAppointments();
        },
        error: (err) => {
          console.error('Failed to fetch doctor ID:', err);
          this.error = 'Failed to fetch doctor information';
        }
      });
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'appointments') this.loadAppointments();
    if (tab === 'patients') this.loadPatients();
    if (tab === 'surgeries') this.loadSurgeries();
    if (tab === 'labtests') this.loadLabtests();
  }

  loadAppointments() {
    console.log(this.userid, this.doctorId, "aaaaaaaaaaaaaaaah");
    if (!this.userid) return;
    this.appointmentService.myappointments(this.userid).subscribe(data => this.appointments = data);
  }

  loadPatients() {
    if (!this.doctorId) return;
    this.patientService.getPatientsByDoctorId(Number(this.doctorId)).subscribe(data => this.patients = data);
  }

  loadSurgeries() {
    if (!this.doctorId) return;
    this.surgeryService.getSurgeriesByDoctorId(Number(this.doctorId)).subscribe(data => this.surgeries = data);
  }

  loadLabtests() {
    this.labtestService.getAllLabtests().subscribe(data => this.labtests = data);
  }

  startExamination(appointment: any) {
    // Navigate to appointment details page
    this.router.navigate(['/appointment-details', appointment.id]);
  }

  cancelAppointment(appointment: any) {
    if (confirm(`Are you sure you want to cancel the appointment for ${appointment.name}? This action cannot be undone.`)) {
      this.loading = true;
      
      this.appointmentService.editstatus(appointment.id, AppointmentStatus.Cancelled).subscribe({
        next: (response) => {
          console.log('Appointment cancelled:', response);
          this.loading = false;
          
          // Update local appointment status
          const appointmentIndex = this.appointments.findIndex(apt => apt.id === appointment.id);
          if (appointmentIndex !== -1) {
            this.appointments[appointmentIndex].status = AppointmentStatus.Cancelled;
          }
          
          // Optionally reload appointments to get fresh data
          this.loadAppointments();
        },
        error: (err) => {
          console.error('Failed to cancel appointment:', err);
          this.error = `Failed to cancel appointment: ${err.error?.message || err.message || 'Unknown error'}`;
          this.loading = false;
        }
      });
    }
  }

  // Enhanced helper methods for the new template
  getTabIcon(): string {
    switch (this.activeTab) {
      case 'appointments': return '📅';
      case 'patients': return '👤';
      case 'surgeries': return '🩺';
      case 'labtests': return '🧪';
      default: return '📋';
    }
  }

  getTabTitle(): string {
    switch (this.activeTab) {
      case 'appointments': return 'Appointments';
      case 'patients': return 'Patients';
      case 'surgeries': return 'Surgeries';
      case 'labtests': return 'Lab Tests';
      default: return 'Dashboard';
    }
  }

  getTabDescription(): string {
    switch (this.activeTab) {
      case 'appointments': return 'Manage your patient appointments and examinations';
      case 'patients': return 'View and manage your patient list';
      case 'surgeries': return 'Manage your surgical procedures and schedules';
      case 'labtests': return 'View and manage laboratory test results';
      default: return 'Overview of your medical practice';
    }
  }

  refreshCurrentTab() {
    this.error = null;
    switch (this.activeTab) {
      case 'appointments': this.loadAppointments(); break;
      case 'patients': this.loadPatients(); break;
      case 'surgeries': this.loadSurgeries(); break;
      case 'labtests': this.loadLabtests(); break;
    }
  }

  getAppointmentsByStatus(status: number): any[] {
    return this.appointments.filter(apt => apt.status === status);
  }

  getAppointmentCardClass(status: number): string {
    switch (status) {
      case 0: return 'scheduled';
      case 1: return 'completed';
      case 2: return 'cancelled';
      case 3: return 'noshow';
      default: return '';
    }
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 0: return 'scheduled';
      case 1: return 'completed';
      case 2: return 'cancelled';
      case 3: return 'noshow';
      default: return 'scheduled';
    }
  }

  getStatusText(status: number): string {
    switch (status) {
      case 0: return 'Scheduled';
      case 1: return 'Completed';
      case 2: return 'Cancelled';
      case 3: return 'No Show';
      default: return 'Unknown';
    }
  }

  formatAppointmentTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  formatAppointmentDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  formatSurgeryDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  viewPatientProfile(patientId: number): void {
    this.router.navigate(['/patient-profile', patientId]);
  }
} 