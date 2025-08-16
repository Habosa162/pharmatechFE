import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../services/account.service';
import { DoctorViewDTO, UpdateDoctorDTO } from '../../../Interfaces/all';
import { Location } from '@angular/common';
import { environment } from '../../../services/enviroment';

@Component({
  selector: 'app-doctor-profile',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './doctor-profile.component.html',
  styleUrl: './doctor-profile.component.css'
})
export class DoctorProfileComponent implements OnInit {
  filesurl=environment.filesurl;
  doctor: DoctorViewDTO | null = null;
  doctorId: number = 0;
  loading = false;
  error: string | null = null;
  success: string | null = null;

  // Edit mode properties
  editMode = false;
  editForm: FormGroup;
  saving = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private location: Location,
    private formBuilder: FormBuilder
  ) {
    this.editForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      specialization: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{8,15}$/)]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.doctorId = +params['id'];
      if (this.doctorId) {
        this.loadDoctorProfile();
      } else {
        this.error = 'Invalid doctor ID';
      }
    });
  }

  loadDoctorProfile(): void {
    this.loading = true;
    this.error = null;

    this.accountService.getDoctorById(this.doctorId).subscribe({
      next: (doctor: DoctorViewDTO) => {
        this.doctor = doctor;
        this.populateEditForm();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading doctor profile:', error);
        this.error = 'Failed to load doctor profile. Please try again.';
        this.loading = false;
      }
    });
  }

  populateEditForm(): void {
    if (this.doctor) {
      this.editForm.patchValue({
        name: this.doctor.name,
        specialization: this.doctor.specialization,
        phoneNumber: this.doctor.phoneNumber
      });
    }
  }

  formatDateForInput(dateString: string | Date | null): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  goBack(): void {
    this.location.back();
  }

  goToDoctorsList(): void {
    this.router.navigate(['/DoctorsList']);
  }

  toggleEditMode(): void {
    if (this.editMode) {
      this.cancelEdit();
    } else {
      this.editMode = true;
      this.populateEditForm();
      this.clearMessages();
    }
  }

  cancelEdit(): void {
    this.editMode = false;
    this.populateEditForm(); // Reset form to original values
    this.clearMessages();
  }

  saveChanges(): void {
    if (this.editForm.valid && this.doctor) {
      this.saving = true;
      this.error = null;

      const updateData: UpdateDoctorDTO = {
        id: this.doctor.id,
        name: this.editForm.value.name,
        specialization: this.editForm.value.specialization,
        phoneNumber: this.editForm.value.phoneNumber
      };

      this.accountService.updateDoctor(updateData).subscribe({
        next: (response) => {
          this.success = 'Doctor profile updated successfully!';
          this.saving = false;
          this.editMode = false;
          this.loadDoctorProfile(); // Reload to get updated data
        },
        error: (error) => {
          console.error('Error updating doctor profile:', error);
          this.error = 'Failed to update doctor profile. Please try again.';
          this.saving = false;
        }
      });
    } else {
      this.error = 'Please fill in all required fields correctly.';
    }
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'badge-success' : 'badge-danger';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  formatDate(dateString: string | Date | null): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  calculateExperience(): string {
    if (!this.doctor?.startDate) return 'N/A';
    
    const startDate = new Date(this.doctor.startDate);
    const endDate = this.doctor.endDate ? new Date(this.doctor.endDate) : new Date();
    
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    const diffMonths = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    
    if (diffYears > 0) {
      return `${diffYears} year${diffYears > 1 ? 's' : ''} ${diffMonths > 0 ? `${diffMonths} month${diffMonths > 1 ? 's' : ''}` : ''}`;
    } else {
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
    }
  }

  clearMessages(): void {
    this.error = null;
    this.success = null;
  }

  refreshProfile(): void {
    this.loadDoctorProfile();
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.editForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['pattern']) return `${fieldName} format is invalid`;
    }
    return '';
  }
}
