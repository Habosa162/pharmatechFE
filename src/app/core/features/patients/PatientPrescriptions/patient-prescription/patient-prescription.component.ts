import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrescriptionService } from '../../../../services/patients/prescription.service';
import { AllPrescriptions, CreatePrescription, UpdatePrescription, PrescriptionMedicationsDto, PrescriptionDto } from '../../../../Interfaces/patient/prescriptions/prescription';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-patient-prescription',
  imports:[ReactiveFormsModule,FormsModule,CommonModule],
  templateUrl: './patient-prescription.component.html',
  styleUrls: ['./patient-prescription.component.css']
})
export class PatientPrescriptionComponent implements OnInit {
  prescriptions: AllPrescriptions[] = [];
  loading = false;
  error: string | null = null;
  prescriptionForm: FormGroup;
  editingId: number | null = null;

  constructor(
    private prescriptionService: PrescriptionService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.prescriptionForm = this.fb.group({
      diagnosis: ['', Validators.required],
      prescriptionDate: ['', Validators.required],
      followUpDate: ['', Validators.required],
      medicalRecordId: ['', Validators.required],
      medicationsIds: ['', Validators.required], // comma-separated for demo
    });
  }

  ngOnInit() {
    this.loadPrescriptions();
  }

  loadPrescriptions() {
    this.loading = true;
    this.prescriptionService.getAllPrescriptions().subscribe({
      next: (data) => {
        this.prescriptions = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load prescriptions';
        this.loading = false;
      }
    });
  }

  submitForm() {
    if (this.prescriptionForm.invalid) return;
    const formValue = this.prescriptionForm.value;
    
    // Convert comma-separated IDs to PrescriptionMedicationsDto array
    const medications: PrescriptionMedicationsDto[] = formValue.medicationsIds
      .split(',')
      .map((id: string) => +id.trim())
      .filter((id: number) => id > 0)
      .map((id: number) => ({
        id: id,
        medicationName: `Medication ${id}`, // Placeholder name
        dosage: '',
        frequency: '',
        duration: '',
        notes: ''
      }));

    const payload: CreatePrescription | UpdatePrescription = {
      diagnosis: formValue.diagnosis,
      prescriptionDate: formValue.prescriptionDate,
      followUpDate: formValue.followUpDate,
      medicalRecordId: +formValue.medicalRecordId,
      medications: medications,
    };
    if (this.editingId) {
      // Update
      this.prescriptionService.updatePrescription(this.editingId, payload as UpdatePrescription).subscribe({
        next: () => {
          this.loadPrescriptions();
          this.prescriptionForm.reset();
          this.editingId = null;
        },
        error: () => { this.error = 'Failed to update prescription'; }
      });
    } else {
      // Create
      this.prescriptionService.addPrescription(payload as CreatePrescription).subscribe({
        next: () => {
          this.loadPrescriptions();
          this.prescriptionForm.reset();
        },
        error: () => { this.error = 'Failed to create prescription'; }
      });
    }
  }

  editPrescription(p: AllPrescriptions) {
    this.editingId = p.id;
    
    // Load full prescription details to get medications
    this.prescriptionService.getPrescriptionById(p.id).subscribe({
      next: (fullPrescription: PrescriptionDto) => {
        console.log('Full prescription loaded for editing:', fullPrescription);
        
        // Format medications as comma-separated IDs for the simple input
        const medicationIds = fullPrescription.medications
          .map(med => med.id.toString())
          .join(', ');
        
        this.prescriptionForm.patchValue({
          diagnosis: fullPrescription.diagnosis,
          prescriptionDate: fullPrescription.prescriptionDate,
          followUpDate: fullPrescription.followUpDate,
          medicalRecordId: p.medicalRecordId,
          medicationsIds: medicationIds,
        });
        
        console.log('Form populated with existing data:', this.prescriptionForm.value);
      },
      error: (err) => {
        console.error('Failed to load full prescription details:', err);
        
        // Fallback: use basic data from AllPrescriptions
        this.prescriptionForm.patchValue({
          diagnosis: p.diagnosis,
          prescriptionDate: p.prescriptionDate,
          followUpDate: '', // Not available in AllPrescriptions, left blank
          medicalRecordId: p.medicalRecordId,
          medicationsIds: '', // Not available, left blank
        });
      }
    });
  }

  deletePrescription(id: number) {
    if (!confirm('Delete this prescription?')) return;
    this.prescriptionService.deletePrescription(id).subscribe({
      next: () => this.loadPrescriptions(),
      error: () => { this.error = 'Failed to delete prescription'; }
    });
  }

  viewPrescriptionDetails(id: number) {
    this.router.navigate(['/prescriptions', id]);
  }

  cancelEdit() {
    this.editingId = null;
    this.prescriptionForm.reset();
  }

  // Helper method to format medications for display
  formatMedicationsForDisplay(medications: PrescriptionMedicationsDto[]): string {
    if (!medications || medications.length === 0) {
      return 'No medications';
    }
    
    return medications.map(med => {
      let display = med.medicationName;
      if (med.dosage) display += ` (${med.dosage})`;
      return display;
    }).join(', ');
  }
}
