import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../services/appintments/appointment.service';
import { PatientService } from '../../../services/patients/patient.service';
import { AppointmentDetails, AppointmentStatus, CreateAppointmentDTO, DoctorDepartment, DoctorDepartmentViewDTO, PaymentMethod } from '../../../Interfaces/all';
import { PatientDto } from '../../../Interfaces/patient/patients/patient';
import { DepartmentService } from '../../../services/clinics/department.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InvoiceService } from '../../../services/appintments/invoice.service';
import { CreateInvoice } from '../../../Interfaces/appointment/invoices/invoice';
import { TransactionService } from '../../../services/transactions/transaction.service';
import { CreateTransactionDTO, TransactionType } from '../../../Models/transactions/transactions.model';
import { AuthService } from '../../../services/auth.service';

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
  success: string = ''; // Added for success messages
  
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
  
  // Payment methods for invoice
  paymentMethods = [
    { value: PaymentMethod.Cash, label: 'Cash' },
    { value: PaymentMethod.CreditCard, label: 'Credit Card' },
    { value: PaymentMethod.Wallet, label: 'Wallet' },
    { value: PaymentMethod.Insurance, label: 'Insurance' },
    { value: PaymentMethod.Other, label: 'Other' }
  ];

  constructor(
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private departmentService: DepartmentService,
    private invoiceService: InvoiceService,
    private transactionService: TransactionService,
    private authService: AuthService,
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
      doctorId: ['', Validators.required],
      // Invoice and payment fields
      totalAmount: ['', [Validators.required, Validators.min(0)]],
      paidAmount: ['', [Validators.required, Validators.min(0)]],
      paymentMethod: [PaymentMethod.Cash, Validators.required]
    }, { validators: this.paymentAmountValidator });
  }

  // Custom validator for payment amounts
  paymentAmountValidator(group: FormGroup): { [key: string]: any } | null {
    const totalAmount = group.get('totalAmount')?.value;
    const paidAmount = group.get('paidAmount')?.value;
    
    if (totalAmount && paidAmount && paidAmount > totalAmount) {
      return { 'paidAmountExceedsTotal': true };
    }
    
    return null;
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

    // Subscribe to total amount changes to auto-calculate paid amount
    this.appointmentForm.get('totalAmount')?.valueChanges.subscribe(totalAmount => {
      if (totalAmount && !this.appointmentForm.get('paidAmount')?.value) {
        // Auto-set paid amount to total amount for convenience
        this.appointmentForm.patchValue({ paidAmount: totalAmount }, { emitEvent: false });
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
    this.error = '';
    this.success = '';
  }

  // Calculate remaining balance for payment
  calculateRemainingBalance(): number {
    const totalAmount = this.appointmentForm.get('totalAmount')?.value || 0;
    const paidAmount = this.appointmentForm.get('paidAmount')?.value || 0;
    return Math.max(0, totalAmount - paidAmount);
  }

  // Check if payment is complete
  isPaymentComplete(): boolean {
    const totalAmount = this.appointmentForm.get('totalAmount')?.value || 0;
    const paidAmount = this.appointmentForm.get('paidAmount')?.value || 0;
    return paidAmount >= totalAmount;
  }

  // Check if paid amount exceeds total amount
  hasPaidAmountError(): boolean {
    return this.appointmentForm.hasError('paidAmountExceedsTotal');
  }

  // Get paid amount error message
  getPaidAmountErrorMessage(): string {
    if (this.hasPaidAmountError()) {
      return 'Paid amount cannot exceed total amount';
    }
    return '';
  }

  // Get suggested appointment fee based on department
  getSuggestedFee(): number {
    const departmentId = this.appointmentForm.get('departmentId')?.value;
    if (!departmentId) return 0;
    
    // Common fee suggestions based on department type
    const feeSuggestions: { [key: number]: number } = {
      1: 150, // General Medicine
      2: 200, // Cardiology
      3: 180, // Orthopedics
      4: 160, // Pediatrics
      5: 220, // Neurology
      6: 190, // Dermatology
      7: 170, // Ophthalmology
      8: 250, // Surgery
      9: 140, // Emergency
      10: 130  // Consultation
    };
    
    return feeSuggestions[departmentId] || 150; // Default fee
  }

  // Apply suggested fee
  applySuggestedFee(): void {
    const suggestedFee = this.getSuggestedFee();
    if (suggestedFee > 0) {
      this.appointmentForm.patchValue({
        totalAmount: suggestedFee,
        paidAmount: suggestedFee
      });
    }
  }

  // Create transaction record for the invoice payment
  createTransactionRecord(amount: number, description: string): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('User ID not available for transaction creation');
      return;
    }

    const transactionData: CreateTransactionDTO = {
      amount: amount,
      date: new Date(),
      description: description,
      type: TransactionType.Income, // This is income for the clinic
      userId: userId
    };

    this.transactionService.createTransaction(transactionData).subscribe({
      next: (transactionResponse) => {
        console.log('Transaction created successfully:', transactionResponse);
      },
      error: (transactionError) => {
        console.error('Error creating transaction:', transactionError);
        // Don't show error to user as this is secondary to appointment/invoice creation
      }
    });
  }

  // Create transaction records for invoice payment (handles full and partial payments)
  createPaymentTransactions(totalAmount: number, paidAmount: number, patientName: string): void {
    if (paidAmount > 0) {
      // Create transaction for the paid amount
      const paidDescription = `Appointment payment received - Patient: ${patientName}, Paid: $${paidAmount}`;
      this.createTransactionRecord(paidAmount, paidDescription);
    }

    // If there's a remaining balance, we could create a pending transaction record
    // This would be useful for tracking outstanding payments
    const remainingBalance = totalAmount - paidAmount;
    if (remainingBalance > 0) {
      console.log(`Remaining balance of $${remainingBalance} will be tracked for future payment`);
      // Optionally create a pending transaction record here if needed
    }
  }

  // Create comprehensive transaction summary
  createTransactionSummary(appointmentData: any, invoiceData: any, patientName: string): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('User ID not available for transaction summary');
      return;
    }

    // Validate transaction data
    if (!this.validateTransactionData(invoiceData)) {
      console.error('Invalid transaction data, skipping transaction creation');
      return;
    }

    // Create main payment transaction
    if (invoiceData.paidAmount > 0) {
      const mainTransactionData: CreateTransactionDTO = {
        amount: invoiceData.paidAmount,
        date: new Date(),
        description: `Appointment #${appointmentData.id} - ${patientName} - ${invoiceData.paidAmount >= invoiceData.totalAmount ? 'Full Payment' : 'Partial Payment'}`,
        type: TransactionType.Income,
        userId: userId
      };

      this.transactionService.createTransaction(mainTransactionData).subscribe({
        next: (response) => {
          console.log('Main payment transaction created successfully:', response);
        },
        error: (error) => {
          console.error('Error creating main payment transaction:', error);
          // Log detailed error information for debugging
          if (error.error) {
            console.error('Transaction creation error details:', error.error);
          }
        }
      });
    }
  }

  // Validate transaction data before creation
  validateTransactionData(invoiceData: any): boolean {
    if (!invoiceData || typeof invoiceData.paidAmount !== 'number' || invoiceData.paidAmount < 0) {
      console.error('Invalid paid amount for transaction:', invoiceData?.paidAmount);
      return false;
    }

    if (!invoiceData.totalAmount || typeof invoiceData.totalAmount !== 'number' || invoiceData.totalAmount <= 0) {
      console.error('Invalid total amount for transaction:', invoiceData?.totalAmount);
      return false;
    }

    if (invoiceData.paidAmount > invoiceData.totalAmount) {
      console.error('Paid amount exceeds total amount:', invoiceData.paidAmount, '>', invoiceData.totalAmount);
      return false;
    }

    return true;
  }

  // Create detailed transaction records based on payment scenario
  createDetailedTransactions(appointmentData: any, invoiceData: any, patientName: string): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('User ID not available for detailed transactions');
      return;
    }

    // Get payment method name for better transaction description
    const paymentMethodName = this.getPaymentMethodName(invoiceData.paymentMethod);

    // Create main payment transaction
    if (invoiceData.paidAmount > 0) {
      const paymentType = invoiceData.paidAmount >= invoiceData.totalAmount ? 'Full Payment' : 'Partial Payment';
      const mainTransactionData: CreateTransactionDTO = {
        amount: invoiceData.paidAmount,
        date: new Date(),
        description: `Appointment #${appointmentData.id} - ${patientName} - ${paymentType} via ${paymentMethodName}`,
        type: TransactionType.Income,
        userId: userId
      };

      this.transactionService.createTransaction(mainTransactionData).subscribe({
        next: (response) => {
          console.log(`${paymentType} transaction created successfully:`, response);
        },
        error: (error) => {
          console.error(`Error creating ${paymentType.toLowerCase()} transaction:`, error);
        }
      });
    }

    // Log payment summary for financial tracking
    this.logPaymentSummary(appointmentData, invoiceData, patientName);
  }

  // Get payment method name from enum value
  getPaymentMethodName(paymentMethod: number): string {
    const methodNames: { [key: number]: string } = {
      [PaymentMethod.Cash]: 'Cash',
      [PaymentMethod.CreditCard]: 'Credit Card',
      [PaymentMethod.Wallet]: 'Wallet',
      [PaymentMethod.Insurance]: 'Insurance',
      [PaymentMethod.Other]: 'Other'
    };
    return methodNames[paymentMethod] || 'Unknown';
  }

  // Handle transaction creation with better error handling
  handleTransactionCreation(appointmentData: any, invoiceData: any, patientName: string): void {
    try {
      this.createDetailedTransactions(appointmentData, invoiceData, patientName);
    } catch (error) {
      console.error('Error in transaction creation process:', error);
      // Transaction creation failure shouldn't affect the main appointment/invoice creation
      // Log the error but don't show it to the user
    }
  }

  // Get comprehensive success message based on what was created
  getSuccessMessage(appointmentCreated: boolean, invoiceCreated: boolean, transactionCreated: boolean): string {
    if (appointmentCreated && invoiceCreated && transactionCreated) {
      return 'Appointment, invoice, and transaction records created successfully!';
    } else if (appointmentCreated && invoiceCreated) {
      return 'Appointment and invoice created successfully! (Transaction creation failed)';
    } else if (appointmentCreated) {
      return 'Appointment created successfully! (Invoice and transaction creation failed)';
    } else {
      return 'Failed to create appointment. Please try again.';
    }
  }

  // Log payment summary for financial tracking
  logPaymentSummary(appointmentData: any, invoiceData: any, patientName: string): void {
    const paymentStatus = invoiceData.paidAmount >= invoiceData.totalAmount ? 'FULLY PAID' : 'PARTIALLY PAID';
    const remainingBalance = Math.max(0, invoiceData.totalAmount - invoiceData.paidAmount);
    const paymentMethodName = this.getPaymentMethodName(invoiceData.paymentMethod);
    
    console.log('=== PAYMENT SUMMARY ===');
    console.log(`Appointment ID: ${appointmentData.id}`);
    console.log(`Patient: ${patientName}`);
    console.log(`Total Amount: $${invoiceData.totalAmount}`);
    console.log(`Paid Amount: $${invoiceData.paidAmount}`);
    console.log(`Payment Status: ${paymentStatus}`);
    console.log(`Payment Method: ${paymentMethodName}`);
    if (remainingBalance > 0) {
      console.log(`Remaining Balance: $${remainingBalance}`);
    }
    console.log(`Transaction Type: Income`);
    console.log(`Date: ${new Date().toISOString()}`);
    console.log('========================');
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

      // Create appointment first
      this.appointmentService.createAppointment(appointmentData).subscribe({
        next: (appointmentResponse) => {
          console.log('Appointment created successfully:', appointmentResponse);
          
          // Extract appointment ID from response
          const appointmentId = appointmentResponse.id || appointmentResponse.appointmentId;
          
          if (appointmentId) {
            // Create invoice for the appointment
            const invoiceData: CreateInvoice = {
              doctorId: doctorDepartment.doctorId,
              departmentId: doctorDepartment.departmentId,
              description: formValue.notes,
              serviceId: formValue.serviceId,
              totalAmount: +formValue.totalAmount,
              paymentMethod: +formValue.paymentMethod,

            };

            this.invoiceService.addInvoice(invoiceData).subscribe({
              next: (invoiceResponse) => {
                console.log('Invoice created successfully:', invoiceResponse);
                
                // Create detailed transaction records
                const patientName = this.patient?.name || 'Unknown';
                const appointmentData = { id: appointmentId };
                this.handleTransactionCreation(appointmentData, invoiceData, patientName);
                
                this.success = this.getSuccessMessage(true, true, true); // Use the new method
                this.loadAppointments();
                this.closeModal();
                
                // Clear success message after 3 seconds
                setTimeout(() => {
                  this.success = '';
                }, 3000);
              },
              error: (invoiceError) => {
                console.error('Error creating invoice:', invoiceError);
                this.error = 'Appointment created but failed to create invoice. Please contact support.';
                
                // Clear error message after 5 seconds
                setTimeout(() => {
                  this.error = '';
                }, 5000);
              }
            });
          } else {
            this.error = 'Appointment created but could not retrieve ID for invoice creation.';
          this.loadAppointments();
          this.closeModal();
          }
        },
        error: (error) => {
          console.error('Error creating appointment:', error);
          this.error = 'Failed to create appointment: ' + (error.error?.message || error.message || 'Unknown error');
          
          // Clear error message after 5 seconds
          setTimeout(() => {
            this.error = '';
          }, 5000);
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