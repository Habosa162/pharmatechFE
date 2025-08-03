import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../enviroment';
import { AllInvoices, CreateInvoice, InvoiceDto, UpdateInvoice } from '../../Interfaces/appointment/invoices/invoice';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  private InvoiceEndPoint = `${environment.apiUrl}/Invoice`;

  constructor(private http: HttpClient) { }

  /**
   * Get all invoices
   */
  getAllInvoices(): Observable<AllInvoices[]> {
    return this.http.get<AllInvoices[]>(`${this.InvoiceEndPoint}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get invoice by ID
   */
  getInvoiceById(id: number): Observable<InvoiceDto> {
    return this.http.get<InvoiceDto>(`${this.InvoiceEndPoint}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get invoices by patient ID
   */
  getInvoicesByPatientId(patientId: number): Observable<AllInvoices[]> {
    return this.http.get<AllInvoices[]>(`${this.InvoiceEndPoint}/patient/${patientId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get invoices by clinic ID
   */
  getInvoicesByClinicId(clinicId: number): Observable<AllInvoices[]> {
    return this.http.get<AllInvoices[]>(`${this.InvoiceEndPoint}/clinic/${clinicId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get invoices by date range
   */
  getInvoicesByDateRange(startDate: Date, endDate: Date): Observable<AllInvoices[]> {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    return this.http.get<AllInvoices[]>(`${this.InvoiceEndPoint}/dateRange/${startDateStr}/${endDateStr}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Create new invoice
   */
  addInvoice(invoice: CreateInvoice): Observable<any> {
    console.log('Sending create invoice request with data:', invoice);
    console.log('Request data type:', typeof invoice);
    // console.log('Payment method in request:', invoice.invoiceDTO?.paymentMethod, 'Type:', typeof invoice.invoiceDTO?.paymentMethod);
    
    return this.http.post(`${this.InvoiceEndPoint}`, invoice)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Update existing invoice
   */
  updateInvoice(id: number, invoice: any): Observable<any> {
    console.log('Sending update invoice request for ID:', id);
    console.log('Update data:', invoice);
    console.log('Update data payment method:', invoice.paymentMethod, 'Type:', typeof invoice.paymentMethod);
    
    return this.http.put(`${this.InvoiceEndPoint}/${id}`, invoice)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Delete invoice
   */
  deleteInvoice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.InvoiceEndPoint}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get invoices by date range and patient ID
   */
  getInvoicesByDateRangeAndPatientId(startDate: Date, endDate: Date, patientId: number): Observable<AllInvoices[]> {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    return this.http.get<AllInvoices[]>(`${this.InvoiceEndPoint}/dateRange/${startDateStr}/${endDateStr}/patient/${patientId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get invoices by date range and clinic ID
   */
  getInvoicesByDateRangeAndClinicId(startDate: Date, endDate: Date, clinicId: number): Observable<AllInvoices[]> {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    return this.http.get<AllInvoices[]>(`${this.InvoiceEndPoint}/dateRange/${startDateStr}/${endDateStr}/clinic/${clinicId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get unpaid invoices
   */
  getUnpaidInvoices(): Observable<AllInvoices[]> {
    return this.http.get<AllInvoices[]>(`${this.InvoiceEndPoint}/unpaid`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get paid invoices
   */
  getPaidInvoices(): Observable<AllInvoices[]> {
    return this.http.get<AllInvoices[]>(`${this.InvoiceEndPoint}/paid`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get invoice statistics
   */
  getInvoiceStatistics(): Observable<any> {
    return this.http.get<any>(`${this.InvoiceEndPoint}/statistics`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Mark invoice as paid
   */
  markAsPaid(id: number): Observable<void> {
    return this.http.patch<void>(`${this.InvoiceEndPoint}/${id}/mark-paid`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get invoice by appointment ID
   */
  getInvoiceByAppointmentId(appointmentId: number): Observable<InvoiceDto> {
    return this.http.get<InvoiceDto>(`${this.InvoiceEndPoint}/appointment/${appointmentId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Export invoices to PDF
   */
  exportInvoicesToPdf(filters?: any): Observable<Blob> {
    return this.http.post(`${this.InvoiceEndPoint}/export-pdf`, filters, { responseType: 'blob' })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Export invoices to Excel
   */
  exportInvoicesToExcel(filters?: any): Observable<Blob> {
    return this.http.post(`${this.InvoiceEndPoint}/export-excel`, filters, { responseType: 'blob' })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
      // Log the full error response for debugging
      console.error('Full error response:', error);
      console.error('Error status:', error.status);
      console.error('Error statusText:', error.statusText);
      console.error('Error url:', error.url);
      console.error('Error error:', error.error);
      console.error('Error headers:', error.headers);
      
      // Extract validation errors if they exist
      if (error.error && error.error.errors) {
        console.error('Validation errors:', error.error.errors);
        const validationErrors = error.error.errors;
        const errorDetails = Object.keys(validationErrors).map(key => {
          return `${key}: ${validationErrors[key].join(', ')}`;
        }).join('\n');
        errorMessage = `Validation errors:\n${errorDetails}`;
      }
    }
    console.error('Invoice Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
