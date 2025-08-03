import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DepartmentService } from '../../../services/clinics/department.service';
import { ClinicService } from '../../../services/clinics/clinic.service';
import { AccountService } from '../../../services/account.service';
import { 
  DepartmentViewDTO, 
  CreateDepartmentDTO, 
  UpdateDepartmentDTO, 
  DoctorDepartmentViewDTO,
  ClinicViewDTO,
  DoctorViewDTO
} from '../../../Interfaces/all';

@Component({
  selector: 'app-department-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './department-management.component.html',
  styleUrl: './department-management.component.css'
})
export class DepartmentManagementComponent implements OnInit {
  // Data arrays
  departments: DepartmentViewDTO[] = [];
  filteredDepartments: DepartmentViewDTO[] = [];
  clinics: ClinicViewDTO[] = [];
  doctorDepartments: DoctorDepartmentViewDTO[] = [];
  allDoctors: DoctorViewDTO[] = [];
  availableDoctors: DoctorViewDTO[] = [];
  
  // Loading states
  loading = false;
  saving = false;
  deleting = false;
  loadingDoctors = false;
  
  // Messages
  success = '';
  error = '';
  
  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  showDetailsModal = false;
  showAssignDoctorModalState = false;
  showRemoveDoctorModalState = false;
  
  // Selected items
  selectedDepartment: DepartmentViewDTO | null = null;
  editingDepartment: DepartmentViewDTO | null = null;
  selectedDoctor: DoctorViewDTO | null = null;
  selectedDoctorDepartment: DoctorDepartmentViewDTO | null = null;
  
  // Filters
  searchTerm = '';
  selectedClinicId: number | 'all' = 'all';
  
  // Forms
  departmentForm: FormGroup;
  assignDoctorForm: FormGroup;
  
  // Debug flags
  usingFallbackDoctors = false;
  
