import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AppointmentService } from '../../../services/appintments/appointment.service';
import { PatientService } from '../../../services/patients/patient.service';
import { SurgeryService } from '../../../services/patients/surgery.service';
import { LabtestService } from '../../../services/clinics/labtest.service';
import { MedicalrecordService } from '../../../services/patients/medicalrecord.service';
import { AuthService } from '../../../services/auth.service';
import { AccountService } from '../../../services/account.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Createmedicalrecord } from '../../../Interfaces/patient/medicalrecords/medicalrecord';

@Component({
  selector: 'app-doctor-sidebar',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
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
  
  // Medical Record Modal properties
  selectedAppointment: any = null;
  medicalRecordForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private surgeryService: SurgeryService,
    private labtestService: LabtestService,
    private medicalRecordService: MedicalrecordService,
    private authService: AuthService,
    private accountservice: AccountService,
    private fb: FormBuilder
  ) {
    this.medicalRecordForm = this.fb.group({
      visitDate: ['', Validators.required],
      notes: [''],
      appointmentId: ['', Validators.required]
    });
  }

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

  openExaminationModal(appointment: any) {
    this.selectedAppointment = appointment;
    this.error = null;
    
    // Set current date and time as default visit date
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    
    this.medicalRecordForm.patchValue({
      visitDate: localDateTime,
      notes: '',
      appointmentId: appointment.id
    });
  }

  createMedicalRecord() {
    if (this.medicalRecordForm.invalid) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    this.error = null;

    const formValue = this.medicalRecordForm.value;
    const medicalRecord: Createmedicalrecord = {
      visitDate: formValue.visitDate,
      notes: formValue.notes || '',
      appointmentId: formValue.appointmentId
    };

    this.medicalRecordService.addMedicalRecord(medicalRecord).subscribe({
      next: (response) => {
        console.log('Medical record created successfully:', response);
        this.loading = false;
        
        // Close modal programmatically
        const modalElement = document.getElementById('examinationModal');
        if (modalElement) {
          const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }
        }
        
        // Reset form
        this.medicalRecordForm.reset();
        this.selectedAppointment = null;
        
        // Optionally reload appointments to reflect any status changes
        this.loadAppointments();
      },
      error: (err) => {
        console.error('Failed to create medical record:', err);
        this.error = 'Failed to create medical record. Please try again.';
        this.loading = false;
      }
    });
  }
} 