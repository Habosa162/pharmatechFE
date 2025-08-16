import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '../../../services/account.service';
import { DepartmentService } from '../../../services/clinics/department.service';
import { DoctorViewDTO, CreateDoctorDTO, DepartmentViewDTO, UserViewDTO } from '../../../Interfaces/all';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../services/enviroment';

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './doctor-list.component.html',
  styleUrl: './doctor-list.component.css',
})
export class DoctorListComponent implements OnInit {
  doctors: DoctorViewDTO[] = [];
  filteredDoctors: DoctorViewDTO[] = [];
  departments: DepartmentViewDTO[] = [];
  doctorDepartments: any[] = []; // Store doctor-department relationships
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

  // User selection properties
  availableUsers: UserViewDTO[] = [];
  selectedUser: UserViewDTO | null = null;
  showUserSelection = false;
  userSearchTerm = '';
  filteredUsers: UserViewDTO[] = [];

  // New User Creation properties
  showCreateUserForm = false;
  createUserForm: FormGroup;
  creatingUser = false;
  userCreationMode: 'select' | 'create' = 'select'; // 'select' or 'create'

  // Assign Doctor to Department Modal properties
  showAssignDepartmentModal = false;
  assignDepartmentForm: FormGroup;
  selectedDoctorForAssignment: DoctorViewDTO | null = null;
  assigningDoctor = false;

