import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceService } from '../../../services/appintments/invoice.service';
import { InvoiceDto } from '../../../Interfaces/appointment/invoices/invoice';
import { PaymentMethod } from '../../../Interfaces/all';

@Component({
  selector: 'app-invoice-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-details.component.html',
  styleUrl: './invoice-details.component.css'
})
export class InvoiceDetailsComponent implements OnInit {
  invoice: InvoiceDto | null = null;
  loading = false;
  downloading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService
  ) {}

  ngOnInit(): void {
    this.loadInvoiceDetails();
  }

  loadInvoiceDetails(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Invoice ID not provided';
      return;
    }

    this.loading = true;
    this.invoiceService.getInvoiceById(+id).subscribe({
      next: (invoice) => {
        this.invoice = invoice;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load invoice details: ' + err.message;
        this.loading = false;
      }
    });
  }

  backToList(): void {
    this.router.navigate(['/admin/invoices']);
  }

  editInvoice(): void {
    if (this.invoice) {
      this.router.navigate(['/admin/invoices/edit', this.invoice.id]);
    }
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

  printInvoice(): void {
    // Add a small delay to ensure print styles are applied
    setTimeout(() => {
      window.print();
    }, 100);
  }

  downloadInvoice(): void {
    if (!this.invoice) {
      console.error('No invoice data available for download');
      return;
    }

    this.downloading = true;

    // Import jsPDF dynamically
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF();
      
      // Set document properties
      doc.setProperties({
        title: `Invoice #${this.invoice!.id}`,
        subject: 'Medical Invoice',
        author: this.invoice!.clinicName,
        creator: 'PharmaTech System'
      });

      // Add header
      doc.setFontSize(24);
      doc.setTextColor(44, 62, 80);
      doc.text('INVOICE', 105, 30, { align: 'center' });
      
      // Add invoice number
      doc.setFontSize(16);
      doc.text(`Invoice #${this.invoice!.id}`, 105, 45, { align: 'center' });
      
      // Add clinic name
      doc.setFontSize(12);
      doc.setTextColor(108, 117, 125);
      doc.text(this.invoice!.clinicName, 105, 55, { align: 'center' });
      
      // Add date
      doc.text(`Date: ${this.formatDate(this.invoice!.createdAt)}`, 20, 75);
      
      // Add patient information
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Patient Information', 20, 95);
      doc.setFontSize(12);
      doc.setTextColor(108, 117, 125);
      doc.text(`Name: ${this.invoice!.patientName}`, 20, 105);
      doc.text(`Appointment ID: ${this.invoice!.appointmentId}`, 20, 115);
      
      // Add invoice details
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Invoice Details', 20, 140);
      
      // Create table for invoice details
      const startY = 150;
      const lineHeight = 10;
      let currentY = startY;
      
      // Table headers
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.setFillColor(102, 126, 234);
      doc.rect(20, currentY, 170, 8, 'F');
      doc.text('Description', 25, currentY + 6);
      doc.text('Amount', 150, currentY + 6);
      currentY += 8;
      
      // Table content
      doc.setTextColor(44, 62, 80);
      doc.setFillColor(248, 249, 250);
      doc.rect(20, currentY, 170, 8, 'F');
      doc.text('Medical Services', 25, currentY + 6);
      doc.text(this.formatCurrency(this.invoice!.totalAmount), 150, currentY + 6);
      currentY += 8;
      
      // Payment information
      currentY += 10;
      doc.setFontSize(12);
      doc.setTextColor(44, 62, 80);
      doc.text('Payment Information', 20, currentY);
      currentY += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(108, 117, 125);
      doc.text(`Total Amount: ${this.formatCurrency(this.invoice!.totalAmount)}`, 20, currentY);
      currentY += 8;
      doc.text(`Paid Amount: ${this.formatCurrency(this.invoice!.paidAmount)}`, 20, currentY);
      currentY += 8;
      doc.text(`Balance: ${this.formatCurrency(this.invoice!.totalAmount - this.invoice!.paidAmount)}`, 20, currentY);
      currentY += 8;
      doc.text(`Payment Method: ${this.getPaymentMethodText(this.invoice!.paymentMethod)}`, 20, currentY);
      currentY += 8;
      doc.text(`Status: ${this.getPaymentStatusText(this.invoice!.isPaid)}`, 20, currentY);
      
      // Add footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(10);
      doc.setTextColor(108, 117, 125);
      doc.text('Thank you for choosing our services', 105, pageHeight - 20, { align: 'center' });
      doc.text('Generated by PharmaTech System', 105, pageHeight - 15, { align: 'center' });
      
      // Save the PDF
      const fileName = `Invoice_${this.invoice!.id}_${this.invoice!.patientName.replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);
      
      this.downloading = false;
    }).catch(error => {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
      this.downloading = false;
    });
  }
} 