import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrescriptionService } from '../../../../services/patients/prescription.service';
import { AllPrescriptions, CreatePrescription, UpdatePrescription } from '../../../../Interfaces/patient/prescriptions/prescription';
import { CommonModule } from '@angular/common';

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
    private fb: FormBuilder
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
    const payload: CreatePrescription | UpdatePrescription = {
      diagnosis: formValue.diagnosis,
      prescriptionDate: formValue.prescriptionDate,
      followUpDate: formValue.followUpDate,
      medicalRecordId: +formValue.medicalRecordId,
      medicationsIds: formValue.medicationsIds.split(',').map((id: string) => +id.trim()),
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
    this.prescriptionForm.patchValue({
      diagnosis: p.diagnosis,
      prescriptionDate: p.prescriptionDate,
      followUpDate: '', // Not available in AllPrescriptions, left blank
      medicalRecordId: p.medicalRecordId,
      medicationsIds: '', // Not available, left blank
    });
  }

  deletePrescription(id: number) {
    if (!confirm('Delete this prescription?')) return;
    this.prescriptionService.deletePrescription(id).subscribe({
      next: () => this.loadPrescriptions(),
      error: () => { this.error = 'Failed to delete prescription'; }
    });
  }

  cancelEdit() {
    this.editingId = null;
    this.prescriptionForm.reset();
  }
}