  constructor(
    private departmentService: DepartmentService,
    private clinicService: ClinicService,
    private accountService: AccountService,
    private fb: FormBuilder
  ) {
    this.departmentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      clinicId: ['', Validators.required]
    });

    this.assignDoctorForm = this.fb.group({
      doctorId: ['', Validators.required],
      percentage: [100, [Validators.required, Validators.min(1), Validators.max(100)]]
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
    this.loadClinics();
    this.loadDoctorDepartments();
    this.loadAllDoctors();
  }

  // Load data methods
  loadDepartments(): void {
    this.loading = true;
    this.departmentService.getAllDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
        this.filteredDepartments = departments;
        console.log('Loaded departments:', departments.map(d => `${d.id}: "${d.name}" (Clinic: "${d.clinicName}")`));
        this.loading = false;
        // Apply filters after departments are loaded
        this.onFilterChange();
      },
      error: (err) => {
        this.error = 'Failed to load departments: ' + err.message;
        this.loading = false;
      }
    });
  }

  loadClinics(): void {
    this.clinicService.getAllClinics().subscribe({
      next: (clinics) => {
        this.clinics = clinics;
        console.log('Loaded clinics:', clinics.map(c => `${c.id}: "${c.name}"`));
        // Re-apply filters after clinics are loaded
        this.onFilterChange();
      },
      error: (err) => {
        console.error('Failed to load clinics:', err);
      }
    });
  }

  // Debug method to check clinic-department matching
  debugClinicDepartmentMatching(): void {
    console.log('=== Clinic-Department Matching Debug ===');
    console.log('Available clinics:', this.clinics.map(c => `${c.id}: "${c.name}"`));
    console.log('Departments:', this.departments.map(d => `${d.id}: "${d.name}" (Clinic: "${d.clinicName}")`));
    
    this.departments.forEach(department => {
      const clinicId = this.getClinicIdFromDepartment(department);
      console.log(`Department "${department.name}" -> Clinic ID: ${clinicId}`);
    });
  }

  loadDoctorDepartments(): void {
    this.departmentService.getDoctorDepartments().subscribe({
      next: (doctorDepartments) => {
        this.doctorDepartments = doctorDepartments;
      },
      error: (err) => {
        console.error('Failed to load doctor departments:', err);
      }
    });
  }

  loadAllDoctors(): void {
    this.accountService.getAllDoctors().subscribe({
      next: (doctors) => {
        this.allDoctors = doctors;
      },
      error: (err) => {
        console.error('Failed to load doctors:', err);
      }
    });
  }

  loadAvailableDoctorsForDepartment(departmentId: number): void {
    this.loadingDoctors = true;
    this.usingFallbackDoctors = false;
    console.log('Loading available doctors for department:', departmentId);
    
    this.departmentService.getAvailableDoctorsForDepartment(departmentId).subscribe({
      next: (doctors) => {
        console.log('Available doctors received:', doctors);
        // Apply additional filtering to ensure no assigned doctors are included
        this.availableDoctors = this.filterOutAssignedDoctors(doctors);
        this.loadingDoctors = false;
        
        // If no doctors are available after filtering, try to get all doctors as fallback
        if (!this.availableDoctors || this.availableDoctors.length === 0) {
          console.log('No available doctors found after filtering, trying to get all doctors as fallback');
          this.loadAllDoctorsAsFallback();
        }
      },
      error: (err) => {
        console.error('Failed to load available doctors:', err);
        this.loadingDoctors = false;
        
        // Fallback to all doctors if the specific endpoint fails
        console.log('Trying fallback to all doctors');
        this.loadAllDoctorsAsFallback();
      }
    });
  }

  loadAllDoctorsAsFallback(): void {
    console.log('Loading all doctors as fallback');
    this.usingFallbackDoctors = true;
    this.accountService.getAllDoctors().subscribe({
      next: (doctors) => {
        console.log('All doctors loaded as fallback:', doctors);
        // Filter out doctors already assigned to the department
        this.availableDoctors = this.filterOutAssignedDoctors(doctors);
      },
      error: (err) => {
        console.error('Failed to load all doctors as fallback:', err);
        this.availableDoctors = [];
        this.usingFallbackDoctors = false;
      }
    });
  }

  filterOutAssignedDoctors(allDoctors: DoctorViewDTO[]): DoctorViewDTO[] {
    if (!this.selectedDepartment) return allDoctors;
    
    // Get the IDs of doctors already assigned to this department
    const assignedDoctorIds = this.doctorDepartments
      .filter(dd => dd.departmentId === this.selectedDepartment!.id)
      .map(dd => dd.doctorId);
    
    console.log('Assigned doctor IDs:', assignedDoctorIds);
    console.log('All doctors before filtering:', allDoctors.length);
    
    // Filter out doctors who are already assigned
    const availableDoctors = allDoctors.filter(doctor => !assignedDoctorIds.includes(doctor.id));
    
    console.log('Available doctors after filtering:', availableDoctors.length);
    return availableDoctors;
  }

  // Manual refresh method for debugging
  refreshAvailableDoctors(): void {
    if (this.selectedDepartment) {
      console.log('Manually refreshing available doctors for department:', this.selectedDepartment.id);
      this.loadAvailableDoctorsForDepartment(this.selectedDepartment.id);
    }
  }

  // Test method to check API endpoints
  testApiEndpoints(): void {
    console.log('Testing API endpoints...');
    
    // Test getAllDoctors
    this.accountService.getAllDoctors().subscribe({
      next: (doctors) => {
        console.log('getAllDoctors result:', doctors);
      },
      error: (err) => {
        console.error('getAllDoctors error:', err);
      }
    });
    
    // Test getAvailableDoctorsForDepartment if we have a selected department
    if (this.selectedDepartment) {
      this.departmentService.getAvailableDoctorsForDepartment(this.selectedDepartment.id).subscribe({
        next: (doctors) => {
          console.log('getAvailableDoctorsForDepartment result:', doctors);
        },
        error: (err) => {
          console.error('getAvailableDoctorsForDepartment error:', err);
        }
      });
    }
  }

  // Filter methods
  onFilterChange(): void {
    console.log('Filtering departments...');
    console.log('Search term:', this.searchTerm);
    console.log('Selected clinic ID:', this.selectedClinicId);
    console.log('Total departments:', this.departments.length);
    
    this.filteredDepartments = this.departments.filter(department => {
      const matchesSearch = !this.searchTerm || 
        department.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        department.clinicName.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesClinic = this.selectedClinicId === 'all' || 
        this.getClinicIdFromDepartment(department) === this.selectedClinicId;
      
      console.log(`Department: ${department.name}, Clinic: ${department.clinicName}, Matches search: ${matchesSearch}, Matches clinic: ${matchesClinic}`);
      
      return matchesSearch && matchesClinic;
    });
    
    console.log('Filtered departments count:', this.filteredDepartments.length);
  }

  getClinicIdFromDepartment(department: DepartmentViewDTO): number {
    // Find the clinic ID by matching clinic name (case-insensitive and trim whitespace)
    const clinic = this.clinics.find(c => 
      c.name.toLowerCase().trim() === department.clinicName.toLowerCase().trim()
    );
    
    if (clinic) {
      console.log(`Found clinic ID ${clinic.id} for department ${department.name} with clinic name "${department.clinicName}"`);
      return clinic.id;
    } else {
      console.warn(`No clinic found for department ${department.name} with clinic name "${department.clinicName}"`);
      console.log('Available clinics:', this.clinics.map(c => `${c.id}: "${c.name}"`));
      return 0;
    }
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedClinicId = 'all';
    this.onFilterChange();
  }

  // Modal methods
  showCreateDepartmentModal(): void {
    this.closeAllModals();
    this.departmentForm.reset();
    this.showCreateModal = true;
    this.error = '';
    this.success = '';
  }

  showEditDepartmentModal(department: DepartmentViewDTO): void {
    this.closeAllModals();
    this.editingDepartment = department;
    const clinicId = this.getClinicIdFromDepartment(department);
    this.departmentForm.patchValue({
      name: department.name,
      clinicId: clinicId
    });
    this.showEditModal = true;
    this.error = '';
    this.success = '';
  }

  showDeleteDepartmentModal(department: DepartmentViewDTO): void {
    this.closeAllModals();
    this.selectedDepartment = department;
    this.showDeleteModal = true;
    this.error = '';
    this.success = '';
  }

  showDepartmentDetailsModal(department: DepartmentViewDTO): void {
    this.closeAllModals();
    this.selectedDepartment = department;
    this.showDetailsModal = true;
  }

  showAssignDoctorModal(department: DepartmentViewDTO): void {
    this.closeAllModals();
    console.log('Opening assign doctor modal for department:', department);
    this.selectedDepartment = department;
    this.assignDoctorForm.reset();
    this.availableDoctors = []; // Clear previous doctors
    this.loadingDoctors = false;
    this.showAssignDoctorModalState = true;
    this.error = '';
    this.success = '';
    
    // Load available doctors after modal is shown
    setTimeout(() => {
      this.loadAvailableDoctorsForDepartment(department.id);
    }, 100);
  }

  showRemoveDoctorModal(doctorDepartment: DoctorDepartmentViewDTO): void {
    this.closeAllModals();
    this.selectedDoctorDepartment = doctorDepartment;
    this.showRemoveDoctorModalState = true;
    this.error = '';
    this.success = '';
  }

  // Quick remove doctor from department card
  quickRemoveDoctor(doctorName: string, department: DepartmentViewDTO): void {
    // Find the doctor department record
    const doctorDepartment = this.doctorDepartments.find(dd => 
      dd.doctorName === doctorName && dd.departmentName === department.name
    );
    
    if (doctorDepartment) {
      this.showRemoveDoctorModal(doctorDepartment);
    } else {
      this.error = 'Doctor assignment not found';
    }
  }

  closeAllModals(): void {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.showDetailsModal = false;
    this.showAssignDoctorModalState = false;
    this.showRemoveDoctorModalState = false;
    this.selectedDepartment = null;
    this.editingDepartment = null;
    this.selectedDoctor = null;
    this.selectedDoctorDepartment = null;
    this.departmentForm.reset();
    this.assignDoctorForm.reset();
    this.availableDoctors = [];
    this.usingFallbackDoctors = false;
  }

  closeModal(): void {
    this.closeAllModals();
  }

  // CRUD operations
  createDepartment(): void {
    if (this.departmentForm.invalid) return;

    this.saving = true;
    const formValue = this.departmentForm.value;
    
    const createData: CreateDepartmentDTO = {
      name: formValue.name,
      clinicId: formValue.clinicId
    };
    
    this.departmentService.createDepartment(createData).subscribe({
      next: () => {
        this.success = 'Department created successfully';
        this.saving = false;
        this.closeAllModals();
        this.loadDepartments();
        this.clearMessages();
      },
      error: (err) => {
        this.error = 'Failed to create department: ' + err.message;
        this.saving = false;
      }
    });
  }

  updateDepartment(): void {
    if (this.departmentForm.invalid || !this.editingDepartment) return;

    this.saving = true;
    const formValue = this.departmentForm.value;
    
    const updateData: UpdateDepartmentDTO = {
      id: this.editingDepartment.id,
      name: formValue.name,
      clinicId: formValue.clinicId
    };
    
    this.departmentService.updateDepartment(updateData).subscribe({
      next: () => {
        this.success = 'Department updated successfully';
        this.saving = false;
        this.closeAllModals();
        this.loadDepartments();
        this.clearMessages();
      },
      error: (err) => {
        this.error = 'Failed to update department: ' + err.message;
        this.saving = false;
      }
    });
  }

  deleteDepartment(): void {
    if (!this.selectedDepartment) return;

    this.deleting = true;
    this.departmentService.deleteDepartment(this.selectedDepartment.id).subscribe({
      next: () => {
        this.success = 'Department deleted successfully';
        this.deleting = false;
        this.closeAllModals();
        this.loadDepartments();
        this.clearMessages();
      },
      error: (err) => {
        this.error = 'Failed to delete department: ' + err.message;
        this.deleting = false;
      }
    });
  }

  // Doctor assignment operations
  assignDoctorToDepartment(): void {
    if (this.assignDoctorForm.invalid || !this.selectedDepartment) return;

    this.saving = true;
    const formValue = this.assignDoctorForm.value;
    
    this.departmentService.assignDoctorToDepartment(
      formValue.doctorId, 
      this.selectedDepartment.id, 
      formValue.percentage
    ).subscribe({
      next: () => {
        this.success = 'Doctor assigned to department successfully';
        this.saving = false;
        this.closeAllModals();
        this.loadDoctorDepartments();
        this.clearMessages();
        
        // Refresh the available doctors list for this department
        if (this.selectedDepartment) {
          this.loadAvailableDoctorsForDepartment(this.selectedDepartment.id);
        }
      },
      error: (err) => {
        this.error = 'Failed to assign doctor to department: ' + err.message;
        this.saving = false;
      }
    });
  }

  removeDoctorFromDepartment(): void {
    if (!this.selectedDoctorDepartment) return;

    this.deleting = true;
    this.departmentService.removeDoctorFromDepartment(this.selectedDoctorDepartment.id).subscribe({
      next: () => {
        this.success = 'Doctor removed from department successfully';
        this.deleting = false;
        this.closeAllModals();
        this.loadDoctorDepartments();
        this.clearMessages();
        
        // Refresh the available doctors list for this department
        if (this.selectedDoctorDepartment) {
          this.loadAvailableDoctorsForDepartment(this.selectedDoctorDepartment.departmentId);
        }
      },
      error: (err) => {
        this.error = 'Failed to remove doctor from department: ' + err.message;
        this.deleting = false;
      }
    });
  }

  // Helper methods
  getClinicName(clinicId: number): string {
    const clinic = this.clinics.find(c => c.id === clinicId);
    return clinic ? clinic.name : 'Unknown Clinic';
  }

  getDoctorCount(departmentName: string): number {
    return this.doctorDepartments.filter(dd => dd.departmentName === departmentName).length;
  }

  getDoctorNames(departmentName: string): string[] {
    return this.doctorDepartments
      .filter(dd => dd.departmentName === departmentName)
      .map(dd => dd.doctorName);
  }

  getDoctorsInDepartment(departmentId: number): DoctorDepartmentViewDTO[] {
    return this.doctorDepartments.filter(dd => dd.departmentId === departmentId);
  }

  getDoctorName(doctorId: number): string {
    const doctor = this.allDoctors.find(d => d.id === doctorId);
    return doctor ? doctor.name : 'Unknown Doctor';
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['maxlength']) return `${fieldName} must be at most ${field.errors['maxlength'].requiredLength} characters`;
      if (field.errors['min']) return `${fieldName} must be at least ${field.errors['min'].min}`;
      if (field.errors['max']) return `${fieldName} must be at most ${field.errors['max'].max}`;
    }
    return '';
  }

  clearMessages(): void {
    setTimeout(() => {
      this.success = '';
      this.error = '';
    }, 3000);
  }
} 