import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicalrecordService } from '../../../services/patients/medicalrecord.service';
import { PatientService } from '../../../services/patients/patient.service';
import { PatientlabtestsService } from '../../../services/patients/patientlabtests.service';
import { Allmedicalrecords } from '../../../Interfaces/patient/medicalrecords/medicalrecord';
import { PatientDto } from '../../../Interfaces/patient/patients/patient';

@Component({
  selector: 'app-patient-medical-records',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-medical-records.component.html',
  styleUrls: ['./patient-medical-records.component.css']
})
export class PatientMedicalRecordsComponent implements OnInit {
  patientId!: number;
  patient: PatientDto | null = null;
  medicalRecords: Allmedicalrecords[] = [];
  labTestsCount: number = 0;
  
  loading = false;
  error: string | null = null;

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 6; // 6 cards per page for good layout
  totalItems = 0;
  totalPages = 0;
  paginatedRecords: Allmedicalrecords[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private medicalRecordService: MedicalrecordService,
    private patientService: PatientService,
    private patientLabTestsService: PatientlabtestsService
  ) {}

  ngOnInit(): void {
    this.patientId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPatientInfo();
    this.loadMedicalRecords();
    this.loadLabTestsCount();
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

  loadLabTestsCount(): void {
    this.patientLabTestsService.getByPatientId(this.patientId).subscribe({
      next: (labTests) => {
        this.labTestsCount = labTests.length;
      },
      error: (err) => {
        console.error('Error loading lab tests count:', err);
        this.labTestsCount = 0;
      }
    });
  }

  loadMedicalRecords(): void {
    this.loading = true;
    this.error = null;

    this.medicalRecordService.getMedicalRecordsByPatientId(this.patientId).subscribe({
      next: (records) => {
        this.medicalRecords = records;
        this.totalItems = records.length;
        this.calculatePagination();
        this.updatePaginatedRecords();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading medical records:', err);
        this.error = 'Failed to load medical records';
        this.loading = false;
      }
    });
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
  }

  updatePaginatedRecords(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedRecords = this.medicalRecords.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedRecords();
      // Scroll to top of the records section
      this.scrollToTop();
    }
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
      // Show all pages if total pages is less than or equal to max visible
      for (let i = 1; i <= this.totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show pages around current page
      let startPage = Math.max(1, this.currentPage - 2);
      let endPage = Math.min(this.totalPages, this.currentPage + 2);

      // Adjust if we're near the beginning or end
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
    // Scroll to the records section
    const recordsSection = document.querySelector('.records-section');
    if (recordsSection) {
      recordsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  viewRecordDetails(recordId: number): void {
    this.router.navigate(['/medical-record-details', recordId]);
  }

  goBack(): void {
    this.router.navigate(['/patient-profile', this.patientId]);
  }

  goToPatientList(): void {
    this.router.navigate(['/admin/patients']);
  }

  getTotalPrescriptions(): number {
    return this.medicalRecords.reduce((total, record) => total + record.prescriptionsCount, 0);
  }

  getTotalLabTests(): number {
    return this.medicalRecords.reduce((total, record) => total + record.labtestsCount, 0);
  }

  getDateRange(): string {
    if (this.medicalRecords.length === 0) return 'N/A';
    
    const dates = this.medicalRecords.map(record => new Date(record.visitDate));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    if (minDate.getTime() === maxDate.getTime()) {
      return '1 day';
    }
    
    const diffTime = Math.abs(maxDate.getTime() - minDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  }
} 