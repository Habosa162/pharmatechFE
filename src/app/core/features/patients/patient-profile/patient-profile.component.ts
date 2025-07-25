import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../../services/patients/patient.service';
import { MedicalhistoryService } from '../../../services/patients/medicalhistory.service';
import { MedicalrecordService } from '../../../services/patients/medicalrecord.service';
import { SurgeryService } from '../../../services/patients/surgery.service';
import { PatientlabtestsService } from '../../../services/patients/patientlabtests.service';
import { AppointmentService } from '../../../services/appintments/appointment.service';
import { PatientDto } from '../../../Interfaces/patient/patients/patient';
import { MedicalHistory } from '../../../Interfaces/patient/patients/medicalhistory';
import { Allmedicalrecords } from '../../../Interfaces/patient/medicalrecords/medicalrecord';
import { SurgeryDto } from '../../../Interfaces/patient/surgeries/surgery';
import { PatientLabTestDTO } from '../../../Interfaces/patient/patients/patientlabtests';
import { AppointmentDetails, AppointmentStatus } from '../../../Interfaces/all';
import { Gender } from '../../../Interfaces/all';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-patient-profile',
  imports: [CommonModule],
  templateUrl: './patient-profile.component.html',
  styleUrl: './patient-profile.component.css'
})
export class PatientProfileComponent implements OnInit {
  patient: PatientDto | null = null;
  patientId!: number;
  loading = false;
  error: string | null = null;

  // Additional patient data
  medicalHistories: MedicalHistory[] = [];
  medicalRecords: Allmedicalrecords[] = [];
  surgeries: SurgeryDto[] = [];
  labTests: PatientLabTestDTO[] = [];
  appointments: AppointmentDetails[] = [];

  // Summary stats
  totalMedicalHistories = 0;
  totalMedicalRecords = 0;
  totalSurgeries = 0;
  totalLabTests = 0;
  totalAppointments = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private medicalHistoryService: MedicalhistoryService,
    private medicalRecordService: MedicalrecordService,
    private surgeryService: SurgeryService,
    private patientLabTestsService: PatientlabtestsService,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    this.patientId = +this.route.snapshot.params['id'];
    this.loadPatientData();
  }

  loadPatientData(): void {
    this.loading = true;
    this.error = null;

    // Load patient basic info first
    this.patientService.getPatientById(this.patientId).subscribe({
      next: (data: PatientDto) => {
        this.patient = data;
        this.loadAdditionalData();
      },
      error: (err) => {
        console.error('Error loading patient data:', err);
        this.error = 'Failed to load patient data';
        this.loading = false;
      }
    });
  }

  loadAdditionalData(): void {
    // Load all additional patient data in parallel
    forkJoin({
      medicalHistories: this.medicalHistoryService.getMedicalHistoryByPatientId(this.patientId),
      medicalRecords: this.medicalRecordService.getMedicalRecordsByPatientId(this.patientId),
      surgeries: this.surgeryService.getSurgeriesByPatientId(this.patientId),
      labTests: this.patientLabTestsService.getByPatientId(this.patientId),
      appointments: this.appointmentService.getPatientAppointments(this.patientId)
    }).subscribe({
      next: (data) => {
        this.medicalHistories = data.medicalHistories || [];
        this.medicalRecords = data.medicalRecords || [];
        this.surgeries = data.surgeries || [];
        this.labTests = data.labTests || [];
        this.appointments = data.appointments || [];

        console.log(data,"AllData");
        // Update summary stats
        this.totalMedicalHistories = this.medicalHistories.length;
        this.totalMedicalRecords = this.medicalRecords.length;
        this.totalSurgeries = this.surgeries.length;
        this.totalLabTests = this.labTests.length;
        this.totalAppointments = this.appointments.length;

        this.loading = false;
      },
      error: (err) => {
                console.log(err,"AllData");

        console.error('Error loading additional patient data:', err);
        // Don't show error for additional data, just log it
        this.loading = false;
      }
    });
  }

  calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  getGenderText(gender: Gender): string {
    return gender === Gender.male ? 'Male' : 'Female';
  }

  getAppointmentStatusText(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.Scheduled:
        return 'Scheduled';
      case AppointmentStatus.Completed:
        return 'Completed';
      case AppointmentStatus.Cancelled:
        return 'Cancelled';
      case AppointmentStatus.NoShow:
        return 'No Show';
      default:
        return 'Unknown';
    }
  }

  getAppointmentStatusClass(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.Scheduled:
        return 'bg-primary';
      case AppointmentStatus.Completed:
        return 'bg-success';
      case AppointmentStatus.Cancelled:
        return 'bg-danger';
      case AppointmentStatus.NoShow:
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  }

  // Navigation methods
  viewAppointments(): void {
    this.router.navigate(['/patientAppointments', this.patientId]);
  }

  viewMedicalHistory(): void {
    this.router.navigate(['/patient-medical-history', this.patientId]);
  }

  viewMedicalRecords(): void {
    this.router.navigate(['/patient-medical-records', this.patientId]);
  }

  viewSurgeries(): void {
    this.router.navigate(['/patient-surgeries', this.patientId]);
  }

  viewLabTests(): void {
    this.router.navigate(['/patient-lab-tests', this.patientId]);
  }

  viewPrescriptions(): void {
    this.router.navigate(['/patient-prescriptions', this.patientId]);
  }

  editPatient(): void {
    this.router.navigate(['/admin/patients/edit', this.patientId]);
  }

  goBack(): void {
    this.router.navigate(['/admin/patients']);
  }

  // Utility methods for recent data
  getRecentAppointments(count: number = 3): AppointmentDetails[] {
    return this.appointments
      .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())
      .slice(0, count);
  }

  getRecentMedicalRecords(count: number = 3): Allmedicalrecords[] {
    return this.medicalRecords
      .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
      .slice(0, count);
  }

  getRecentSurgeries(count: number = 3): SurgeryDto[] {
    return this.surgeries
      .filter(s => s.surgeryDate)
      .sort((a, b) => new Date(b.surgeryDate!).getTime() - new Date(a.surgeryDate!).getTime())
      .slice(0, count);
  }
}
