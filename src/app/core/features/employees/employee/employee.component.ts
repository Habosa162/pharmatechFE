import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from '../../../services/employees/employee.service';
import { PositionService } from '../../../services/employees/position.service';
import { DepartmentService } from '../../../services/clinics/department.service';
import { AccountService } from '../../../services/account.service';
import { EmployeeViewDto, CreateEmployeeDTO, DepartmentViewDTO, UserViewDTO } from '../../../Interfaces/all';
import { PositionDto } from '../../../Interfaces/employee/positions/position';

@Component({
  selector: 'app-employee',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.css'
})
export class EmployeeComponent implements OnInit {
  // Data properties
  employees: EmployeeViewDto[] = [];
  positions: PositionDto[] = [];
  departments: DepartmentViewDTO[] = [];
  filteredEmployees: EmployeeViewDto[] = [];
  allUsers: UserViewDTO[] = [];
  availableUsers: UserViewDTO[] = [];
  
  // UI state
  activeView: 'list' | 'profile' = 'list';
  loading = false;
  error: string | null = null;
  success: string | null = null;

  // Filter properties
  searchTerm = '';
  selectedPosition = 'all';
  selectedStatus = 'all';

  // Modal states
  showEmployeeModal = false;

  // Forms
  employeeForm: FormGroup;

  // Edit states
  editingEmployee: EmployeeViewDto | null = null;
  selectedEmployee: EmployeeViewDto | null = null;

