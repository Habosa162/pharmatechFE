import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceService } from '../../../services/appintments/invoice.service';
import { AllInvoices, UpdateInvoice } from '../../../Interfaces/appointment/invoices/invoice';
import { PaymentMethod } from '../../../Interfaces/all';

@Component({
  selector: 'app-invoice-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './invoice-edit.component.html',
  styleUrl: './invoice-edit.component.css'
})
export class InvoiceEditComponent implements OnInit {
  invoice: AllInvoices | null = null;
  loading = false;
  saving = false;
  success = '';
  error = '';
  
  // Form
  invoiceForm: FormGroup;
  
  // Payment methods for dropdown
  paymentMethods: PaymentMethod[] = [PaymentMethod.Cash, PaymentMethod.CreditCard, PaymentMethod.Wallet, PaymentMethod.Insurance, PaymentMethod.Other];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService,
    private fb: FormBuilder
  ) {
    this.invoiceForm = this.fb.group({
      totalAmount: ['', [Validators.required, Validators.min(0)]],
      paidAmount: ['', [Validators.required, Validators.min(0)]],
      paymentMethod: [PaymentMethod.Cash, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadInvoice();
  }

  loadInvoice(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Invoice ID not provided';
      return;
    }

    this.loading = true;
    this.invoiceService.getInvoiceById(+id).subscribe({
      next: (invoice) => {
        this.invoice = invoice as any; // Type casting for compatibility
        this.populateForm();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load invoice: ' + err.message;
        this.loading = false;
      }
    });
  }

  populateForm(): void {
    if (this.invoice) {
      // Debug logging
      console.log('Original invoice payment method:', this.invoice.paymentMethod);
      console.log('Original payment method type:', typeof this.invoice.paymentMethod);
      
      // Convert payment method to proper enum value for form
      const normalizedPaymentMethod = this.normalizePaymentMethod(this.invoice.paymentMethod);
      
      console.log('Normalized payment method for form:', normalizedPaymentMethod);
      console.log('Normalized payment method type:', typeof normalizedPaymentMethod);
      
      // Reset form first to ensure clean state
      this.invoiceForm.reset();
      
      this.invoiceForm.patchValue({
        totalAmount: this.invoice.totalAmount,
        // paidAmount: this.invoice.paidAmount,
        paymentMethod: normalizedPaymentMethod
      });
      
      // Debug: Check what's actually in the form
      console.log('Form payment method after patch:', this.invoiceForm.get('paymentMethod')?.value);
      console.log('Form payment method type after patch:', typeof this.invoiceForm.get('paymentMethod')?.value);
    }
  }

  saveInvoice(): void {
    if (this.invoiceForm.invalid || !this.invoice) return;

    this.saving = true;
    const formValue = this.invoiceForm.value;
    
    // Convert payment method to proper enum value
    const normalizedPaymentMethod = this.normalizePaymentMethod(formValue.paymentMethod);
    
    // Debug logging
    console.log('Original form payment method:', formValue.paymentMethod);
    console.log('Normalized payment method:', normalizedPaymentMethod);
    console.log('Payment method type:', typeof normalizedPaymentMethod);
    
    const updateData: UpdateInvoice = {
      totalAmount: formValue.totalAmount,
      // paidAmount: formValue.paidAmount,
      paymentMethod: normalizedPaymentMethod
    };
    
    console.log('Sending to backend:', updateData);
    
    this.invoiceService.updateInvoice(this.invoice.id, updateData).subscribe({
      next: () => {
        this.success = 'Invoice updated successfully';
        this.saving = false;
        this.loadInvoice();
        this.clearMessages();
        this.router.navigate(['/admin/invoices',this.invoice?.id]);
        // setTimeout(() => {
        // }, 2000);
      },
      error: (err) => {
        this.error = 'Failed to update invoice: ' + err.message;
        this.saving = false;
      }
    });
  }

  // Helper method to ensure payment method is properly converted
  normalizePaymentMethod(paymentMethod: any): PaymentMethod {
    if (typeof paymentMethod === 'string') {
      // Map string values to numeric enum values
      const stringToEnum: { [key: string]: PaymentMethod } = {
        'Cash': PaymentMethod.Cash,           // 0
        'Credit Card': PaymentMethod.CreditCard, // 1
        'Wallet': PaymentMethod.Wallet,       // 2
        'Insurance': PaymentMethod.Insurance, // 3
        'Other': PaymentMethod.Other          // 4
      };
      
      if (stringToEnum[paymentMethod] !== undefined) {
        return stringToEnum[paymentMethod];
      }
      
      // Try to parse as number
      const parsed = parseInt(paymentMethod);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 4) {
        return parsed as PaymentMethod;
      }
    } else if (typeof paymentMethod === 'number') {
      // If it's already a number, validate it's in range
      if (paymentMethod >= 0 && paymentMethod <= 4) {
        return paymentMethod as PaymentMethod;
      }
    }
    
    // Default to Cash (0) if invalid
    console.warn('Invalid payment method value, defaulting to Cash (0):', paymentMethod);
    return PaymentMethod.Cash; // 0
  }

  cancel(): void {
    this.router.navigate(['/admin/invoices']);
  }

  getPaymentMethodClass(paymentMethod: PaymentMethod | string): string {
    // If it's a string, try to map it to a class
    if (typeof paymentMethod === 'string') {
      const stringToClass: { [key: string]: string } = {
        'Cash': 'badge-success',
        'Credit Card': 'badge-primary',
        'Wallet': 'badge-info',
        'Insurance': 'badge-warning',
        'Other': 'badge-secondary'
      };
      return stringToClass[paymentMethod] || 'badge-secondary';
    }
    
    // If it's a PaymentMethod enum value, use the enum mapping
    const classes: { [key in PaymentMethod]: string } = {
      [PaymentMethod.Cash]: 'badge-success',
      [PaymentMethod.CreditCard]: 'badge-primary',
      [PaymentMethod.Wallet]: 'badge-info',
      [PaymentMethod.Insurance]: 'badge-warning',
      [PaymentMethod.Other]: 'badge-secondary'
    };
    return classes[paymentMethod] || 'badge-secondary';
  }

  getPaymentMethodText(paymentMethod: PaymentMethod | string): string {
    // If it's already a string, return it directly
    if (typeof paymentMethod === 'string') {
      return paymentMethod;
    }
    
    // If it's a PaymentMethod enum value, convert it to text
    const texts: { [key in PaymentMethod]: string } = {
      [PaymentMethod.Cash]: 'Cash',
      [PaymentMethod.CreditCard]: 'Credit Card',
      [PaymentMethod.Wallet]: 'Wallet',
      [PaymentMethod.Insurance]: 'Insurance',
      [PaymentMethod.Other]: 'Other'
    };
    return texts[paymentMethod] || 'Unknown';
  }

  getPaymentStatusClass(isPaid: boolean): string {
    return isPaid ? 'badge-success' : 'badge-danger';
  }

  getPaymentStatusText(isPaid: boolean): string {
    return isPaid ? 'Paid' : 'Unpaid';
  }

  formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
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