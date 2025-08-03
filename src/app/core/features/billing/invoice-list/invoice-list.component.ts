import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InvoiceService } from '../../../services/appintments/invoice.service';
import { AppointmentService } from '../../../services/appintments/appointment.service';
import { AllInvoices, CreateInvoice, InvoiceDto, UpdateInvoice } from '../../../Interfaces/appointment/invoices/invoice';
import { PaymentMethod, AppointmentDetails, AppointmentStatus } from '../../../Interfaces/all';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,RouterModule],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.css'
})
export class InvoiceListComponent implements OnInit {
  invoices: AllInvoices[] = [];
  filteredInvoices: AllInvoices[] = [];
  selectedInvoice: InvoiceDto | null = null;
  appointments: AppointmentDetails[] = [];
  loading = false;
  success = '';
  error = '';
  
  // View states
  activeView: 'list' | 'details' = 'list';
  
  // Modal states
  showInvoiceModal = false;
  editingInvoice: AllInvoices | null = null;
  
  // Filters
  searchTerm = '';
  selectedPaymentMethod: PaymentMethod | 'all' = 'all';
  selectedPaymentStatus: 'all' | 'paid' | 'unpaid' = 'all';
  startDate = '';
  endDate = '';
  
  // Form
  invoiceForm: FormGroup;
  
  // Payment methods for dropdown
  paymentMethods: PaymentMethod[] = [PaymentMethod.Cash, PaymentMethod.CreditCard, PaymentMethod.Wallet, PaymentMethod.Insurance, PaymentMethod.Other];
  
