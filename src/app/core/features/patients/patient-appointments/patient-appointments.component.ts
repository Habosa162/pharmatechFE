import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../services/appintments/appointment.service';
import { PatientService } from '../../../services/patients/patient.service';
import { AppointmentDetails, AppointmentStatus, CreateAppointmentDTO, DoctorDepartment, DoctorDepartmentViewDTO } from '../../../Interfaces/all';
import { PatientDto } from '../../../Interfaces/patient/patients/patient';
import { DepartmentService } from '../../../services/clinics/department.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './patient-appointments.component.html',
  styleUrl: './patient-appointments.component.css'
})
export class PatientAppointmentsComponent implements OnInit {
  // Data properties
  appointments: AppointmentDetails[] = [];
  filteredAppointments: AppointmentDetails[] = [];
  paginatedAppointments: AppointmentDetails[] = [];
  patient: PatientDto | null = null;
  patientId!: number;
  
  // UI state properties
  loading: boolean = true;
  error: string = '';
  showModal: boolean = false;
  
  // Search and filter properties
  searchTerm: string = '';
  selectedStatus: string = 'all';
  selectedDepartment: string = 'all';
  
  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  
  // Form and modal properties
  appointmentForm!: FormGroup;
  doctordepartments: DoctorDepartmentViewDTO[] = [];
  doctorDepartments: DoctorDepartmentViewDTO[] = [];
  departments: { id: number, name: string }[] = [];
  doctorsByDepartment: { [key: number]: { id: number, name: string }[] } = {};
  selectedDepartmentId: number | null = null;
  
  // Enum reference
  AppointmentStatus = AppointmentStatus;

  constructor(
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private departmentService: DepartmentService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.patientId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPatientInfo();
    this.loadAppointments();
    this.loadDoctorDepartments();
    this.setupFormSubscriptions();
  }

  initializeForm(): void {
    this.appointmentForm = this.fb.group({
      appointmentDate: ['', Validators.required],
      notes: [''],
      departmentId: ['', Validators.required],
      doctorId: ['', Validators.required]
    });
  }

  setupFormSubscriptions(): void {
    // Subscribe to department changes
    this.appointmentForm.get('departmentId')?.valueChanges.subscribe(departmentId => {
      this.selectedDepartmentId = departmentId;
      this.appointmentForm.patchValue({ doctorId: '', doctorDepartmentId: '' });
    });

    // Subscribe to doctor changes
    this.appointmentForm.get('doctorId')?.valueChanges.subscribe(doctorId => {
      if (this.selectedDepartmentId && doctorId) {
        const doctorDepartment = this.doctorDepartments.find(
          dd => dd.departmentId === this.selectedDepartmentId && dd.doctorId === doctorId
        );
        if (doctorDepartment) {
          this.appointmentForm.patchValue({ doctorDepartmentId: doctorDepartment.id }, { emitEvent: false });
        }
      }
    });
  }

  loadPatientInfo(): void {
    this.patientService.getPatientById(this.patientId).subscribe({
      next: (patient) => {
        this.patient = patient;
      },
      error: (err) => {
        console.error('Error loading patient info:', err);
      }
    });
  }

  loadAppointments(): void {
    this.loading = true;
    this.appointmentService.getPatientAppointments(this.patientId).subscribe({
      next: (data) => {
        this.appointments = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load appointments';
        this.loading = false;
        console.error('Error loading appointments:', error);
      }
    });
  }

  loadDoctorDepartments(): void {
    this.departmentService.getDoctorDepartments().subscribe({
      next: (data) => {
        this.doctorDepartments = data;
        this.doctordepartments = data;
        
        // Extract unique departments
        const departmentsMap = new Map<number, string>();
        data.forEach(dd => departmentsMap.set(dd.departmentId, dd.departmentName));
        this.departments = Array.from(departmentsMap).map(([id, name]) => ({ id, name }));

        // Group doctors by department
        this.doctorsByDepartment = data.reduce((acc, dd) => {
          if (!acc[dd.departmentId]) {
            acc[dd.departmentId] = [];
          }
          if (!acc[dd.departmentId].some(d => d.id === dd.doctorId)) {
            acc[dd.departmentId].push({ id: dd.doctorId, name: dd.doctorName });
          }
          return acc;
        }, {} as { [key: number]: { id: number, name: string }[] });
      },
      error: (error) => {
        console.error('Error loading doctor departments:', error);
        this.error = 'Failed to load departments and doctors';
      }
    });
  }

