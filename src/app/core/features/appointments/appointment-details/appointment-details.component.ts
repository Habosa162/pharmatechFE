import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../services/appintments/appointment.service';
import { MedicalrecordService } from '../../../services/patients/medicalrecord.service';
import { PrescriptionService } from '../../../services/patients/prescription.service';
import { MedicationService } from '../../../services/clinics/medication.service';
import { Createmedicalrecord, MedicalrecordDto, Updatemedicalrecord } from '../../../Interfaces/patient/medicalrecords/medicalrecord';
import { CreatePrescription, UpdatePrescription, AllPrescriptions, PrescriptionMedicationsDto } from '../../../Interfaces/patient/prescriptions/prescription';
import { AppointmentDetails, AppointmentStatus } from '../../../Interfaces/all';
import { MedicationDto } from '../../../Interfaces/clinic/medications/medication';
import { PrescriptionDto } from '../../../Interfaces/patient/prescriptions/prescription';

@Component({
  selector: 'app-appointment-details',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appointment-details.component.html',
  styleUrls: ['./appointment-details.component.css']
})
export class AppointmentDetailsComponent implements OnInit {
  appointmentId!: number;
  appointment: AppointmentDetails | null = null;
  medicalRecord: MedicalrecordDto | null = null;
  medicalRecordId: number | null = null;
  prescriptions: AllPrescriptions[] = [];
  medications: MedicationDto[] = [];
  
  medicalRecordForm: FormGroup;
  prescriptionForm: FormGroup;
  
  loading = false;
  error: string | null = null;
  success: string | null = null;
  
