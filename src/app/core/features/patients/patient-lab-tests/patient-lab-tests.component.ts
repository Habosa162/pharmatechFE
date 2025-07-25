import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PatientlabtestsService } from '../../../services/patients/patientlabtests.service';
import { LabtestService } from '../../../services/clinics/labtest.service';
import { PatientService } from '../../../services/patients/patient.service';
import { PatientLabTestDTO, CreatePatientLabTestDTO, UpdatePatientLabTestDTO, PatientLabTestStatus } from '../../../Interfaces/patient/patients/patientlabtests';
import { LabtestDto } from '../../../Interfaces/patient/labtests/labtest';
import { PatientDto } from '../../../Interfaces/patient/patients/patient';

@Component({
  selector: 'app-patient-lab-tests',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-lab-tests.component.html',
  styleUrls: ['./patient-lab-tests.component.css']
})
export class PatientLabTestsComponent implements OnInit {
  patientId!: number;
  appointmentId: number | null = null;
  cameFromAppointment = false;
  patient: PatientDto | null = null;
  patientLabTests: PatientLabTestDTO[] = [];
  availableLabTests: LabtestDto[] = [];
  
  labTestForm: FormGroup;
  
  loading = false;
  error: string | null = null;
  success: string | null = null;
  
  showAddForm = false;
  editingLabTest: PatientLabTestDTO | null = null;
  editingId: number | null = null;

  // Enum for template access
  PatientLabTestStatus = PatientLabTestStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private patientLabTestsService: PatientlabtestsService,
    private labTestService: LabtestService,
    private patientService: PatientService
  ) {
    this.labTestForm = this.fb.group({
      labTestId: ['', Validators.required],
      result: ['']
    });
  }

  ngOnInit() {
    this.patientId = +this.route.snapshot.params['id'];
    
    // Check if we came from an appointment
    const appointmentId = this.route.snapshot.queryParams['appointmentId'];
    if (appointmentId) {
      this.appointmentId = +appointmentId;
      this.cameFromAppointment = true;
    }
    
    console.log('Patient ID from route:', this.patientId);
    console.log('Appointment ID from query params:', this.appointmentId);
    console.log('Came from appointment:', this.cameFromAppointment);
    
    this.loadPatientDetails();
    this.loadAvailableLabTests();
    this.loadPatientLabTests();
  }

  loadPatientDetails() {
    this.patientService.getPatientById(this.patientId).subscribe({
      next: (patient: PatientDto) => {
        this.patient = patient;
        console.log('Patient loaded:', patient);
      },
      error: (err) => {
        console.error('Failed to load patient details:', err);
        this.error = 'Failed to load patient details';
      }
    });
  }

  loadAvailableLabTests() {
    this.labTestService.getAllLabtests().subscribe({
      next: (labTests: LabtestDto[]) => {
        this.availableLabTests = labTests;
        console.log('Available lab tests loaded:', labTests);
      },
      error: (err) => {
        console.error('Failed to load available lab tests:', err);
        this.error = 'Failed to load available lab tests';
      }
    });
  }

  loadPatientLabTests() {
    this.loading = true;
    this.patientLabTestsService.getByPatientId(this.patientId).subscribe({
      next: (labTests: PatientLabTestDTO[]) => {
        this.patientLabTests = labTests;
        console.log('Patient lab tests loaded:', labTests);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load patient lab tests:', err);
        this.error = 'Failed to load patient lab tests';
        this.loading = false;
      }
    });
  }

  showAddLabTestForm() {
    this.showAddForm = true;
    this.editingLabTest = null;
    this.editingId = null;
    this.resetForm();
  }

  editLabTest(labTest: PatientLabTestDTO, id: number) {
    this.showAddForm = true;
    this.editingLabTest = labTest;
    this.editingId = id;
    
    // Add required validation to result field when editing
    this.labTestForm.get('result')?.setValidators([Validators.required]);
    this.labTestForm.get('result')?.updateValueAndValidity();
    
    this.populateForm(labTest);
  }

  private resetForm() {
    this.labTestForm.reset();
    
    // Remove required validation from result field when creating new lab test
    this.labTestForm.get('result')?.clearValidators();
    this.labTestForm.get('result')?.updateValueAndValidity();
  }

  private populateForm(labTest: PatientLabTestDTO) {
    // Find the lab test by name to get the ID
    const selectedLabTest = this.availableLabTests.find(lt => lt.name === labTest.labTestName);
    
    this.labTestForm.patchValue({
      labTestId: selectedLabTest ? selectedLabTest.id : '',
      result: labTest.result || ''
    });
  }

  saveLabTest() {
    if (this.labTestForm.invalid) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    const formValue = this.labTestForm.value;

    if (this.editingId) {
      // Update existing lab test
      const updateData: UpdatePatientLabTestDTO = {
        result: formValue.result || ''
      };

      this.patientLabTestsService.updateLabTest(this.editingId, updateData).subscribe({
        next: () => {
          this.success = 'Lab test updated successfully';
          this.loading = false;
          this.showAddForm = false;
          this.loadPatientLabTests();
        },
        error: (err) => {
          console.error('Failed to update lab test:', err);
          this.error = `Failed to update lab test: ${err.error?.message || err.message || 'Unknown error'}`;
          this.loading = false;
        }
      });
    } else {
      // Create new lab test - don't send result field
      const createData: CreatePatientLabTestDTO = {
        labTestId: +formValue.labTestId,
        patientId: this.patientId
      };

      this.patientLabTestsService.addLabTest(createData).subscribe({
        next: () => {
          this.success = 'Lab test created successfully';
          this.loading = false;
          this.showAddForm = false;
          this.loadPatientLabTests();
        },
        error: (err) => {
          console.error('Failed to create lab test:', err);
          this.error = `Failed to create lab test: ${err.error?.message || err.message || 'Unknown error'}`;
          this.loading = false;
        }
      });
    }
  }

  deleteLabTest(id: number) {
    if (!confirm('Are you sure you want to delete this lab test?')) return;

    this.patientLabTestsService.deleteLabTest(id).subscribe({
      next: () => {
        this.success = 'Lab test deleted successfully';
        this.loadPatientLabTests();
      },
      error: (err) => {
        console.error('Failed to delete lab test:', err);
        this.error = `Failed to delete lab test: ${err.error?.message || err.message || 'Unknown error'}`;
      }
    });
  }

  cancelForm() {
    this.showAddForm = false;
    this.editingLabTest = null;
    this.editingId = null;
    this.resetForm();
  }

  goBack() {
    if (this.cameFromAppointment && this.appointmentId) {
      this.router.navigate(['/appointment-details', this.appointmentId]);
    } else {
      this.router.navigate(['/admin/patients']);
    }
  }

  clearMessages() {
    this.error = null;
    this.success = null;
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

  getStatusBadgeClass(status: PatientLabTestStatus): string {
    switch (status) {
      case PatientLabTestStatus.Pending:
        return 'bg-warning';
      case PatientLabTestStatus.Completed:
        return 'bg-success';
      case PatientLabTestStatus.Cancelled:
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getStatusText(status: PatientLabTestStatus): string {
    console.log('Status received:', status, 'Type:', typeof status);
    
    switch (status) {
      case PatientLabTestStatus.Pending:
        return 'Pending';
      case PatientLabTestStatus.Completed:
        return 'Completed';
      case PatientLabTestStatus.Cancelled:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  getLabTestReference(labTestName: string): string {
    const labTest = this.availableLabTests.find(lt => lt.name === labTestName);
    return labTest ? labTest.reference : '';
  }
} 