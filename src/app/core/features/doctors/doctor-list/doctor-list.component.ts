import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '../../../services/account.service';
import { DoctorViewDTO, CreateDoctorDTO } from '../../../Interfaces/all';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-doctor-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './doctor-list.component.html',
  styleUrl: './doctor-list.component.css'
})
export class DoctorListComponent implements OnInit {
  doctors: DoctorViewDTO[] = [];
  filteredDoctors: DoctorViewDTO[] = [];
  loading = false;
  error: string | null = null;
  success: string | null = null;

  // Search and filter properties
  searchTerm = '';
  selectedSpecialization = 'all';
  selectedStatus = 'all';
  
  // Pagination properties
  currentPage = 1;
  itemsPerPage = 12;
  totalItems = 0;
  totalPages = 0;

  // Available specializations for filtering
  specializations: string[] = [];

  // Add Doctor Modal properties
  showAddDoctorModal = false;
  addDoctorForm: FormGroup;
  addingDoctor = false;

  constructor(
    private accountService: AccountService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.addDoctorForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      specialization: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{8,15}$/)]],
      startDate: ['', [Validators.required]],
      appUserId: [null, ]
    });
  }

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.loading = true;
    this.error = null;

    this.accountService.getAllDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.extractSpecializations();
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
        this.error = 'Failed to load doctors. Please try again.';
        this.loading = false;
      }
    });
  }

  extractSpecializations(): void {
    const specializationSet = new Set(this.doctors.map(doctor => doctor.specialization));
    this.specializations = Array.from(specializationSet).sort();
  }

  applyFilters(): void {
    let filtered = [...this.doctors];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(doctor => 
        doctor.name.toLowerCase().includes(searchLower) ||
        doctor.specialization.toLowerCase().includes(searchLower) ||
        doctor.phoneNumber.includes(searchLower) ||
        (doctor.email && doctor.email.toLowerCase().includes(searchLower))
      );
    }

    // Apply specialization filter
    if (this.selectedSpecialization !== 'all') {
      filtered = filtered.filter(doctor => doctor.specialization === this.selectedSpecialization);
    }

    // Apply status filter
    if (this.selectedStatus !== 'all') {
      const isActive = this.selectedStatus === 'active';
      filtered = filtered.filter(doctor => doctor.isActive === isActive);
    }

    this.filteredDoctors = filtered;
    this.totalItems = filtered.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.currentPage = 1; // Reset to first page when filters change
  }

  onSearch(): void {
    this.applyFilters();
  }

  onSpecializationChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedSpecialization = 'all';
    this.selectedStatus = 'all';
    this.applyFilters();
  }

  get paginatedDoctors(): DoctorViewDTO[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredDoctors.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onItemsPerPageChange(): void {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.currentPage = 1;
  }

  goToFirstPage(): void {
    this.currentPage = 1;
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToLastPage(): void {
    this.currentPage = this.totalPages;
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  getStartIndex(): number {
    return this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  viewDoctorProfile(doctorId: number): void {
    this.router.navigate(['/doctors', doctorId]);
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'badge-success' : 'badge-danger';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  clearMessages(): void {
    this.error = null;
    this.success = null;
  }

  // Add Doctor Modal Methods
  showAddDoctorForm(): void {
    this.showAddDoctorModal = true;
    this.addDoctorForm.reset();
    this.clearMessages();
  }

  closeAddDoctorModal(): void {
    this.showAddDoctorModal = false;
    this.addDoctorForm.reset();
    this.clearMessages();
  }

  addDoctor(): void {
    if (this.addDoctorForm.valid) {
      this.addingDoctor = true;
      this.error = null;

      const createDoctorData: CreateDoctorDTO = {
        name: this.addDoctorForm.value.name,
        specialization: this.addDoctorForm.value.specialization,
        phoneNumber: this.addDoctorForm.value.phoneNumber,
        startDate: this.addDoctorForm.value.startDate,
        appUserId: undefined
      };

      this.accountService.makeDoctor(createDoctorData).subscribe({
        next: (response) => {
          this.success = 'Doctor added successfully!';
          this.addingDoctor = false;
          this.closeAddDoctorModal();
          this.loadDoctors(); // Reload the doctors list
        },
        error: (error) => {
          console.error('Error adding doctor:', error);
          this.error = 'Failed to add doctor. Please try again.';
          this.addingDoctor = false;
        }
      });
    } else {
      this.error = 'Please fill in all required fields correctly.';
    }
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.addDoctorForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.addDoctorForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['pattern']) return `${fieldName} format is invalid`;
    }
    return '';
  }
}