  // Search and filter methods
  applyFilters(): void {
    let filtered = [...this.appointments];

    // Apply text search
    if (this.searchTerm.trim()) {
      filtered = filtered.filter(appointment =>
        appointment.doctorName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        appointment.departmentName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        appointment.notes?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (this.selectedStatus !== 'all') {
      const statusValue = parseInt(this.selectedStatus);
      filtered = filtered.filter(appointment => appointment.status === statusValue);
    }

    // Apply department filter
    if (this.selectedDepartment !== 'all') {
      filtered = filtered.filter(appointment => 
        appointment.departmentName.toLowerCase() === this.selectedDepartment.toLowerCase()
      );
    }

    this.filteredAppointments = filtered;
    this.totalItems = filtered.length;
    this.calculatePagination();
    this.updatePaginatedAppointments();
  }

  search(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'all';
    this.selectedDepartment = 'all';
    this.currentPage = 1;
    this.applyFilters();
  }

  // Pagination methods
  calculatePagination(): void {
    const itemsPerPage = Number(this.itemsPerPage);
    
    if (isNaN(itemsPerPage) || itemsPerPage <= 0) {
      console.error('Invalid itemsPerPage in calculatePagination:', this.itemsPerPage);
      this.itemsPerPage = 10;
      this.totalPages = Math.ceil(this.totalItems / 10);
    } else {
      this.totalPages = Math.ceil(this.totalItems / itemsPerPage);
    }
    
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
  }

  updatePaginatedAppointments(): void {
    const itemsPerPage = Number(this.itemsPerPage);
    const currentPage = Number(this.currentPage);
    
    if (isNaN(itemsPerPage) || itemsPerPage <= 0) {
      console.error('Invalid itemsPerPage in updatePaginatedAppointments:', this.itemsPerPage);
      return;
    }
    
    if (isNaN(currentPage) || currentPage <= 0) {
      console.error('Invalid currentPage in updatePaginatedAppointments:', this.currentPage);
      return;
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    this.paginatedAppointments = this.filteredAppointments.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedAppointments();
      this.scrollToTop();
    }
  }

  onItemsPerPageChange(): void {
    this.itemsPerPage = Number(this.itemsPerPage);
    
    if (isNaN(this.itemsPerPage) || this.itemsPerPage <= 0) {
      console.error('Invalid items per page value:', this.itemsPerPage);
      this.itemsPerPage = 10;
    }
    
    this.currentPage = 1;
    this.calculatePagination();
    this.updatePaginatedAppointments();
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

  // Helper methods
  getAvailableDoctors(): { id: number, name: string }[] {
    return this.selectedDepartmentId ? (this.doctorsByDepartment[this.selectedDepartmentId] || []) : [];
  }

  getUniqueDepartments(): string[] {
    const departments = [...new Set(this.appointments.map(app => app.departmentName))];
    return departments.sort();
  }

  // Modal methods
  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.appointmentForm.reset();
  }

  createAppointment(): void {
    if (this.appointmentForm.valid) {
      const formValue = this.appointmentForm.value;
      const doctorDepartment = this.doctorDepartments.find(d => 
        d.departmentId == formValue.departmentId && 
        d.doctorId == formValue.doctorId
      );

      if (!doctorDepartment) {
        this.error = 'Selected doctor is not available in the selected department';
        return;
      }

      const appointmentData: CreateAppointmentDTO = {
        appointmentDate: formValue.appointmentDate,
        notes: formValue.notes,
        doctorDepartmentId: doctorDepartment.id,
        patientId: this.patientId
      };

      this.appointmentService.createAppointment(appointmentData).subscribe({
        next: () => {
          this.loadAppointments();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating appointment:', error);
          this.error = 'Failed to create appointment';
        }
      });
    }
  }

  // Status and formatting methods
  getStatusName(status: AppointmentStatus): string {
    return AppointmentStatus[status];
  }

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

  getStatusIcon(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.Scheduled:
        return 'fa-clock';
      case AppointmentStatus.Completed:
        return 'fa-check-circle';
      case AppointmentStatus.Cancelled:
        return 'fa-times-circle';
      case AppointmentStatus.NoShow:
        return 'fa-exclamation-circle';
      default:
        return 'fa-question-circle';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }

  // Navigation methods
  viewAppointmentDetails(appointmentId: number): void {
    this.router.navigate(['/appointment-details', appointmentId]);
  }

  viewPatientLabTests(patientId: number, appointmentId: number | null): void {
    const navigationExtras = appointmentId ? { queryParams: { appointmentId: appointmentId } } : {};
    this.router.navigate(['/patient-lab-tests', patientId], navigationExtras);
  }

  viewPatientMedicalHistory(patientId: number): void {
    this.router.navigate(['/patient-medical-history', patientId]);
  }

  goBack(): void {
    this.router.navigate(['/admin/patients']);
  }

  goToPatientProfile(): void {
    this.router.navigate(['/patient-profile', this.patientId]);
  }
}