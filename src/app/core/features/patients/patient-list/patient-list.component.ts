import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { PatientService } from '../../../services/patients/patient.service';
import { DepartmentService } from '../../../services/clinics/department.service';
import { CreatePatient, PatientDto } from '../../../Interfaces/patient/patients/patient';
import { DepartmentViewDTO } from '../../../Interfaces/all';
import { Gender } from '../../../Interfaces/all';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, TranslateModule],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.css'
})
export class PatientListComponent implements OnInit {
  patients: PatientDto[] = [];
  filteredPatients: PatientDto[] = [];
  paginatedPatients: PatientDto[] = [];
  departments: DepartmentViewDTO[] = [];
  
  // Search and filter properties
  searchTerm: string = '';
  searchPhone: string = '';
  selectedGender: string = 'all';
  
  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  
  // Loading and UI states
  loading: boolean = false;
  showModal: boolean = false; 
   submitted: boolean = false;
 formErrors: { [key: string]: string } = {};
  editMode: boolean = false;
  editingPatientId: number | null = null;
  protected translateService = inject(TranslateService);

@ViewChild('patientForm') patientForm!: NgForm;
  
  newPatient: CreatePatient = {
    name: '',
    phoneNumber: '',
    dateofBirth: '',
    gender: Gender.male
  };

  constructor(
    private patientService: PatientService,
    private departmentService: DepartmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPatients();
    this.loadDepartments();
  }