  editingPrescription: AllPrescriptions | null = null;
  showPrescriptionForm = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private medicalRecordService: MedicalrecordService,
    private prescriptionService: PrescriptionService,
    private medicationService: MedicationService
  ) {
    this.medicalRecordForm = this.fb.group({
      visitDate: ['', Validators.required],
      notes: ['']
    });

    this.prescriptionForm = this.fb.group({
      diagnosis: ['', Validators.required],
      prescriptionDate: ['', Validators.required],
      followUpDate: ['', Validators.required],
      medications: this.fb.array([]) // FormArray for medication details
    });
  }

  // Getter for medications FormArray
  get medicationsFormArray(): FormArray {
    return this.prescriptionForm.get('medications') as FormArray;
  }

  // Create a new medication form group
  createMedicationFormGroup(medication?: PrescriptionMedicationsDto): FormGroup {
    console.log('createMedicationFormGroup called with:', medication);
    
    // Ensure ID is a number
    const medicationId = medication?.id ? +medication.id : 0;
    console.log('Converted medication ID:', medicationId, 'from original:', medication?.id);
    
    const formGroup = this.fb.group({
      id: [medicationId, Validators.required],
      medicationName: [medication?.medicationName || '', Validators.required],
      dosage: [medication?.dosage || ''],
      frequency: [medication?.frequency || ''],
      duration: [medication?.duration || ''],
      notes: [medication?.notes || '']
    });
    
    console.log('Form group created with values:', formGroup.value);
    console.log('ID control value:', formGroup.get('id')?.value);
    
    return formGroup;
  }

  // Add a new medication to the form
  addMedicationToForm() {
    this.medicationsFormArray.push(this.createMedicationFormGroup());
  }

  // Remove a medication from the form
  removeMedicationFromForm(index: number) {
    this.medicationsFormArray.removeAt(index);
  }

  // Handle medication selection from dropdown
  onMedicationSelect(index: number, event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedMedicationId = +selectElement.value;
    
    if (selectedMedicationId > 0) {
      const selectedMedication = this.medications.find(med => med.id === selectedMedicationId);
      if (selectedMedication) {
        const medicationGroup = this.medicationsFormArray.at(index) as FormGroup;
        medicationGroup.patchValue({
          id: selectedMedication.id,
          medicationName: selectedMedication.name
        });
      }
    }
  }

  ngOnInit() {
    this.appointmentId = +this.route.snapshot.params['id'];
    console.log('Appointment ID from route:', this.appointmentId);
    this.loadAppointmentDetails();
    this.createMedicalRecord();
    this.loadMedications();
  }

  loadMedications() {
    console.log('Loading medications...');
    this.medicationService.getAllMedications().subscribe({
      next: (medications: MedicationDto[]) => {
        this.medications = medications;
        console.log('Medications loaded:', medications);
      },
      error: (err) => {
        console.error('Failed to load medications:', err);
        this.error = 'Failed to load medications';
      }
    });
  }

  // Helper method to convert AppointmentStatus enum to readable string
  getStatusText(status: AppointmentStatus): string {
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

  // Helper method to get status badge class
  getStatusBadgeClass(status: AppointmentStatus): string {
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

  loadAppointmentDetails() {
    this.loading = true;
    
    this.appointmentService.getAppointmentById(this.appointmentId).subscribe({
      next: (result: AppointmentDetails) => {
        this.appointment = result;
        console.log('Appointment loaded:', result);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load appointment details:', err);
        this.error = 'Failed to load appointment details';
        this.loading = false;
      }
    });
  }

  createMedicalRecord() {
    const now = new Date();
    // Format the date properly as ISO 8601 string
    const visitDate = now.toISOString();
    
    const medicalRecord: Createmedicalrecord = {
      visitDate: visitDate,
      notes: '', // Empty notes as requested
      appointmentId: this.appointmentId
    };

    console.log('Creating medical record with data:', medicalRecord);

    this.medicalRecordService.addMedicalRecord(medicalRecord).subscribe({
      next: (response) => {
        console.log('Medical record created successfully:', response);
        this.success = 'Medical record created successfully';
        
        // Set the form with the created data
        this.medicalRecordForm.patchValue({
          visitDate: this.formatDateForInput(visitDate),
          notes: ''
        });
        
        // Wait a moment then try to load the medical record
        setTimeout(() => {
          this.loadMedicalRecordByAppointment();
        }, 1000);
      },
      error: (err) => {
        // Check if medical record already exists
        if (err.error?.message?.toLowerCase().includes("medical record already exists") || 
            err.message?.toLowerCase().includes("medical record already exists")) {
          console.log('Medical record already exists, loading existing one...');
          this.success = 'Medical record already exists, loading existing data';
          
          // Load the existing medical record
          this.medicalRecordService.getMedicalRecordsByAppointmenttId(this.appointmentId).subscribe({
            next: (response: MedicalrecordDto) => {
              console.log('Existing medical record loaded:', response);
              this.medicalRecord = response;
              this.medicalRecordForm.patchValue({
                visitDate: this.formatDateForInput(response.visitDate),
                notes: response.notes || ''
              });
              this.medicalRecordId=response.id;
              // Try to get the medical record ID from the list to enable prescriptions
              // this.loadMedicalRecordByAppointment();
              this.loadPrescriptions(this.medicalRecordId!);
            },
            error: (loadErr: any) => {
              console.error('Failed to load existing medical record:', loadErr);
              this.error = `Failed to load existing medical record: ${loadErr.error?.message || loadErr.message || 'Unknown error'}`;
            }
          });
        } else {
          console.error('Failed to create medical record:', err);
          console.error('Error details:', err.error);
          this.error = `Failed to create medical record: ${err.error?.message || err.message || 'Unknown error'}`;
        }
      }
    });
  }

  // Helper method to format ISO date for datetime-local input
  formatDateForInput(isoString: string): string {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  loadMedicalRecordByAppointment() {
    console.log('Loading medical records to find the one for appointment:', this.appointmentId);
    this.medicalRecordService.getAllMedicalRecords().subscribe({
      next: (records) => {
        console.log('All medical records:', records);
        // Note: Since we don't have appointmentId in Allmedicalrecords interface,
        // we'll need to find it by other means or you might need to add a service method
        // For now, let's assume the most recent record is ours
        if (records.length > 0) {
          const latestRecord = records[records.length - 1];
          this.medicalRecordId = latestRecord.id;
          console.log('Set medical record ID to:', this.medicalRecordId);
          this.loadMedicalRecordDetails(latestRecord.id);
        }
      },
      error: (err) => {
        console.error('Failed to load medical records:', err);
        this.error = 'Failed to load medical record details';
      }
    });
  }

  loadMedicalRecordDetails(recordId: number) {
    console.log('Loading medical record details for ID:', recordId);
    this.medicalRecordService.getMedicalRecordById(recordId).subscribe({
      next: (record) => {
        console.log('Medical record details loaded:', record);
        this.medicalRecordId=record.id;
        this.medicalRecord = record;
        this.medicalRecordForm.patchValue({
          visitDate: this.formatDateForInput(record.visitDate),
          notes: record.notes || ''
        });
        // Load prescriptions specifically for this medical record
        this.loadPrescriptions(recordId);
      },
      error: (err) => {
        console.error('Failed to load medical record details:', err);
        this.error = 'Failed to load medical record details';
      }
    });
  }

  loadPrescriptions(medicalRecordId: number) {
    console.log('Loading prescriptions for medical record ID:', medicalRecordId);
    this.prescriptionService.getPrescriptionsByMedicalrecordId(medicalRecordId).subscribe({
      next: (prescriptions) => {
        console.log('Prescriptions loaded for this medical record:', prescriptions);
        this.prescriptions = prescriptions;
      },
      error: (err) => {
        console.error('Failed to load prescriptions for this medical record:', err);
        // Don't show error for prescriptions as it's not critical
      }
    });
  }

  updateMedicalRecord() {
    if (this.medicalRecordForm.invalid || !this.medicalRecordId) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    const formValue = this.medicalRecordForm.value;
    
    // Convert datetime-local value back to ISO string
    const visitDate = new Date(formValue.visitDate).toISOString();
    
    const updateData: Updatemedicalrecord = {
      visitDate: visitDate,
      notes: formValue.notes || '',
      appointmentId: this.appointmentId
    };

    console.log('Updating medical record with data:', updateData);

    this.medicalRecordService.updateMedicalRecord(this.medicalRecordId, updateData).subscribe({
      next: (response) => {
        console.log('Medical record updated successfully:', response);
        this.success = 'Medical record updated successfully';
        this.loading = false;
        this.loadMedicalRecordDetails(this.medicalRecordId!);
      },
      error: (err) => {
        console.error('Failed to update medical record:', err);
        this.error = `Failed to update medical record: ${err.error?.message || err.message || 'Unknown error'}`;
        this.loading = false;
      }
    });
  }

  showAddPrescriptionForm() {
    this.showPrescriptionForm = true;
    this.editingPrescription = null;
    this.prescriptionForm.reset();
    
    // Clear medications array and add one empty medication
    this.medicationsFormArray.clear();
    this.addMedicationToForm();
    
    // Set default values
    const now = new Date();
    const localDateTime = this.formatDateForInput(now.toISOString());
    this.prescriptionForm.patchValue({
      diagnosis: '',
      prescriptionDate: localDateTime,
      followUpDate: localDateTime
    });
    
    console.log('Form reset for new prescription:', this.prescriptionForm.value);
  }

  editPrescription(prescription: AllPrescriptions) {
    this.showPrescriptionForm = true;
    this.editingPrescription = prescription;
    
    // Load full prescription details to get medications
    this.prescriptionService.getPrescriptionById(prescription.id).subscribe({
      next: (fullPrescription: PrescriptionDto) => {
        // Ensure medications are loaded before populating form
        if (this.medications.length === 0) {
          this.loadMedications();
          // Wait a bit for medications to load, then populate form
          setTimeout(() => {
            this.populateEditForm(fullPrescription);
          }, 500);
        } else {
          this.populateEditForm(fullPrescription);
        }
      },
      error: (err) => {
        console.error('Failed to load full prescription details:', err);
        this.error = 'Failed to load prescription details for editing';
        
        // Fallback: use basic data from AllPrescriptions
        this.medicationsFormArray.clear();
        this.addMedicationToForm();
        
        this.prescriptionForm.patchValue({
          diagnosis: prescription.diagnosis,
          prescriptionDate: this.formatDateForInput(prescription.prescriptionDate),
          followUpDate: this.formatDateForInput(prescription.prescriptionDate) // Using same date as fallback
        });
      }
    });
  }

  private populateEditForm(fullPrescription: PrescriptionDto) {
    console.log('Full prescription received:', fullPrescription);
    console.log('Medications in prescription:', fullPrescription.medications);
    
    // Clear medications array
    this.medicationsFormArray.clear();
    
    // Add existing medications to the form
    if (fullPrescription.medications && fullPrescription.medications.length > 0) {
      fullPrescription.medications.forEach((medication, index) => {
        console.log(`Processing medication ${index + 1}:`, medication);
        console.log(`Medication properties:`, {
          id: medication.id,
          medicationName: medication.medicationName,
          dosage: medication.dosage,
          frequency: medication.frequency,
          duration: medication.duration,
          notes: medication.notes
        });
        
        const formGroup = this.createMedicationFormGroup(medication);
        this.medicationsFormArray.push(formGroup);
        
        console.log(`Created form group ${index + 1}:`, formGroup.value);
        console.log(`Form control ID after creation:`, formGroup.get('id')?.value);
      });
    } else {
      console.log('No medications found in prescription');
      // Add one empty medication if none exist
      this.addMedicationToForm();
    }
    
    // Update form with prescription data
    this.prescriptionForm.patchValue({
      diagnosis: fullPrescription.diagnosis,
      prescriptionDate: this.formatDateForInput(fullPrescription.prescriptionDate),
      followUpDate: this.formatDateForInput(fullPrescription.followUpDate)
    });
    
    console.log('Final medications form array:', this.medicationsFormArray.value);
  }

  savePrescription() {
    if (this.prescriptionForm.invalid || !this.medicalRecordId) {
      this.error = 'Please fill in all required fields and ensure medical record is loaded';
      return;
    }

    this.loading = true;
    const formValue = this.prescriptionForm.value;

    // Prepare medications data
    const medications: PrescriptionMedicationsDto[] = formValue.medications.map((med: any) => ({
      id: med.id,
      medicationName: med.medicationName,
      dosage: med.dosage || '',
      frequency: med.frequency || '',
      duration: med.duration || '',
      notes: med.notes || ''
    }));

    if (this.editingPrescription) {
      // Update existing prescription
      const updateData: UpdatePrescription = {
        diagnosis: formValue.diagnosis,
        prescriptionDate: new Date(formValue.prescriptionDate).toISOString(),
        followUpDate: new Date(formValue.followUpDate).toISOString(),
        medications: medications
      };

      this.prescriptionService.updatePrescription(this.editingPrescription.id, updateData).subscribe({
        next: () => {
          this.success = 'Prescription updated successfully';
          this.loading = false;
          this.showPrescriptionForm = false;
          this.loadPrescriptions(this.medicalRecordId!);
        },
        error: (err) => {
          console.error('Failed to update prescription:', err);
          this.error = `Failed to update prescription: ${err.error?.message || err.message || 'Unknown error'}`;
          this.loading = false;
        }
      });
    } else {
      // Create new prescription
      const createData: CreatePrescription = {
        diagnosis: formValue.diagnosis,
        prescriptionDate: new Date(formValue.prescriptionDate).toISOString(),
        followUpDate: new Date(formValue.followUpDate).toISOString(),
        medicalRecordId: this.medicalRecordId,
        medications: medications
      };

      this.prescriptionService.addPrescription(createData).subscribe({
        next: () => {
          this.success = 'Prescription created successfully';
          this.loading = false;
          this.showPrescriptionForm = false;
          this.loadPrescriptions(this.medicalRecordId!);
        },
        error: (err) => {
          console.error('Failed to create prescription:', err);
          this.error = `Failed to create prescription: ${err.error?.message || err.message || 'Unknown error'}`;
          this.loading = false;
        }
      });
    }
  }

  deletePrescription(prescriptionId: number) {
    if (!confirm('Are you sure you want to delete this prescription?')) return;

    this.prescriptionService.deletePrescription(prescriptionId).subscribe({
      next: () => {
        this.success = 'Prescription deleted successfully';
        this.loadPrescriptions(this.medicalRecordId!);
      },
      error: (err) => {
        console.error('Failed to delete prescription:', err);
        this.error = `Failed to delete prescription: ${err.error?.message || err.message || 'Unknown error'}`;
      }
    });
  }

  cancelPrescriptionForm() {
    this.showPrescriptionForm = false;
    this.editingPrescription = null;
    this.prescriptionForm.reset();
    this.medicationsFormArray.clear();
  }

  goBack() {
    this.router.navigate(['/doctorview']);
  }

  clearMessages() {
    this.error = null;
    this.success = null;
  }

  markAsCompleted() {
    if (!this.appointment) {
      this.error = 'No appointment data available';
      return;
    }

    if (confirm('Are you sure you want to mark this appointment as completed?')) {
      this.updateAppointmentStatus(AppointmentStatus.Completed, 'completed');
    }
  }

  markAsScheduled() {
    if (!this.appointment) {
      this.error = 'No appointment data available';
      return;
    }

    if (confirm('Are you sure you want to revert this appointment back to scheduled?')) {
      this.updateAppointmentStatus(AppointmentStatus.Scheduled, 'reverted to scheduled');
    }
  }

  private updateAppointmentStatus(status: AppointmentStatus, actionText: string) {
    this.loading = true;
    
    this.appointmentService.editstatus(this.appointmentId, status).subscribe({
      next: (response) => {
        console.log('Appointment status updated:', response);
        this.success = `Appointment ${actionText} successfully`;
        this.loading = false;
        
        // Update local appointment status
        if (this.appointment) {
          this.appointment.status = status;
        }
      },
      error: (err) => {
        console.error('Failed to update appointment status:', err);
        this.error = `Failed to mark appointment as ${actionText}: ${err.error?.message || err.message || 'Unknown error'}`;
        this.loading = false;
      }
    });
  }
} 