import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PrescriptionService } from '../../../../core/services/patients/prescription.service';
import { PatientService } from '../../../../core/services/patients/patient.service';
import { AllPrescriptions } from '../../../../core/Interfaces/patient/prescriptions/prescription';
import { PatientDto } from '../../../../core/Interfaces/patient/patients/patient';

@Component({
  selector: 'app-patient-prescriptions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [Location],
  templateUrl: './patient-prescriptions.component.html',
  styleUrl: './patient-prescriptions.component.css'
})
export class PatientPrescriptionsComponent implements OnInit {
  // Loading and error states
  loading: boolean = true;
  error: string | null = null;

  // Patient and prescriptions data
  patient: PatientDto | null = null;
  prescriptions: AllPrescriptions[] = [];
  filteredPrescriptions: AllPrescriptions[] = [];

  // Filtering
  selectedYear: string = 'all';
  selectedStatus: string = 'all';
  availableYears: number[] = [];

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 0;

  constructor(
    private prescriptionService: PrescriptionService,
    private patientService: PatientService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    const patientId = this.route.snapshot.params['id'];
    if (patientId) {
      this.loadPatientData(patientId);
      this.loadPrescriptions(patientId);
    }
  }

  private loadPatientData(patientId: number): void {
    this.patientService.getPatientById(patientId).subscribe({
      next: (patient) => {
        this.patient = patient;
      },
      error: (error) => {
        this.error = 'Failed to load patient data';
        console.error('Error loading patient:', error);
      }
    });
  }

  protected loadPrescriptions(patientId: number): void {
    this.loading = true;
    this.error = null;

    this.prescriptionService.getPrescriptionsByPatientId(patientId).subscribe({
      next: (prescriptions) => {
        this.prescriptions = prescriptions;
        this.extractAvailableYears();
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load prescriptions';
        this.loading = false;
        console.error('Error loading prescriptions:', error);
      }
    });
  }

  private extractAvailableYears(): void {
    const years = new Set(
      this.prescriptions.map(p => 
        new Date(p.prescriptionDate).getFullYear()
      )
    );
    this.availableYears = Array.from(years).sort((a, b) => b - a);
  }

  applyFilters(): void {
    this.filteredPrescriptions = this.prescriptions.filter(prescription => {
      const prescriptionYear = new Date(prescription.prescriptionDate).getFullYear();
      const yearMatch = this.selectedYear === 'all' || prescriptionYear === parseInt(this.selectedYear);
      
      return yearMatch;
    });

    this.totalPages = Math.ceil(this.filteredPrescriptions.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  onYearFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedYear = 'all';
    this.selectedStatus = 'all';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return this.selectedYear !== 'all' || this.selectedStatus !== 'all';
  }

  // Pagination methods
  getPaginatedPrescriptions(): AllPrescriptions[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredPrescriptions.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // Stats methods
  getTotalPrescriptions(): number {
    return this.prescriptions.length;
  }

  getActivePrescriptions(): number {
    const today = new Date();
    return this.prescriptions.filter(p => new Date(p.prescriptionDate) <= today).length;
  }

  getLastPrescriptionDate(): string | null {
    if (this.prescriptions.length === 0) return null;
    
    return this.prescriptions
      .sort((a, b) => new Date(b.prescriptionDate).getTime() - new Date(a.prescriptionDate).getTime())[0]
      .prescriptionDate;
  }

  // Navigation methods
  goBack(): void {
    this.location.back();
  }

  viewPrescription(prescriptionId: number): void {
    this.router.navigate(['/prescriptions', prescriptionId]);
  }
}