  constructor(
    private invoiceService: InvoiceService,
    private appointmentService: AppointmentService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.invoiceForm = this.fb.group({
      appointmentId: ['', [Validators.required]],
      totalAmount: ['', [Validators.required, Validators.min(0)]],
      paidAmount: ['', [Validators.required, Validators.min(0)]],
      paymentMethod: [PaymentMethod.Cash, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadInvoices();
    this.loadAppointments();
  }

  loadInvoices(): void {
    this.loading = true;
    this.invoiceService.getAllInvoices().subscribe({
      next: (invoices) => {
        this.invoices = invoices;
        this.filteredInvoices = invoices;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load invoices: ' + err.message;
        this.loading = false;
      }
    });
  }

  loadAppointments(): void {
    this.appointmentService.getAppointments().subscribe({
      next: (appointments) => {
        // Filter only completed appointments
        const completedAppointments = appointments.filter(appointment => 
          appointment.status === AppointmentStatus.Completed
        );
        
        // Filter out appointments that already have invoices
        const availableAppointments = completedAppointments.filter(appointment => {
          return !this.invoices.some(invoice => {
            const invoiceId = 'id' in invoice ? invoice.id : (invoice as any).appointmentId;
            return invoiceId === appointment.id;
          });
        });
        
        this.appointments = availableAppointments;
        
        if (availableAppointments.length === 0 && completedAppointments.length > 0) {
          this.success = 'All completed appointments already have invoices.';
          this.clearMessages();
        }
      },
      error: (err) => {
        console.error('Failed to load appointments:', err);
        this.error = 'Failed to load appointments: ' + err.message;
        this.clearMessages();
      }
    });
  }

  onFilterChange(): void {
    this.filteredInvoices = this.invoices.filter(invoice => {
      const matchesSearch = !this.searchTerm || 
        invoice.id.toString().includes(this.searchTerm) ||
        invoice.totalAmount.toString().includes(this.searchTerm);
      
      // Convert enum value to string for comparison with backend string values
      const getPaymentMethodString = (enumValue: PaymentMethod): string => {
        const stringMap: { [key in PaymentMethod]: string } = {
          [PaymentMethod.Cash]: 'Cash',
          [PaymentMethod.CreditCard]: 'CreditCard',
          [PaymentMethod.Wallet]: 'Wallet',
          [PaymentMethod.Insurance]: 'Insurance',
          [PaymentMethod.Other]: 'Other'
        };
        return stringMap[enumValue];
      };
      
      const matchesPaymentMethod = this.selectedPaymentMethod === 'all' || 
        (typeof invoice.paymentMethod === 'string' && invoice.paymentMethod === getPaymentMethodString(this.selectedPaymentMethod));
      
      const matchesPaymentStatus = this.selectedPaymentStatus === 'all' ||
        (this.selectedPaymentStatus === 'paid' && invoice.isPaid) ||
        (this.selectedPaymentStatus === 'unpaid' && !invoice.isPaid);
      
      const matchesDateRange = this.matchesDateRange(invoice.createdAt);
      
      return matchesSearch && matchesPaymentMethod && matchesPaymentStatus && matchesDateRange;
    });
  }

  private matchesDateRange(createdAt: string): boolean {
    if (!this.startDate && !this.endDate) return true;
    
    const invoiceDate = new Date(createdAt);
    const start = this.startDate ? new Date(this.startDate) : null;
    const end = this.endDate ? new Date(this.endDate) : null;
    
    if (start && invoiceDate < start) return false;
    if (end && invoiceDate > end) return false;
    
    return true;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedPaymentMethod = 'all';
    this.selectedPaymentStatus = 'all';
    this.startDate = '';
    this.endDate = '';
    this.onFilterChange();
  }

  showInvoiceDetails(invoice: AllInvoices): void {
    this.router.navigate(['/admin/invoices', invoice.id]);
    // this.loading = true;
    // console.log('Showing invoice details for ID:', invoice.id);
    // this.invoiceService.getInvoiceById(invoice.id).subscribe({
    //   next: (invoiceDetails) => {
    //     this.selectedInvoice = invoiceDetails;
    //     this.activeView = 'details';
    //     this.loading = false;
    //   },
    //   error: (err) => {
    //     this.error = 'Failed to load invoice details: ' + err.message;
    //     this.loading = false;
    //   }
    // });
  }

  backToList(): void {
    this.activeView = 'list';
    this.selectedInvoice = null;
  }

  showAddInvoiceModal(): void {
    this.editingInvoice = null;
    this.invoiceForm.reset({
      appointmentId: '',
      totalAmount: '',
      paidAmount: '',
      paymentMethod: PaymentMethod.Cash
    });
    
    // Reload appointments for new invoice creation
    this.loadAppointments();
    
    this.showInvoiceModal = true;
  }

  showEditInvoiceModal(invoice: AllInvoices | InvoiceDto): void {
    console.log('Editing invoice:', invoice);
    console.log('Invoice type:', 'id' in invoice ? 'AllInvoices' : 'InvoiceDto');
    console.log('Invoice ID:', 'id' in invoice ? invoice.id : 'No ID property');
    console.log('Appointment ID:', 'appointmentId' in invoice ? invoice.appointmentId : 'No appointmentId property');
    
    // For InvoiceDto, we need to get the actual invoice ID, not the appointment ID
    let actualInvoiceId: number;
    if ('id' in invoice) {
      // This is AllInvoices, use the ID directly
      actualInvoiceId = invoice.id;
    } else {
      // This is InvoiceDto, we need to find the actual invoice ID
      // For now, let's use the appointment ID as a fallback, but this might be wrong
      actualInvoiceId = (invoice as InvoiceDto).appointmentId;
      console.warn('Using appointment ID as invoice ID - this might be incorrect');
    }
    
    // Convert InvoiceDto to AllInvoices format if needed
    const invoiceForEdit: AllInvoices = {
      id: actualInvoiceId,
      createdAt: invoice.createdAt,
      totalAmount: invoice.totalAmount,
      paidAmount: invoice.paidAmount,
      isPaid: invoice.isPaid,
      paymentMethod: invoice.paymentMethod
    };
    
    console.log('Final invoice ID for editing:', invoiceForEdit.id);
    
    this.editingInvoice = invoiceForEdit;
    
    // For editing, we need to include the appointment in the available appointments list
    // since the appointment might not be in the current filtered list
    this.loadAppointmentsForEdit(invoiceForEdit.id);
    
    // Convert string payment method to enum value for the form
    const paymentMethodForForm = typeof invoiceForEdit.paymentMethod === 'string' 
      ? this.convertStringToPaymentMethod(invoiceForEdit.paymentMethod)
      : invoiceForEdit.paymentMethod;
    
    this.invoiceForm.patchValue({
      appointmentId: invoiceForEdit.id,
      totalAmount: invoiceForEdit.totalAmount,
      paidAmount: invoiceForEdit.paidAmount,
      paymentMethod: paymentMethodForForm
    });
    this.showInvoiceModal = true;
  }

  loadAppointmentsForEdit(invoiceId: number): void {
    // Load all appointments including the one for this invoice
    this.appointmentService.getAppointments().subscribe({
      next: (appointments) => {
        // Filter only completed appointments
        const completedAppointments = appointments.filter(appointment => 
          appointment.status === AppointmentStatus.Completed
        );
        
        // For editing, include the current appointment even if it has an invoice
        const availableAppointments = completedAppointments.filter(appointment => {
          // Include the current appointment being edited
          if (appointment.id === invoiceId) {
            return true;
          }
          // Exclude other appointments that already have invoices
          return !this.invoices.some(invoice => {
            const invoiceAppointmentId = 'id' in invoice ? invoice.id : (invoice as any).appointmentId;
            return invoiceAppointmentId === appointment.id;
          });
        });
        
        this.appointments = availableAppointments;
      },
      error: (err) => {
        console.error('Failed to load appointments for edit:', err);
        this.error = 'Failed to load appointments: ' + err.message;
        this.clearMessages();
      }
    });
  }

  closeInvoiceModal(): void {
    this.showInvoiceModal = false;
    this.editingInvoice = null;
    this.invoiceForm.reset();
    
    // Reload original appointment list for new invoices
    this.loadAppointments();
  }

  saveInvoice(): void {
    console.log('Form valid:', this.invoiceForm.valid);
    console.log('Form dirty:', this.invoiceForm.dirty);
    console.log('Form touched:', this.invoiceForm.touched);
    
    if (this.invoiceForm.invalid) {
      console.log('Form is invalid:', this.invoiceForm.errors);
      console.log('Form control errors:');
      Object.keys(this.invoiceForm.controls).forEach(key => {
        const control = this.invoiceForm.get(key);
        if (control && control.errors) {
          console.log(`${key} errors:`, control.errors);
        }
      });
      return;
    }

    const formValue = this.invoiceForm.value;
    console.log('Raw form values:', formValue);
    console.log('Payment method type:', typeof formValue.paymentMethod);
    console.log('Payment method value:', formValue.paymentMethod);
    
    if (this.editingInvoice) {
      // Update existing invoice - send enum value (number) to backend
      const updateData = {
        totalAmount: +formValue.totalAmount,
        paidAmount: +formValue.paidAmount,
        paymentMethod: +formValue.paymentMethod // Convert to number
      };
      
      console.log('Updating invoice with data:', updateData);
      console.log('Update data payment method type:', typeof updateData.paymentMethod);
      console.log('Update data payment method value:', updateData.paymentMethod);
      
      this.invoiceService.updateInvoice(this.editingInvoice.id, updateData).subscribe({
        next: (response) => {
          console.log('Update success response:', response);
          this.success = 'Invoice updated successfully';
          this.closeInvoiceModal();
          
          // Reload data based on current view
          if (this.activeView === 'details' && this.selectedInvoice) {
            // Reload the current invoice details
            this.invoiceService.getInvoiceById(this.selectedInvoice.appointmentId).subscribe({
              next: (updatedInvoice) => {
                this.selectedInvoice = updatedInvoice;
              },
              error: (err) => {
                console.error('Failed to reload invoice details:', err);
              }
            });
          }
          
          this.loadInvoices();
          this.clearMessages();
        },
        error: (err) => {
          console.error('Update error details:', err);
          console.error('Error status:', err.status);
          console.error('Error message:', err.message);
          console.error('Error body:', err.error);
          this.error = 'Failed to update invoice: ' + err.message;
        }
      });
    } else {
      // Create new invoice - wrap in invoiceDTO object and send enum value (number) to backend
      const createData = {
        invoiceDTO: {
          appointmentId: +formValue.appointmentId, // Convert to number
          totalAmount: +formValue.totalAmount, // Convert to number
          paidAmount: +formValue.paidAmount, // Convert to number
          isPaid: +formValue.paidAmount >= +formValue.totalAmount, // Auto-determine if paid
          paymentMethod: +formValue.paymentMethod // Convert to number
        }
      };
      
      console.log('Creating invoice with data:', createData);
      console.log('Create data payment method type:', typeof createData.invoiceDTO.paymentMethod);
      console.log('Create data payment method value:', createData.invoiceDTO.paymentMethod);
      console.log('Raw payment method from form:', formValue.paymentMethod);
      console.log('Raw form values:', formValue);
      console.log('Form value types:', {
        appointmentId: typeof formValue.appointmentId,
        totalAmount: typeof formValue.totalAmount,
        paidAmount: typeof formValue.paidAmount,
        paymentMethod: typeof formValue.paymentMethod
      });
      console.log('createData', createData);
      const invoice: CreateInvoice = {
        appointmentId: +formValue.appointmentId,
        totalAmount: +formValue.totalAmount,
        paidAmount: +formValue.paidAmount,
        isPaid: +formValue.paidAmount >= +formValue.totalAmount,
        paymentMethod: +formValue.paymentMethod
      }
      this.invoiceService.addInvoice(invoice).subscribe({
        next: (response) => {
          console.log('Create success response:', response);
          this.success = 'Invoice created successfully';
          this.closeInvoiceModal();
          this.loadInvoices();
          this.clearMessages();
        },
        error: (err) => {
          console.error('Create error details:', err);
          console.error('Error status:', err.status);
          console.error('Error message:', err.message);
          console.error('Error body:', err.error);
          this.error = 'Failed to create invoice: ' + err.message;
        }
      });
    }
  }

  deleteInvoice(id: number): void {
    if (confirm('Are you sure you want to delete this invoice?')) {
      this.invoiceService.deleteInvoice(id).subscribe({
        next: () => {
          this.success = 'Invoice deleted successfully';
          this.loadInvoices();
          this.clearMessages();
        },
        error: (err) => {
          this.error = 'Failed to delete invoice: ' + err.message;
        }
      });
    }
  }

  getPaymentMethodText(paymentMethod: PaymentMethod | string): string {
    // Handle string values from backend
    if (typeof paymentMethod === 'string') {
      // Map string values to display text
      const stringMap: { [key: string]: string } = {
        'Cash': 'Cash',
        'CreditCard': 'Credit Card',
        'Wallet': 'Wallet',
        'Insurance': 'Insurance',
        'Other': 'Other'
      };
      return stringMap[paymentMethod] || paymentMethod;
    }
    
    // Handle numeric enum values
    const methodValue = typeof paymentMethod === 'string' ? parseInt(paymentMethod) : paymentMethod;
    
    const texts: { [key in PaymentMethod]: string } = {
      [PaymentMethod.Cash]: 'Cash',
      [PaymentMethod.CreditCard]: 'Credit Card',
      [PaymentMethod.Wallet]: 'Wallet',
      [PaymentMethod.Insurance]: 'Insurance',
      [PaymentMethod.Other]: 'Other'
    };
    
    // Check if the value exists in our enum
    if (methodValue in texts) {
      return texts[methodValue as PaymentMethod];
    }
    
    // Fallback for unknown values
    console.warn('Unknown payment method value:', paymentMethod, 'Type:', typeof paymentMethod);
    return 'Unknown';
  }

  getPaymentMethodClass(paymentMethod: PaymentMethod | string): string {
    // Handle string values from backend
    if (typeof paymentMethod === 'string') {
      // Map string values to CSS classes
      const stringMap: { [key: string]: string } = {
        'Cash': 'badge-success',
        'CreditCard': 'badge-primary',
        'Wallet': 'badge-info',
        'Insurance': 'badge-warning',
        'Other': 'badge-secondary'
      };
      return stringMap[paymentMethod] || 'badge-secondary';
    }
    
    // Handle numeric enum values
    const methodValue = typeof paymentMethod === 'string' ? parseInt(paymentMethod) : paymentMethod;
    
    const classes: { [key in PaymentMethod]: string } = {
      [PaymentMethod.Cash]: 'badge-success',
      [PaymentMethod.CreditCard]: 'badge-primary',
      [PaymentMethod.Wallet]: 'badge-info',
      [PaymentMethod.Insurance]: 'badge-warning',
      [PaymentMethod.Other]: 'badge-secondary'
    };
    
    // Check if the value exists in our enum
    if (methodValue in classes) {
      return classes[methodValue as PaymentMethod];
    }
    
    // Fallback for unknown values
    return 'badge-secondary';
  }

  // Helper method to convert string payment method to enum value
  convertStringToPaymentMethod(paymentMethod: string): PaymentMethod {
    const stringMap: { [key: string]: PaymentMethod } = {
      'Cash': PaymentMethod.Cash,
      'CreditCard': PaymentMethod.CreditCard,
      'Wallet': PaymentMethod.Wallet,
      'Insurance': PaymentMethod.Insurance,
      'Other': PaymentMethod.Other
    };
    return stringMap[paymentMethod] || PaymentMethod.Cash;
  }

  // Helper method to ensure payment method is properly converted
  normalizePaymentMethod(paymentMethod: any): PaymentMethod {
    if (typeof paymentMethod === 'string') {
      // Handle string values from backend
      if (paymentMethod in PaymentMethod) {
        return this.convertStringToPaymentMethod(paymentMethod);
      }
      const parsed = parseInt(paymentMethod);
      if (!isNaN(parsed) && parsed in PaymentMethod) {
        return parsed as PaymentMethod;
      }
    } else if (typeof paymentMethod === 'number' && paymentMethod in PaymentMethod) {
      return paymentMethod as PaymentMethod;
    }
    
    // Default to Cash if invalid
    console.warn('Invalid payment method value, defaulting to Cash:', paymentMethod);
    return PaymentMethod.Cash;
  }

  getPaymentStatusClass(isPaid: boolean): string {
    return isPaid ? 'badge-success' : 'badge-danger';
  }

  getPaymentStatusText(isPaid: boolean): string {
    return isPaid ? 'Paid' : 'Unpaid';
  }

  getAppointmentStatusText(status: AppointmentStatus): string {
    const statusTexts: { [key in AppointmentStatus]: string } = {
      [AppointmentStatus.Scheduled]: 'Scheduled',
      [AppointmentStatus.Completed]: 'Completed',
      [AppointmentStatus.Cancelled]: 'Cancelled',
      [AppointmentStatus.NoShow]: 'No Show'
    };
    return statusTexts[status] || 'Unknown';
  }

  getAppointmentStatusClass(status: AppointmentStatus): string {
    const statusClasses: { [key in AppointmentStatus]: string } = {
      [AppointmentStatus.Scheduled]: 'badge-primary',
      [AppointmentStatus.Completed]: 'badge-success',
      [AppointmentStatus.Cancelled]: 'badge-danger',
      [AppointmentStatus.NoShow]: 'badge-warning'
    };
    return statusClasses[status] || 'badge-secondary';
  }

  formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  getAppointmentDisplayText(appointment: AppointmentDetails): string {
    return `#${appointment.id} - ${appointment.name} (${appointment.doctorName}) - ${this.formatDateTime(appointment.appointmentDate)}`;
  }

  getSelectedAppointment(): AppointmentDetails | null {
    const appointmentId = this.invoiceForm.get('appointmentId')?.value;
    if (!appointmentId) return null;
    return this.appointments.find(app => app.id === appointmentId) || null;
  }

  onAppointmentChange(): void {
    const selectedAppointment = this.getSelectedAppointment();
    if (selectedAppointment) {
      // You could auto-populate some fields based on the appointment
      // For example, you might want to set a default amount based on the department
      console.log('Selected appointment:', selectedAppointment);
    }
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['min']) return `${fieldName} must be at least ${field.errors['min'].min}`;
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
