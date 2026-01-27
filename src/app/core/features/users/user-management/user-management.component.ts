import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountService } from '../../../services/account.service';
import { ToastService } from '../../../services/toast.service';
import {
  UserViewDTO,
  CreateUserDTO,
  UpdateUserDTO,
  ChangePasswordDTO,
  DoctorViewDTO,
  CreateDoctorDTO
} from '../../../Interfaces/all';
import { environment } from '../../../services/enviroment';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  // Data arrays
  users: UserViewDTO[] = [];
  filteredUsers: UserViewDTO[] = [];
  doctors: DoctorViewDTO[] = [];

  // Loading states
  loading = false;
  saving = false;
  deleting = false;
  changingPassword = false;
  makingDoctor = false;

  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  showDetailsModal = false;
  showChangePasswordModal = false;
  showAssignRoleModal = false;
  showMakeDoctorModal = false;

  // Selected items
  selectedUser: UserViewDTO | null = null;
  editingUser: UserViewDTO | null = null;

  // Filters
  searchTerm = '';
  protected translateService = inject(TranslateService);
  selectedRole: string = 'all';
  selectedStatus: string = 'all';

  // Forms
  userForm: FormGroup;
  changePasswordForm: FormGroup;
  assignRoleForm: FormGroup;
  makeDoctorForm: FormGroup;

  // Available roles
  availableRoles = ['Master', 'Owner', 'Admin', 'User', 'Accountant'];

  // File handling
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(
    private accountService: AccountService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    this.userForm = this.fb.group({
      userName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      dateOfBirth: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8), this.complexPasswordValidator()]],
      confirmPassword: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[1-9][\d]{10}$/)]],
      // Individual role controls instead of array
      roleMaster: [false],
      roleOwner: [false],
      roleAdmin: [false],
      roleUser: [false],
      roleAccountant: [false]
    }, { validators: this.passwordMatchValidator });

    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8), this.complexPasswordValidator()]],
      confirmNewPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.assignRoleForm = this.fb.group({
      role: ['', Validators.required]
    });

    this.makeDoctorForm = this.fb.group({
      specialization: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{8,15}$/)]],
      startDate: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadDoctors();
  }

  // Password match validator
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password') || form.get('newPassword');
    const confirmPassword = form.get('confirmPassword') || form.get('confirmNewPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (confirmPassword && confirmPassword.errors) {
      delete confirmPassword.errors['passwordMismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }

    return null;
  }

  // Complex password validator
  complexPasswordValidator() {
    return (control: any) => {
      const password = control.value;
      if (!password) return null;

      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasNonAlphanumeric = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

      if (!hasUpperCase) {
        return { missingUpperCase: true };
      }
      if (!hasLowerCase) {
        return { missingLowerCase: true };
      }
      if (!hasNumbers) {
        return { missingNumbers: true };
      }
      if (!hasNonAlphanumeric) {
        return { missingNonAlphanumeric: true };
      }

      return null;
    };
  }

  // Load data methods
  loadUsers(): void {
    this.loading = true;
    this.accountService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        console.log('Loaded users:', users);
        this.loading = false;
        this.onFilterChange();
      },
      error: (err) => {
        this.toastService.error('Failed to load users: ' + err.message);
        this.loading = false;
      }
    });
  }

  loadDoctors(): void {
    this.accountService.getAllDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        console.log('Loaded doctors:', doctors);
      },
      error: (err) => {
        console.error('Failed to load doctors:', err);
      }
    });
  }

  // Filter methods
  onFilterChange(): void {
    console.log('Filtering users...');
    console.log('Search term:', this.searchTerm);
    console.log('Selected role:', this.selectedRole);
    console.log('Selected status:', this.selectedStatus);

    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchTerm ||
        user.userName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.phoneNumber?.toString().toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesRole = this.selectedRole === 'all' ||
        user.roles.includes(this.selectedRole);

      const matchesStatus = this.selectedStatus === 'all' ||
        (this.selectedStatus === 'active' && user.isActive) ||
        (this.selectedStatus === 'inactive' && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });

    console.log('Filtered users count:', this.filteredUsers.length);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = 'all';
    this.selectedStatus = 'all';
    this.onFilterChange();
  }

  // Modal methods
  showCreateUserModal(): void {
    this.closeAllModals();
    this.userForm.reset();
    this.selectedFile = null;
    this.previewUrl = null;
    this.showCreateModal = true;
    this.toastService.clear(); // Clear previous messages
  }

  showEditUserModal(user: UserViewDTO): void {
    this.closeAllModals();
    this.editingUser = user;
    this.userForm.patchValue({
      userName: user.userName,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth || '',
      phoneNumber: user.phoneNumber || '',
      // Set individual role controls based on user roles
      roleMaster: user.roles.includes('Master'),
      roleOwner: user.roles.includes('Owner'),
      roleAdmin: user.roles.includes('Admin'),
      roleUser: user.roles.includes('User'),
      roleAccountant: user.roles.includes('Accountant')
    });
    // Remove password validators for edit mode
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('confirmPassword')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.get('confirmPassword')?.updateValueAndValidity();

    this.previewUrl = user.profilePicture;
    this.showEditModal = true;
    this.toastService.clear(); // Clear previous messages
  }

  showDeleteUserModal(user: UserViewDTO): void {
    this.closeAllModals();
    this.selectedUser = user;
    this.showDeleteModal = true;
    this.toastService.clear(); // Clear previous messages
  }

  showUserDetailsModal(user: UserViewDTO): void {
    this.closeAllModals();
    this.selectedUser = user;
    this.showDetailsModal = true;
  }

  openAssignRoleModal(user: UserViewDTO): void {
    this.closeAllModals();
    this.selectedUser = user;
    this.showAssignRoleModal = true;
    this.toastService.clear(); // Clear previous messages
  }

  openChangePasswordModal(user: UserViewDTO): void {
    this.closeAllModals();
    this.selectedUser = user;
    this.showChangePasswordModal = true;
    this.toastService.clear(); // Clear previous messages
  }

  openMakeDoctorModal(user: UserViewDTO): void {
    this.closeAllModals();
    this.selectedUser = user;
    this.makeDoctorForm.patchValue({
      phoneNumber: user.phoneNumber || '',
      startDate: new Date().toISOString().split('T')[0]
    });
    this.showMakeDoctorModal = true;
    this.toastService.clear();
  }

  closeAllModals(): void {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.showDetailsModal = false;
    this.showChangePasswordModal = false;
    this.showAssignRoleModal = false;
    this.showMakeDoctorModal = false;
    this.selectedUser = null;
    this.editingUser = null;
    this.userForm.reset();
    this.changePasswordForm.reset();
    this.assignRoleForm.reset();
    this.makeDoctorForm.reset();
    this.selectedFile = null;
    this.previewUrl = null;

    // Restore password validators for create mode
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8), this.complexPasswordValidator()]);
    this.userForm.get('confirmPassword')?.setValidators([Validators.required]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.get('confirmPassword')?.updateValueAndValidity();

    // Reset role controls to false
    this.userForm.patchValue({
      roleMaster: false,
      roleOwner: false,
      roleAdmin: false,
      roleUser: false,
      roleAccountant: false
    });
  }

  closeModal(): void {
    this.closeAllModals();
  }

  // File handling
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.createPreviewUrl(file);
    }
  }

  createPreviewUrl(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeProfilePicture(): void {
    this.selectedFile = null;
    this.previewUrl = null;
  }

  // CRUD operations
  createUser(): void {
    if (this.userForm.invalid) {
      console.log('Form is invalid:', this.userForm.errors);
      console.log('Phone number field:', this.userForm.get('phoneNumber')?.value);
      console.log('Phone number errors:', this.userForm.get('phoneNumber')?.errors);
      this.toastService.error('Please check the form for errors');
      return;
    }

    if (!this.hasSelectedRoles()) {
      this.toastService.error('Please select at least one role');
      return;
    }

    this.saving = true;
    const formValue = this.userForm.value;

    console.log('Creating user with data:', formValue);

    const formData = new FormData();
    formData.append('userName', formValue.userName);
    formData.append('email', formValue.email);
    formData.append('firstName', formValue.firstName);
    formData.append('lastName', formValue.lastName);
    formData.append('dateOfBirth', formValue.dateOfBirth);
    formData.append('password', formValue.password);
    formData.append('confirmPassword', formValue.confirmPassword);
    formData.append('phoneNumber', formValue.phoneNumber);

    // Append each role individually instead of as JSON string
    if (formValue.roleMaster) formData.append('roles', 'Master');
    if (formValue.roleOwner) formData.append('roles', 'Owner');
    if (formValue.roleAdmin) formData.append('roles', 'Admin');
    if (formValue.roleUser) formData.append('roles', 'User');
    if (formValue.roleAccountant) formData.append('roles', 'Accountant');

    if (this.selectedFile) {
      formData.append('profilePicture', this.selectedFile);
    }

    this.accountService.createUser(formData).subscribe({
      next: () => {
        this.toastService.success('User created successfully');
        this.saving = false;
        this.closeAllModals();
        this.loadUsers();
      },
      error: (err) => {
        console.log('Error creating user:', err);
        // this.toastService.error( );
        this.saving = false;
      },
      complete: () => {
        // Ensure saving is reset even if error interceptor catches the error
        this.saving = false;
      }
    });
  }

  updateUser(): void {
    if (this.userForm.invalid || !this.editingUser) return;

    if (!this.hasSelectedRoles()) {
      this.toastService.error('Please select at least one role');
      return;
    }

    this.saving = true;
    const formValue = this.userForm.value;

    const formData = new FormData();
    formData.append('userName', formValue.userName);
    formData.append('email', formValue.email);
    formData.append('firstName', formValue.firstName);
    formData.append('lastName', formValue.lastName);
    formData.append('dateOfBirth', formValue.dateOfBirth);
    formData.append('phoneNumber', formValue.phoneNumber);
    formData.append('isActive', this.editingUser.isActive.toString());

    // Append each role individually instead of as JSON string
    if (formValue.roleMaster) formData.append('roles', 'Master');
    if (formValue.roleOwner) formData.append('roles', 'Owner');
    if (formValue.roleAdmin) formData.append('roles', 'Admin');
    if (formValue.roleUser) formData.append('roles', 'User');
    if (formValue.roleAccountant) formData.append('roles', 'Accountant');

    if (this.selectedFile) {
      formData.append('profilePicture', this.selectedFile);
    }

    this.accountService.updateUser(this.editingUser.userName, formData).subscribe({
      next: () => {
        this.toastService.success('User updated successfully');
        this.saving = false;
        this.closeAllModals();
        this.loadUsers();
      },
      error: (err) => {
        this.toastService.error('Failed to update user: ' + err.message);
        this.saving = false;
      },
      complete: () => {
        this.saving = false;
      }
    });
  }

  deleteUser(): void {
    if (!this.selectedUser) return;

    this.deleting = true;
    this.accountService.deleteUser(this.selectedUser.id).subscribe({
      next: () => {
        this.toastService.success('User deleted successfully');
        this.deleting = false;
        this.closeAllModals();
        this.loadUsers();
      },
      error: (err) => {
        this.toastService.error('Failed to delete user: ' + err.message);
        this.deleting = false;
      },
      complete: () => {
        this.deleting = false;
      }
    });
  }

  changePassword(): void {
    if (this.changePasswordForm.invalid || !this.selectedUser) return;

    this.changingPassword = true;
    const formValue = this.changePasswordForm.value;

    const passwordData: ChangePasswordDTO = {
      userId: this.selectedUser.id,
      currentPassword: formValue.currentPassword,
      newPassword: formValue.newPassword,
      confirmNewPassword: formValue.confirmNewPassword
    };

    this.accountService.changePassword(passwordData).subscribe({
      next: () => {
        this.toastService.success('Password changed successfully');
        this.changingPassword = false;
        this.closeAllModals();
      },
      error: (err) => {
        this.toastService.error('Failed to change password: ' + err.message);
        this.changingPassword = false;
      },
      complete: () => {
        this.changingPassword = false;
      }
    });
  }

  assignRole(): void {
    if (this.assignRoleForm.invalid || !this.selectedUser) return;

    this.saving = true;
    const formValue = this.assignRoleForm.value;

    this.accountService.assignRole(this.selectedUser.id, formValue.role).subscribe({
      next: () => {
        this.toastService.success(`Role ${formValue.role} assigned successfully`);
        this.saving = false;
        this.closeAllModals();
        this.loadUsers();
      },
      error: (err) => {
        this.toastService.error('Failed to assign role: ' + err.message);
        this.saving = false;
      },
      complete: () => {
        this.saving = false;
      }
    });
  }

  removeRole(user: UserViewDTO, role: string): void {
    this.saving = true;

    this.accountService.removeRole(user.id, role).subscribe({
      next: () => {
        this.toastService.success(`Role ${role} removed successfully`);
        this.saving = false;
        this.loadUsers();
      },
      error: (err) => {
        this.toastService.error('Failed to remove role: ' + err.message);
        this.saving = false;
      },
      complete: () => {
        this.saving = false;
      }
    });
  }

  makeDoctor(): void {
    if (this.makeDoctorForm.invalid || !this.selectedUser) return;

    this.makingDoctor = true;
    const formValue = this.makeDoctorForm.value;

    const createDoctorData: CreateDoctorDTO = {
      name: this.selectedUser.fullName,
      specialization: formValue.specialization,
      phoneNumber: formValue.phoneNumber,
      startDate: formValue.startDate,
      appUserId: this.selectedUser.id
    };

    this.accountService.makeDoctor(createDoctorData).subscribe({
      next: () => {
        this.toastService.success(`User ${this.selectedUser?.fullName} successfully made into a doctor!`);
        this.makingDoctor = false;
        this.closeAllModals();
        this.loadUsers();
        this.loadDoctors();
      },
      error: (err) => {
        this.toastService.error('Failed to make user a doctor: ' + err.message);
        this.makingDoctor = false;
      },
      complete: () => {
        this.makingDoctor = false;
      }
    });
  }

  toggleUserStatus(user: UserViewDTO): void {
    this.saving = true;

    if (user.isActive) {
      this.accountService.deactivateUser(user.id).subscribe({
        next: () => {
          this.toastService.success('User deactivated successfully');
          this.saving = false;
          this.loadUsers();
        },
        error: (err) => {
          this.toastService.error('Failed to deactivate user: ' + err.message);
          this.saving = false;
        },
        complete: () => {
          this.saving = false;
        }
      });
    } else {
      this.accountService.activateUser(user.id).subscribe({
        next: () => {
          this.toastService.success('User activated successfully');
          this.saving = false;
          this.loadUsers();
        },
        error: (err) => {
          this.toastService.error('Failed to activate user: ' + err.message);
          this.saving = false;
        },
        complete: () => {
          this.saving = false;
        }
      });
    }
  }

  // Helper methods
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  getRoleBadgeClass(role: string): string {
    switch (role.toLowerCase()) {
      case 'master': return 'badge-warning';
      case 'owner': return 'badge-danger';
      case 'admin': return 'badge-primary';
      case 'user': return 'badge-secondary';
      case 'accountant': return 'badge-info';
      default: return 'badge-secondary';
    }
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'badge-success' : 'badge-danger';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  getFormattedUsername(username: string): string {
    return '@' + username;
  }

  isUserAlreadyDoctor(userId: string): boolean {
    return this.doctors.some(doctor => doctor.appUserId === userId);
  }

  fileurl:string=environment.filesurl;
  getProfilePictureUrl(user: UserViewDTO): string {
    if (user.profilePicture && user.profilePicture.trim() !== '') {
      console.log(this.fileurl+"/"+user.profilePicture);
      return  this.fileurl+"/"+user.profilePicture;

    }
    // Return a simple colored circle with user initials
    const initials = this.getUserInitials(user);
    const color = this.getUserColor(user);
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="20" fill="${color}"/>
        <text x="20" y="25" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">${initials}</text>
      </svg>
    `)}`;
  }

  getUserInitials(user: UserViewDTO): string {
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    return firstInitial + lastInitial;
  }

  getUserColor(user: UserViewDTO): string {
    // Generate a consistent color based on user name
    const name = (user.firstName + user.lastName).toLowerCase();
    const colors = ['#6C7280', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  hasProfilePicture(user: UserViewDTO): boolean {
    return !!(user.profilePicture && user.profilePicture.trim() !== '');
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }

  // Handle phone number input to allow only numbers
  onPhoneNumberInput(event: any): void {
    const input = event.target;
    const value = input.value;
    const numbersOnly = value.replace(/[^0-9]/g, '');

    if (value !== numbersOnly) {
      input.value = numbersOnly;
      this.userForm.patchValue({ phoneNumber: numbersOnly });
    }
  }

  // Check if at least one role is selected
  hasSelectedRoles(): boolean {
    const formValue = this.userForm.value;
    return formValue.roleMaster || formValue.roleOwner || formValue.roleAdmin || formValue.roleUser || formValue.roleAccountant;
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['maxlength']) return `${fieldName} must be at most ${field.errors['maxlength'].requiredLength} characters`;
      if (field.errors['pattern']) {
        if (fieldName === 'phoneNumber') {
          return 'Phone number must be exactly 11 digits (e.g., 12345678901)';
        }
        return `Please enter a valid ${fieldName}`;
      }
      if (field.errors['passwordMismatch']) return 'Passwords do not match';

      // Complex password validation errors
      if (field.errors['missingUpperCase']) return 'Password must contain at least one uppercase letter (A-Z)';
      if (field.errors['missingLowerCase']) return 'Password must contain at least one lowercase letter (a-z)';
      if (field.errors['missingNumbers']) return 'Password must contain at least one number (0-9)';
      if (field.errors['missingNonAlphanumeric']) return 'Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)';
    }
    return '';
  }

  // Method to change clinic ID (for future use)
  changeClinicId(newClinicId: number): void {
    // this.clinicId = newClinicId; // This line was commented out in the original file
    this.loadUsers();
  }

  // Test method to demonstrate different toast types
  testToasts(): void {
    this.toastService.success('This is a success message!', 'Success');
    setTimeout(() => {
      this.toastService.error('This is an error message!', 'Error');
    }, 1000);
    setTimeout(() => {
      this.toastService.warning('This is a warning message!', 'Warning');
    }, 2000);
    setTimeout(() => {
      this.toastService.info('This is an info message!', 'Information');
    }, 3000);
  }

  // Test phone number validation
  testPhoneValidation(): void {
    const testNumbers = [
      '12345678901', // Should be valid
      '01234567890', // Should be invalid (starts with 0)
      '1234567890',  // Should be invalid (10 digits)
      '123456789012', // Should be invalid (12 digits)
      '1234567890a',  // Should be invalid (contains letter)
    ];

    testNumbers.forEach(number => {
      const isValid = /^[1-9][\d]{10}$/.test(number);
      console.log(`Phone number "${number}" is ${isValid ? 'valid' : 'invalid'}`);
      this.toastService.info(`Phone "${number}" is ${isValid ? 'valid' : 'invalid'}`, 'Validation Test');
    });
  }
}