  loadPatients(): void {
    this.loading = true;
    this.patientService.getAllPatients().subscribe({
      next: (data) => {
        this.patients = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching patients:', err);
        this.loading = false;
      }
    });
  }

  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (data) => {
        this.departments = data;
      },
      error: (err) => {
        console.error('Error fetching departments:', err);
      }
    });
  }

  // Enhanced search and filter functionality
  applyFilters(): void {
    let filtered = [...this.patients];

    // Apply text search
    if (this.searchTerm.trim()) {
      filtered = filtered.filter(patient =>
        patient.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Apply phone search
    if (this.searchPhone.trim()) {
      filtered = filtered.filter(patient =>
        patient.phoneNumber.includes(this.searchPhone.trim())
      );
    }

    // Apply gender filter
    if (this.selectedGender !== 'all') {
      const genderValue = this.selectedGender === 'male' ? Gender.male : Gender.female;
      filtered = filtered.filter(patient => patient.gender === genderValue);
    }

    this.filteredPatients = filtered;
    this.totalItems = filtered.length;
    this.calculatePagination();
    this.updatePaginatedPatients();
  }

  // Pagination methods
  calculatePagination(): void {
    // Ensure itemsPerPage is a number
    const itemsPerPage = Number(this.itemsPerPage);
    
    if (isNaN(itemsPerPage) || itemsPerPage <= 0) {
      console.error('Invalid itemsPerPage in calculatePagination:', this.itemsPerPage);
      this.itemsPerPage = 10; // Default fallback
      this.totalPages = Math.ceil(this.totalItems / 10);
    } else {
      this.totalPages = Math.ceil(this.totalItems / itemsPerPage);
    }
    
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
  }

  updatePaginatedPatients(): void {
    // Ensure itemsPerPage is a number
    const itemsPerPage = Number(this.itemsPerPage);
    const currentPage = Number(this.currentPage);
    
    if (isNaN(itemsPerPage) || itemsPerPage <= 0) {
      console.error('Invalid itemsPerPage in updatePaginatedPatients:', this.itemsPerPage);
      return;
    }
    
    if (isNaN(currentPage) || currentPage <= 0) {
      console.error('Invalid currentPage in updatePaginatedPatients:', this.currentPage);
      return;
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    this.paginatedPatients = this.filteredPatients.slice(startIndex, endIndex);
    
    // Debug logging (can be removed in production)
    console.log('Pagination Debug:', {
      totalPatients: this.filteredPatients.length,
      currentPage,
      itemsPerPage,
      startIndex,
      endIndex,
      resultCount: this.paginatedPatients.length
    });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedPatients();
      this.scrollToTop();
    }
  }

  onItemsPerPageChange(): void {
    // Ensure itemsPerPage is a valid number
    this.itemsPerPage = Number(this.itemsPerPage);
    
    if (isNaN(this.itemsPerPage) || this.itemsPerPage <= 0) {
      console.error('Invalid items per page value:', this.itemsPerPage);
      this.itemsPerPage = 10; // Default fallback
    }
    
    this.currentPage = 1;
    this.calculatePagination();
    this.updatePaginatedPatients();
  }

  goToFirstPage(): void {
    this.onPageChange(1);
  }

  goToLastPage(): void {
    this.onPageChange(this.totalPages);
  }

  goToPreviousPage(): void {
    this.onPageChange(this.currentPage - 1);
  }

  goToNextPage(): void {
    this.onPageChange(this.currentPage + 1);
  }

  getPageNumbers(): number[] {
    const pageNumbers: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(1, this.currentPage - 2);
      let endPage = Math.min(this.totalPages, this.currentPage + 2);

      if (this.currentPage <= 3) {
        endPage = Math.min(maxVisiblePages, this.totalPages);
      }
      if (this.currentPage > this.totalPages - 3) {
        startPage = Math.max(1, this.totalPages - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Search methods (updated to use applyFilters)
  search(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.searchPhone = '';
    this.selectedGender = 'all';
    this.currentPage = 1;
    this.applyFilters();
  }

  calculateAge(dateOfBirth: string): number {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  viewDetails(patientId: number): void {
      this.router.navigate(['/patient-profile', patientId]);
  }

  viewAppointments(patientId: number): void {
      this.router.navigate(['/patientAppointments', patientId]);
  }

  editPatient(patientId: number): void {
    const patient = this.patients.find(p => p.id === patientId);
    if (patient) {
      this.editMode = true;
      this.editingPatientId = patientId;
      this.newPatient = {
        name: patient.name,
        phoneNumber: patient.phoneNumber,
        dateofBirth: patient.dateOfBirth,
        gender: patient.gender
      };
      this.showModal = true;
    }
  }

openModal(): void {
    this.showModal = true;
    this.submitted = false;
    this.editMode = false;
    this.editingPatientId = null;
    this.newPatient = {
      name: '',
      phoneNumber: '',
      dateofBirth: '',
      gender: Gender.male
    };
    if (this.patientForm) {
      this.patientForm.resetForm();
    }
  }
  
  closeModal(): void {
    this.showModal = false;
    this.formErrors = {};
  }

  validateForm(): boolean {
    this.formErrors = {};
    let isValid = true;

    // Validate name (only letters and spaces)
    if (!/^[A-Za-z\s]+$/.test(this.newPatient.name.trim())) {
      this.formErrors['name'] = 'Name should only contain letters and spaces';
      isValid = false;
    }

    // Validate phone number (only numbers, 10-12 digits)
    if (!/^\d{10,12}$/.test(this.newPatient.phoneNumber)) {
      this.formErrors['phoneNumber'] = 'Phone number should be 10-12 digits';
      isValid = false;
    }

    // Check for duplicate phone number
    const duplicatePhone = this.patients.find(p => 
      p.phoneNumber === this.newPatient.phoneNumber && 
      p.id !== this.editingPatientId
    );
    if (duplicatePhone) {
      this.formErrors['phoneNumber'] = 'This phone number is already registered';
      isValid = false;
    }

    // Validate date of birth
    if (!this.newPatient.dateofBirth) {
      this.formErrors['dateofBirth'] = 'Date of birth is required';
      isValid = false;
    }

    return isValid;
  }

  createPatient(): void {
    this.submitted = true;
    
    if (this.patientForm.invalid || !this.validateForm()) {
      return;
    }

    if (this.editMode && this.editingPatientId) {
      this.patientService.updatePatient(this.editingPatientId, this.newPatient).subscribe({
        next: (response) => {
          console.log("Patient was edited");
          this.loadPatients();
          this.closeModal();
        },
        error: (error) => {
          console.log("Patient wasn't edited");
          console.error('Error updating patient:', error);
        }
      });
    } else {
      this.patientService.addpatient(this.newPatient).subscribe({
        next: (response) => {
          this.loadPatients();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating patient:', error);
        }
      });
    }
  }

  getErrorMessage(fieldName: string, control: any): string {
    if (!control) return '';
    
    if (control.hasError('required')) {
      return `${fieldName} is required`;
    }
    if (control.hasError('pattern')) {
      switch(fieldName) {
        case 'Name':
          return 'Name should only contain letters and spaces';
        case 'Phone Number':
          return 'Phone number should be 10-12 digits';
        default:
          return 'Invalid format';
      }
    }
    
    // Check for duplicate phone number
    if (fieldName === 'Phone Number' && this.newPatient.phoneNumber) {
      const duplicatePhone = this.patients.find(p => 
        p.phoneNumber === this.newPatient.phoneNumber && 
        p.id !== this.editingPatientId
      );
      if (duplicatePhone) {
        return 'This phone number is already registered';
      }
    }
    
    return '';
  }

  getGenderName(gender: Gender): string {
    return Gender[gender].charAt(0).toUpperCase() + Gender[gender].slice(1);
  }

  validatePhoneNumber(phoneNumber: string): string {
    if (!phoneNumber) return '';
    
    const duplicatePhone = this.patients.find(p => 
      p.phoneNumber === phoneNumber && 
      p.id !== this.editingPatientId
    );
    return duplicatePhone ? 'This phone number is already registered' : '';
  }
}