  constructor(
    private employeeService: EmployeeService,
    private positionService: PositionService,
    private departmentService: DepartmentService,
    private accountService: AccountService,
    private formBuilder: FormBuilder
  ) {
    this.employeeForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
      salary: [0, [Validators.required, Validators.min(0)]],
      departmentId: ['', [Validators.required]],
      positionId: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: [''],
      isActive: [true],
      appUserId: ['']
    });

    // Listen for department changes to filter positions
    this.employeeForm.get('departmentId')?.valueChanges.subscribe(departmentId => {
      this.onDepartmentChange(departmentId);
    });
  }

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loadEmployees();
    this.loadDepartments();
    this.loadAllUsers();
  }

  loadAllUsers(): void {
    this.accountService.getAllUsers().subscribe({
      next: (users) => {
        this.allUsers = users;
        this.filterAvailableUsers();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.error = 'Failed to load users';
      }
    });
  }

  filterAvailableUsers(currentEmployeeId?: number): void {
    // Get user IDs that are already employees or doctors
    const employeeUserIds = this.employees
      .filter(emp => emp.id !== currentEmployeeId) // Exclude current employee when editing
      .map(emp => emp.appUserId)
      .filter(id => id);
    
    const doctorUserIds = this.allUsers.filter(user => 
      user.roles.some(role => role.toLowerCase() === 'doctor')
    ).map(user => user.id);
    
    // Combine all used user IDs
    const usedUserIds = [...employeeUserIds, ...doctorUserIds];
    
    // Filter out users who are already employees or doctors
    this.availableUsers = this.allUsers.filter(user => 
      !usedUserIds.includes(user.id) && user.isActive
    );
  }

  loadEmployees(): void {
    this.loading = true;
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
        this.applyFilters();
        this.filterAvailableUsers(); // Re-filter available users after loading employees
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.error = 'Failed to load employees';
        this.loading = false;
      }
    });
  }

  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        this.error = 'Failed to load departments';
      }
    });
  }

  loadPositions(): void {
    this.positionService.getAllPositions().subscribe({
      next: (positions) => {
        this.positions = positions;
      },
      error: (error) => {
        console.error('Error loading positions:', error);
        this.error = 'Failed to load positions';
      }
    });
  }

  loadPositionsByDepartment(departmentId: number): void {
    this.positionService.getPositionsByDepartmentId(departmentId).subscribe({
      next: (positions) => {
        this.positions = positions;
      },
      error: (error) => {
        console.error('Error loading positions for department:', error);
        this.error = 'Failed to load positions for selected department';
      }
    });
  }

  onDepartmentChange(departmentId: string): void {
    if (departmentId && departmentId !== '') {
      this.loadPositionsByDepartment(+departmentId);
      // Reset position selection when department changes
      this.employeeForm.patchValue({ positionId: '' });
    } else {
      // Load all positions if no department is selected
      this.loadPositions();
    }
  }

  // Filter methods
  applyFilters(): void {
    let filtered = [...this.employees];

    // Filter by search term
    if (this.searchTerm) {
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        emp.phoneNumber.includes(this.searchTerm)
      );
    }

    // Filter by position
    if (this.selectedPosition !== 'all') {
      filtered = filtered.filter(emp => emp.positionId === +this.selectedPosition);
    }

    // Filter by status
    if (this.selectedStatus !== 'all') {
      const isActive = this.selectedStatus === 'active';
      filtered = filtered.filter(emp => emp.isActive === isActive);
    }

    this.filteredEmployees = filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedPosition = 'all';
    this.selectedStatus = 'all';
    this.applyFilters();
  }

  // View management
  showEmployeeProfile(employee: EmployeeViewDto): void {
    this.selectedEmployee = employee;
    this.activeView = 'profile';
    this.clearMessages();
  }

  backToList(): void {
    this.activeView = 'list';
    this.selectedEmployee = null;
    this.clearMessages();
  }

  // Employee management
  showAddEmployeeModal(): void {
    this.editingEmployee = null;
    this.employeeForm.reset();
    this.employeeForm.patchValue({
      isActive: true,
      startDate: new Date().toISOString().split('T')[0]
    });
    // Load all positions initially
    this.loadPositions();
    // Refresh available users
    this.filterAvailableUsers();
    this.showEmployeeModal = true;
  }

  showEditEmployeeModal(employee: EmployeeViewDto): void {
    this.editingEmployee = employee;
    
    // Load all positions initially for editing
    this.loadPositions();
    
    // Refresh available users and include the current employee's user if they have one
    this.filterAvailableUsers(employee.id);
    
    this.employeeForm.patchValue({
      name: employee.name,
      phoneNumber: employee.phoneNumber,
      salary: employee.salary,
      departmentId: '', // We'll need to determine this from the position or let user select
      positionId: employee.positionId,
      startDate: employee.startDate.split('T')[0],
      endDate: employee.endDate ? employee.endDate.split('T')[0] : '',
      isActive: employee.isActive,
      appUserId: employee.appUserId || ''
    });
    this.showEmployeeModal = true;
  }

  closeEmployeeModal(): void {
    this.showEmployeeModal = false;
    this.editingEmployee = null;
    this.employeeForm.reset();
  }

  saveEmployee(): void {
    if (this.employeeForm.valid) {
      const createData: CreateEmployeeDTO = {
        name: this.employeeForm.value.name,
        phoneNumber: this.employeeForm.value.phoneNumber,
        salary: this.employeeForm.value.salary,
        positionId: this.employeeForm.value.positionId,
        departmentId: this.employeeForm.value.departmentId,
        startDate: this.employeeForm.value.startDate,
        endDate: this.employeeForm.value.endDate || null,
        isActive: this.employeeForm.value.isActive,
        appUserId: this.employeeForm.value.appUserId || null
      };

      if (this.editingEmployee) {
        // Update existing employee
        this.employeeService.updateEmployee(this.editingEmployee.id, createData).subscribe({
          next: () => {
            this.success = 'Employee updated successfully!';
            this.closeEmployeeModal();
            this.loadEmployees();
          },
          error: (error) => {
            console.error('Error updating employee:', error);
            this.error = 'Failed to update employee';
          }
        });
      } else {
        // Create new employee
        this.employeeService.createEmployee(createData).subscribe({
          next: () => {
            this.success = 'Employee created successfully!';
            this.closeEmployeeModal();
            this.loadEmployees();
          },
          error: (error) => {
            console.error('Error creating employee:', error);
            this.error = 'Failed to create employee';
          }
        });
      }
    }
  }

  deleteEmployee(employeeId: number): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(employeeId).subscribe({
        next: () => {
          this.success = 'Employee deleted successfully!';
          this.loadEmployees();
        },
        error: (error) => {
          console.error('Error deleting employee:', error);
          this.error = 'Failed to delete employee';
        }
      });
    }
  }

  // Utility methods
  getStatusClass(isActive: boolean): string {
    return isActive ? 'badge-success' : 'badge-danger';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  getEmploymentDuration(startDate: string, endDate: string | null): string {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} ${months > 0 ? `${months} month${months > 1 ? 's' : ''}` : ''}`;
    }
    return `${months} month${months > 1 ? 's' : ''}`;
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
      if (field.errors['min']) return `${fieldName} must be at least ${field.errors['min'].min}`;
      if (field.errors['pattern']) return `${fieldName} format is invalid`;
    }
    return '';
  }
}
