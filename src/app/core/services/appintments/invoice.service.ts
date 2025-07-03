import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../enviroment';
import { AllInvoices, CreateInvoice, InvoiceDto, UpdateInvoice } from '../../Interfaces/appointment/invoices/invoice';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  private InvoiceEndPoint = `${environment.apiUrl}/Invoice`; // Replace with your actual endpoint
  constructor(private http :HttpClient) { }

  getAllInvoices(): Observable<AllInvoices[]> {
    return this.http.get<AllInvoices[]>(`${this.InvoiceEndPoint}`);
  }

  getInvoiceById(id: number): Observable<InvoiceDto> {
    return this.http.get<InvoiceDto>(`${this.InvoiceEndPoint}/${id}`);
  }

  getInvoicesByPatientId(patientId: number): Observable<AllInvoices[]> {
    return this.http.get<AllInvoices[]>(`${this.InvoiceEndPoint}/patient/${patientId}`);
  }

  getInvoicesByClinicId(clinicId: number): Observable<AllInvoices[]> {
    return this.http.get<AllInvoices[]>(`${this.InvoiceEndPoint}/clinic/${clinicId}`);
  }

  getInvoicesByDateRange(startDate: Date, endDate: Date): Observable<AllInvoices[]> {
    return this.http.get<AllInvoices[]>(`${this.InvoiceEndPoint}/dateRange/${startDate}/${endDate}`);
  }

  addInvoice(invoice: CreateInvoice): Observable<CreateInvoice> {
    return this.http.post<CreateInvoice>(`${this.InvoiceEndPoint}`, invoice);
  }

  updateInvoice(id: number, invoice: UpdateInvoice): Observable<UpdateInvoice> {
    return this.http.put<UpdateInvoice>(`${this.InvoiceEndPoint}/${id}`, invoice);
  }

  deleteInvoice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.InvoiceEndPoint}/${id}`);
  }

  getInvoicesByDateRangeAndPatientId(startDate: Date, endDate: Date, patientId: number): Observable<AllInvoices[]> {
    return this.http.get<AllInvoices[]>(`${this.InvoiceEndPoint}/dateRange/${startDate}/${endDate}/patient/${patientId}`);
  }

  getInvoicesByDateRangeAndClinicId(startDate: Date, endDate: Date, clinicId: number): Observable<AllInvoices[]> {
    return this.http.get<AllInvoices[]>(`${this.InvoiceEndPoint}/dateRange/${startDate}/${endDate}/clinic/${clinicId}`);
  }

}