  constructor(
    private accountService: AccountService,
    private departmentService: DepartmentService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.addDoctorForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      specialization: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{8,15}$/)]],
      startDate: ['', [Validators.required]],
      appUserId: [null]
    });

    this.assignDepartmentForm = this.formBuilder.group({
      departmentId: ['', [Validators.required]],
      percentage: [100, [Validators.required, Validators.min(1), Validators.max(100)]]
    });

    this.createUserForm = this.formBuilder.group({
      userName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      dateOfBirth: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{8,15}$/)]],
      roleUser: [true],
      roleAdmin: [false],
      roleOwner: [false],
      roleMaster: [false],
      roleAccountant: [false]
    });
  }

  ngOnInit(): void {
    this.loadDoctors();
    this.loadDepartments();
    this.loadDoctorDepartments();
    this.loadAvailableUsers();
  }

  filesurl=environment.filesurl;
  loadDoctors(): void {
    this.loading = true;
    this.error = null;

    this.accountService.getAllDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.extractSpecializations();
        console.log(doctors,'fsafsafasf');
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

  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
        console.log('Loaded departments:', departments);
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        this.error = 'Failed to load departments.';
      }
    });
  }

  loadDoctorDepartments(): void {
    this.departmentService.getDoctorDepartments().subscribe({
      next: (doctorDepts) => {
        this.doctorDepartments = doctorDepts;
        console.log('Loaded doctor departments:', doctorDepts);
        
        // Check for unknown departments
        const unknownDepts = doctorDepts.filter(dd => 
          !this.departments.some(dept => dept.id === dd.departmentId)
        );
        
        if (unknownDepts.length > 0) {
          console.warn('Found doctor assignments to unknown departments:', unknownDepts);
          console.warn('Available department IDs:', this.departments.map(d => d.id));
        }
        
        // Log filtering summary
        setTimeout(() => {
          const stats = this.getDepartmentAssignmentStats();
          console.log('Department Assignment Statistics:', stats);
          if (stats.filteredOut > 0) {
            console.warn(`⚠️  ${stats.filteredOut} department assignments were filtered out due to unknown departments`);
          }
        }, 100);
      },
      error: (error) => {
        console.error('Error loading doctor departments:', error);
        this.error = 'Failed to load doctor departments.';
      }
    });
  }

  loadAvailableUsers(): void {
    this.accountService.getAllUsers().subscribe({
      next: (users) => {
        this.availableUsers = users;
        this.filteredUsers = users;
        console.log('Loaded available users:', users);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.error = 'Failed to load users.';
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
    this.selectedUser = null;
    this.clearMessages();
  }

  closeAddDoctorModal(): void {
    this.showAddDoctorModal = false;
    this.addDoctorForm.reset();
    this.selectedUser = null;
    this.clearMessages();
  }

  // User selection methods
  showUserSelectionModal(): void {
    this.showUserSelection = true;
    this.userSearchTerm = '';
    this.filteredUsers = this.availableUsers;
  }

  closeUserSelectionModal(): void {
    this.showUserSelection = false;
    this.userSearchTerm = '';
  }

  // User creation methods
  switchToCreateUserMode(): void {
    this.userCreationMode = 'create';
    this.createUserForm.reset({
      roleUser: true,
      roleAdmin: false,
      roleOwner: false,
      roleMaster: false,
      roleAccountant: false
    });
    this.selectedUser = null;
    this.addDoctorForm.patchValue({
      name: '',
      phoneNumber: '',
      appUserId: null
    });
  }

  switchToSelectUserMode(): void {
    this.userCreationMode = 'select';
    this.createUserForm.reset();
    this.selectedUser = null;
    this.addDoctorForm.patchValue({
      name: '',
      phoneNumber: '',
      appUserId: null
    });
  }

  createUserAccount(): void {
    if (this.createUserForm.valid && this.createUserForm.value.password === this.createUserForm.value.confirmPassword) {
      this.creatingUser = true;
      this.error = null;

      const formData = new FormData();
      formData.append('userName', this.createUserForm.value.userName);
      formData.append('email', this.createUserForm.value.email);
      formData.append('firstName', this.createUserForm.value.firstName);
      formData.append('lastName', this.createUserForm.value.lastName);
      formData.append('dateOfBirth', this.createUserForm.value.dateOfBirth);
      formData.append('password', this.createUserForm.value.password);
      formData.append('phoneNumber', this.createUserForm.value.phoneNumber);

      // Append each role individually
      if (this.createUserForm.value.roleUser) formData.append('roles', 'User');
      if (this.createUserForm.value.roleAdmin) formData.append('roles', 'Admin');
      if (this.createUserForm.value.roleOwner) formData.append('roles', 'Owner');
      if (this.createUserForm.value.roleMaster) formData.append('roles', 'Master');
      if (this.createUserForm.value.roleAccountant) formData.append('roles', 'Accountant');

      // Call the account service to create user
      this.accountService.createUser(formData).subscribe({
        next: (newUser) => {
          this.success = 'User account created successfully!';
          this.creatingUser = false;
          
          // Auto-select the newly created user
          this.selectedUser = newUser;
          this.addDoctorForm.patchValue({
            name: newUser.fullName,
            phoneNumber: newUser.phoneNumber || '',
            appUserId: newUser.id
          });
          
          // Switch back to select mode
          this.userCreationMode = 'select';
          
          // Refresh the users list
          this.loadAvailableUsers();
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.error = 'Failed to create user account. Please try again.';
          this.creatingUser = false;
        }
      });
    } else {
      if (this.createUserForm.value.password !== this.createUserForm.value.confirmPassword) {
        this.error = 'Passwords do not match.';
      } else {
        this.error = 'Please fill in all required fields correctly.';
      }
    }
  }

  getSelectedRoles(): string[] {
    const roles: string[] = [];
    if (this.createUserForm.value.roleUser) roles.push('User');
    if (this.createUserForm.value.roleAdmin) roles.push('Admin');
    if (this.createUserForm.value.roleOwner) roles.push('Owner');
    if (this.createUserForm.value.roleMaster) roles.push('Master');
    if (this.createUserForm.value.roleAccountant) roles.push('Accountant');
    return roles;
  }

  hasSelectedRoles(): boolean {
    return this.getSelectedRoles().length > 0;
  }

  // Form validation helpers for user creation
  isCreateUserFieldInvalid(fieldName: string): boolean {
    const field = this.createUserForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getCreateUserFieldError(fieldName: string): string {
    const field = this.createUserForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['email']) return `Please enter a valid email address`;
      if (field.errors['pattern']) return `${fieldName} format is invalid`;
    }
    return '';
  }

  filterUsers(): void {
    if (!this.userSearchTerm.trim()) {
      this.filteredUsers = this.availableUsers;
    } else {
      const searchLower = this.userSearchTerm.toLowerCase();
      this.filteredUsers = this.availableUsers.filter(user => 
        user.fullName.toLowerCase().includes(searchLower) ||
        user.userName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }
  }

  selectUser(user: UserViewDTO): void {
    this.selectedUser = user;
    this.addDoctorForm.patchValue({
      name: user.fullName,
      phoneNumber: user.phoneNumber || '',
      appUserId: user.id
    });
    this.closeUserSelectionModal();
  }

  isUserAlreadyDoctor(userId: string): boolean {
    return this.doctors.some(doctor => doctor.appUserId === userId);
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
        appUserId: this.selectedUser?.id || undefined
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

  // Assign Doctor to Department Modal Methods
  showAssignDepartmentForm(doctor: DoctorViewDTO): void {
    this.selectedDoctorForAssignment = doctor;
    this.assignDepartmentForm.reset({
      departmentId: '',
      percentage: 100
    });
    this.showAssignDepartmentModal = true;
    this.clearMessages();
  }

  closeAssignDepartmentModal(): void {
    this.showAssignDepartmentModal = false;
    this.selectedDoctorForAssignment = null;
    this.assignDepartmentForm.reset();
    this.clearMessages();
  }

  assignDoctorToDepartment(): void {
    if (this.assignDepartmentForm.valid && this.selectedDoctorForAssignment) {
      this.assigningDoctor = true;
      this.error = null;

      const formValue = this.assignDepartmentForm.value;
      
      this.departmentService.assignDoctorToDepartment(
        this.selectedDoctorForAssignment.id,
        formValue.departmentId,
        formValue.percentage
      ).subscribe({
        next: () => {
          this.success = `Doctor ${this.selectedDoctorForAssignment?.name} assigned to department successfully!`;
          this.assigningDoctor = false;
          this.closeAssignDepartmentModal();
          // Refresh doctor departments to show the new assignment
          this.loadDoctorDepartments();
        },
        error: (error) => {
          console.error('Error assigning doctor to department:', error);
          this.error = 'Failed to assign doctor to department. Please try again.';
          this.assigningDoctor = false;
        }
      });
    } else {
      this.error = 'Please fill in all required fields correctly.';
    }
  }

  // Assign Department Form validation helpers
  isAssignDepartmentFieldInvalid(fieldName: string): boolean {
    const field = this.assignDepartmentForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getAssignDepartmentFieldError(fieldName: string): string {
    const field = this.assignDepartmentForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['min']) return `${fieldName} must be at least ${field.errors['min'].min}`;
      if (field.errors['max']) return `${fieldName} must be at most ${field.errors['max'].max}`;
    }
    return '';
  }

  // Helper methods for displaying doctor departments
  getDoctorDepartments(doctorId: number): any[] {
    return this.doctorDepartments.filter(dd => dd.doctorId === doctorId);
  }

  getValidDoctorDepartments(doctorId: number): any[] {
    const allDepts = this.doctorDepartments.filter(dd => dd.doctorId === doctorId);
    const validDepts = allDepts.filter(dd => {
      // Only include if department exists in our departments list
      return this.departments.some(dept => dept.id === dd.departmentId);
    });
    
    // Log if any departments were filtered out
    if (allDepts.length !== validDepts.length) {
      const filteredOut = allDepts.filter(dd => 
        !this.departments.some(dept => dept.id === dd.departmentId)
      );
      console.log(`Doctor ${doctorId}: Filtered out ${filteredOut.length} unknown department assignments:`, filteredOut);
    }
    
    return validDepts;
  }

  getDoctorDepartmentsText(doctorId: number): string {
    const validDepts = this.getValidDoctorDepartments(doctorId);
    if (validDepts.length === 0) {
      return 'No departments assigned';
    }
    
    return validDepts.map(dd => {
      const deptName = this.getDepartmentName(dd.departmentId);
      return `${deptName} (${dd.percentage}%)`;
    }).join(', ');
  }

  getDepartmentName(departmentId: number): string {
    const dept = this.departments.find(d => d.id === departmentId);
    return dept ? dept.name : 'Unknown Department';
  }

  hasDepartments(doctorId: number): boolean {
    return this.getValidDoctorDepartments(doctorId).length > 0;
  }

  getDepartmentsCount(doctorId: number): number {
    return this.getValidDoctorDepartments(doctorId).length;
  }

  // Debug method to get department assignment statistics
  getDepartmentAssignmentStats(): any {
    const totalAssignments = this.doctorDepartments.length;
    const validAssignments = this.doctorDepartments.filter(dd => 
      this.departments.some(dept => dept.id === dd.departmentId)
    ).length;
    const invalidAssignments = totalAssignments - validAssignments;
    
    return {
      total: totalAssignments,
      valid: validAssignments,
      invalid: invalidAssignments,
      filteredOut: invalidAssignments
    };
  }
}
