import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MedicalrecordService } from '../../../services/patients/medicalrecord.service';
import { PrescriptionService } from '../../../services/patients/prescription.service';
import { MedicalhistoryService } from '../../../services/patients/medicalhistory.service';
import { MedicalrecordDto, Allmedicalrecords, Createmedicalrecord, Updatemedicalrecord } from '../../../Interfaces/patient/medicalrecords/medicalrecord';
import { PrescriptionDto, AllPrescriptions, CreatePrescription, PrescriptionMedicationsDto } from '../../../Interfaces/patient/prescriptions/prescription';
import { MedicalHistory } from '../../../Interfaces/patient/patients/medicalhistory';

@Component({
  selector: 'app-medical-record-details',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './medical-record-details.component.html',
  styleUrls: ['./medical-record-details.component.css']
})
export class MedicalRecordDetailsComponent implements OnInit {
  medicalRecordId!: number;
  medicalRecord: MedicalrecordDto | null = null;
  medicalHistory: MedicalHistory[] = [];
  prescriptions: AllPrescriptions[] = [];
  
  loading = false;
  error: string | null = null;
  success: string | null = null;

  // Form properties
  showEditForm = false;
  showAddPrescriptionForm = false;
  medicalRecordForm: FormGroup;
  prescriptionForm: FormGroup;
  
  // Loading states
  editingRecord = false;
  addingPrescription = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private medicalRecordService: MedicalrecordService,
    private prescriptionService: PrescriptionService,
    private medicalHistoryService: MedicalhistoryService,
    private formBuilder: FormBuilder
  ) {
    this.medicalRecordForm = this.formBuilder.group({
      visitDate: ['', [Validators.required]],
      notes: [''],
      appointmentId: [null]
    });

    this.prescriptionForm = this.formBuilder.group({
      diagnosis: ['', [Validators.required]],
      prescriptionDate: ['', [Validators.required]],
      followUpDate: ['', [Validators.required]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.medicalRecordId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.medicalRecordId) {
      this.loadMedicalRecordDetails();
    }
  }

  loadMedicalRecordDetails(): void {
    this.loading = true;
    this.error = null;

    this.medicalRecordService.getMedicalRecordById(this.medicalRecordId).subscribe({
      next: (record) => {
        this.medicalRecord = record;
        this.loadPrescriptions();
        this.loadMedicalHistory();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading medical record:', err);
        this.error = 'Failed to load medical record details';
        this.loading = false;
      }
    });
  }

  loadPrescriptions(): void {
    if (!this.medicalRecordId) return;

    this.prescriptionService.getPrescriptionsByMedicalrecordId(this.medicalRecordId).subscribe({
      next: (prescriptions) => {
        this.prescriptions = prescriptions;
        console.log('Loaded prescriptions:', prescriptions);
      },
      error: (err) => {
        console.error('Error loading prescriptions:', err);
        // Don't show error for prescriptions as it's not critical
      }
    });
  }

  loadMedicalHistory(): void {
    if (!this.medicalRecord?.patientName) return;

    // Note: This would need a method to get patient ID from patient name
    // For now, we'll skip this or implement a workaround
    console.log('Medical history loading would be implemented here');
  }

  showEditMedicalRecordForm(): void {
    if (!this.medicalRecord) return;

    this.medicalRecordForm.patchValue({
      visitDate: this.formatDateForInput(this.medicalRecord.visitDate),
      notes: this.medicalRecord.notes || '',
      appointmentId: null // This would need to be retrieved from the record
    });

    this.showEditForm = true;
    this.clearMessages();
  }

  closeEditForm(): void {
    this.showEditForm = false;
    this.medicalRecordForm.reset();
    this.clearMessages();
  }

  updateMedicalRecord(): void {
    if (this.medicalRecordForm.invalid || !this.medicalRecordId) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.editingRecord = true;
    const formValue = this.medicalRecordForm.value;
    
    // Convert datetime-local value back to ISO string
    const visitDate = new Date(formValue.visitDate).toISOString();
    
    const updateData: Updatemedicalrecord = {
      visitDate: visitDate,
      notes: formValue.notes || '',
      appointmentId: formValue.appointmentId || 0
    };

    console.log('Updating medical record with data:', updateData);

    this.medicalRecordService.updateMedicalRecord(this.medicalRecordId, updateData).subscribe({
      next: (response) => {
        console.log('Medical record updated successfully:', response);
        this.success = 'Medical record updated successfully';
        this.editingRecord = false;
        this.closeEditForm();
        this.loadMedicalRecordDetails();
      },
      error: (err) => {
        console.error('Failed to update medical record:', err);
        this.error = `Failed to update medical record: ${err.error?.message || err.message || 'Unknown error'}`;
        this.editingRecord = false;
      }
    });
  }

 

  closeAddPrescriptionForm(): void {
    this.showAddPrescriptionForm = false;
    this.prescriptionForm.reset();
    this.clearMessages();
  }

  addPrescription(): void {
    if (this.prescriptionForm.invalid || !this.medicalRecordId) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.addingPrescription = true;
    const formValue = this.prescriptionForm.value;
    
    const prescriptionData: CreatePrescription = {
      diagnosis: formValue.diagnosis,
      prescriptionDate: new Date(formValue.prescriptionDate).toISOString(),
      followUpDate: new Date(formValue.followUpDate).toISOString(),
      medicalRecordId: this.medicalRecordId,
      medications: [] // This would need to be populated with selected medications
    };

    console.log('Adding prescription with data:', prescriptionData);

    this.prescriptionService.addPrescription(prescriptionData).subscribe({
      next: (response) => {
        console.log('Prescription added successfully:', response);
        this.success = 'Prescription added successfully';
        this.addingPrescription = false;
        this.closeAddPrescriptionForm();
        this.loadPrescriptions();
      },
      error: (err) => {
        console.error('Failed to add prescription:', err);
        this.error = `Failed to add prescription: ${err.error?.message || err.message || 'Unknown error'}`;
        this.addingPrescription = false;
      }
    });
  }

  viewPrescriptionDetails(prescriptionId: number): void {
    this.router.navigate(['/prescriptions', prescriptionId]);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format for datetime-local input
  }

  clearMessages(): void {
    this.error = null;
    this.success = null;
  }

  // Form validation helpers
  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    return '';
  }

  goBack(): void {
    this.router.navigate(['/medical-records']);
  }
} 