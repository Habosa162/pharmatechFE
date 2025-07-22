import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../enviroment';
import { Observable } from 'rxjs';
import { AllPrescriptions, CreatePrescription, PrescriptionDto, PrescriptionResponse, UpdatePrescription } from '../../Interfaces/patient/prescriptions/prescription';

@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {

  private PrescriptionEndPoint = `${environment.apiUrl}/Prescription`; // Replace with your actual endpoint
  constructor(private http:HttpClient) { }

  getAllPrescriptions():Observable<AllPrescriptions[]> {
    return this.http.get<AllPrescriptions[]>(`${this.PrescriptionEndPoint}`);
  }

  getPrescriptionById(id: number): Observable<PrescriptionDto> {
    return this.http.get<PrescriptionDto>(`${this.PrescriptionEndPoint}/${id}`);
  }

  getPrescriptionsByPatientId(patientId: number): Observable<AllPrescriptions[]> {
    return this.http.get<AllPrescriptions[]>(`${this.PrescriptionEndPoint}/GetByPatientId/${patientId}`);
  }

  getPrescriptionsByPatientIdAndPrescriptionDate(patientId: number,prescriptionDate:Date): Observable<AllPrescriptions[]> {
    return this.http.get<AllPrescriptions[]>(`${this.PrescriptionEndPoint}/GetByPatientIdAndPrescriptionDate/${patientId}/${prescriptionDate}`);
  }


  getPrescriptionsByMedicalrecordId(medicalRecordId: number): Observable<AllPrescriptions[]> {
    return this.http.get<AllPrescriptions[]>(`${this.PrescriptionEndPoint}/GetByMedicaRecordId/${medicalRecordId}`);
  }

  getPrescriptionsByPatientName(patientname: string): Observable<AllPrescriptions[]> {
    return this.http.get<AllPrescriptions[]>(`${this.PrescriptionEndPoint}/GetByPatientName/${patientname}`);
  }

  GetprescriptionsByDateRangeandpatientid(startDate: Date, endDate: Date, patientId:number): Observable<AllPrescriptions[]> {
      return this.http.get<AllPrescriptions[]>(`${this.PrescriptionEndPoint}/DateRangeAndPatientId/${startDate}/${endDate}/${patientId}`);
    }

  GetprescriptionsByDateRange(startDate: Date, endDate: Date): Observable<AllPrescriptions[]> {
      return this.http.get<AllPrescriptions[]>(`${this.PrescriptionEndPoint}/DateRange/${startDate}/${endDate}`);
    }

  addPrescription(prescription: CreatePrescription): Observable<PrescriptionResponse> {
    return this.http.post<PrescriptionResponse>(`${this.PrescriptionEndPoint}`, prescription);
  }

  updatePrescription(id: number, prescription: UpdatePrescription): Observable<PrescriptionResponse> {
    return this.http.put<PrescriptionResponse>(`${this.PrescriptionEndPoint}/${id}`, prescription);
  }

  deletePrescription(id: number): Observable<void> {
    return this.http.delete<void>(`${this.PrescriptionEndPoint}/${id}`);
  }

}
