import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrescriptionService } from '../../../services/patients/prescription.service';
import { PatientService } from '../../../services/patients/patient.service';
import { AllPrescriptions } from '../../../Interfaces/patient/prescriptions/prescription';
import { PatientDto } from '../../../Interfaces/patient/patients/patient';

@Component({
  selector: 'app-patient-prescriptions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-prescriptions.component.html',
  styleUrls: ['./patient-prescriptions.component.css']
})
export class PatientPrescriptionsComponent implements OnInit {
  patientId!: number;
  patient: PatientDto | null = null;
  prescriptions: AllPrescriptions[] = [];
  filteredPrescriptions: AllPrescriptions[] = [];
  
  loading = false;
  error: string | null = null;

  // Filter properties
  selectedYear: string = 'all';
  availableYears: string[] = [];

  // Pagination properties for each year
  yearPagination: { [year: string]: { currentPage: number, itemsPerPage: number } } = {};
  defaultItemsPerPage = 6; // 6 cards per page for good layout

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private prescriptionService: PrescriptionService,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.patientId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPatientInfo();
    this.loadPrescriptions();
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

  loadPrescriptions(): void {
    this.loading = true;
    this.error = null;

    this.prescriptionService.getPrescriptionsByPatientId(this.patientId).subscribe({
      next: (prescriptions) => {
        this.prescriptions = prescriptions;
        this.filteredPrescriptions = prescriptions;
        this.initializeFilters();
        this.initializePagination();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading prescriptions:', err);
        this.error = 'Failed to load prescriptions';
        this.loading = false;
      }
    });
  }

  initializeFilters(): void {
    // Get available years from prescriptions
    this.availableYears = this.getYearsSorted();
  }

  initializePagination(): void {
    // Initialize pagination for each year
    const years = this.getFilteredYearsSorted();
    const newPagination: { [year: string]: { currentPage: number, itemsPerPage: number } } = {};
    
    years.forEach(year => {
      // Preserve existing pagination settings if they exist, otherwise use defaults
      if (this.yearPagination[year]) {
        newPagination[year] = {
          currentPage: this.yearPagination[year].currentPage,
          itemsPerPage: this.yearPagination[year].itemsPerPage
        };
        
        // Validate that the current page doesn't exceed total pages after filtering
        const yearPrescriptions = this.getFilteredPrescriptionsByYear()[year] || [];
        const totalPages = Math.ceil(yearPrescriptions.length / newPagination[year].itemsPerPage);
        if (newPagination[year].currentPage > totalPages) {
          newPagination[year].currentPage = Math.max(1, totalPages);
        }
      } else {
        newPagination[year] = {
          currentPage: 1,
          itemsPerPage: this.defaultItemsPerPage
        };
      }
    });
    
    this.yearPagination = newPagination;
  }

  onYearFilterChange(): void {
    this.applyFilters();
    this.initializePagination(); // Reinitialize pagination after filtering
  }

  applyFilters(): void {
    let filtered = [...this.prescriptions];

    // Filter by year
    if (this.selectedYear !== 'all') {
      filtered = filtered.filter(prescription => {
        const prescriptionYear = new Date(prescription.prescriptionDate).getFullYear().toString();
        return prescriptionYear === this.selectedYear;
      });
    }

    this.filteredPrescriptions = filtered;
  }

  clearFilters(): void {
    this.selectedYear = 'all';
    this.filteredPrescriptions = [...this.prescriptions];
    this.initializePagination(); // Reinitialize pagination after clearing filters
  }

  // Pagination methods for each year
  getPaginatedPrescriptionsForYear(year: string): AllPrescriptions[] {
    const yearPrescriptions = this.getFilteredPrescriptionsByYear()[year] || [];
    const pagination = this.yearPagination[year];
    
    if (!pagination) {
      console.warn(`No pagination found for year ${year}, returning all prescriptions`);
      return yearPrescriptions;
    }

    // Ensure itemsPerPage is a valid number
    const itemsPerPage = Number(pagination.itemsPerPage);
    const currentPage = Number(pagination.currentPage);
    
    if (isNaN(itemsPerPage) || itemsPerPage <= 0) {
      console.error(`Invalid itemsPerPage for year ${year}:`, pagination.itemsPerPage);
      return yearPrescriptions;
    }

    if (isNaN(currentPage) || currentPage <= 0) {
      console.error(`Invalid currentPage for year ${year}:`, pagination.currentPage);
      return yearPrescriptions;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    const result = yearPrescriptions.slice(startIndex, endIndex);
    
    // Debug logging (can be removed in production)
    console.log(`Pagination for year ${year}:`, {
      totalPrescriptions: yearPrescriptions.length,
      currentPage,
      itemsPerPage,
      startIndex,
      endIndex,
      resultCount: result.length
    });
    
    return result;
  }

  getTotalPagesForYear(year: string): number {
    const yearPrescriptions = this.getFilteredPrescriptionsByYear()[year] || [];
    const pagination = this.yearPagination[year];
    
    if (!pagination) return 1;
    
    return Math.ceil(yearPrescriptions.length / pagination.itemsPerPage);
  }

  getCurrentPageForYear(year: string): number {
    return this.yearPagination[year]?.currentPage || 1;
  }

  onPageChangeForYear(year: string, page: number): void {
    const totalPages = this.getTotalPagesForYear(year);
    
    if (page >= 1 && page <= totalPages) {
      this.yearPagination[year].currentPage = page;
      // Scroll to the year section
      this.scrollToYearSection(year);
    }
  }

  goToFirstPageForYear(year: string): void {
    this.onPageChangeForYear(year, 1);
  }

  goToLastPageForYear(year: string): void {
    const totalPages = this.getTotalPagesForYear(year);
    this.onPageChangeForYear(year, totalPages);
  }

  goToPreviousPageForYear(year: string): void {
    const currentPage = this.getCurrentPageForYear(year);
    this.onPageChangeForYear(year, currentPage - 1);
  }

  goToNextPageForYear(year: string): void {
    const currentPage = this.getCurrentPageForYear(year);
    this.onPageChangeForYear(year, currentPage + 1);
  }

  getPageNumbersForYear(year: string): number[] {
    const totalPages = this.getTotalPagesForYear(year);
    const currentPage = this.getCurrentPageForYear(year);
    const pageNumbers: number[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than or equal to max visible
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show pages around current page
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      // Adjust if we're near the beginning or end
      if (currentPage <= 3) {
        endPage = Math.min(maxVisiblePages, totalPages);
      }
      if (currentPage > totalPages - 3) {
        startPage = Math.max(1, totalPages - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  }

  getStartIndexForYear(year: string): number {
    const pagination = this.yearPagination[year];
    if (!pagination) return 1;
    
    return (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
  }

  getEndIndexForYear(year: string): number {
    const yearPrescriptions = this.getFilteredPrescriptionsByYear()[year] || [];
    const pagination = this.yearPagination[year];
    
    if (!pagination) return yearPrescriptions.length;
    
    return Math.min(pagination.currentPage * pagination.itemsPerPage, yearPrescriptions.length);
  }

  scrollToYearSection(year: string): void {
    // Scroll to the specific year section
    const yearSection = document.querySelector(`#year-section-${year}`);
    if (yearSection) {
      yearSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  onItemsPerPageChangeForYear(year: string, newItemsPerPage: number | string): void {
    // Ensure we have a valid number
    const itemsPerPage = typeof newItemsPerPage === 'string' ? parseInt(newItemsPerPage, 10) : newItemsPerPage;
    
    if (isNaN(itemsPerPage) || itemsPerPage <= 0) {
      console.error('Invalid items per page value:', newItemsPerPage);
      return;
    }

    // Ensure the year pagination exists
    if (!this.yearPagination[year]) {
      this.yearPagination[year] = {
        currentPage: 1,
        itemsPerPage: this.defaultItemsPerPage
      };
    }

    this.yearPagination[year].itemsPerPage = itemsPerPage;
    this.yearPagination[year].currentPage = 1; // Reset to first page
    
    // Validate that the current page doesn't exceed total pages
    const totalPages = this.getTotalPagesForYear(year);
    if (this.yearPagination[year].currentPage > totalPages) {
      this.yearPagination[year].currentPage = Math.max(1, totalPages);
    }
  }

  getFilteredPrescriptionsByYear(): { [year: string]: AllPrescriptions[] } {
    const groupedPrescriptions: { [year: string]: AllPrescriptions[] } = {};
    
    this.filteredPrescriptions.forEach(prescription => {
      const year = new Date(prescription.prescriptionDate).getFullYear().toString();
      if (!groupedPrescriptions[year]) {
        groupedPrescriptions[year] = [];
      }
      groupedPrescriptions[year].push(prescription);
    });
    
    return groupedPrescriptions;
  }

  getFilteredYearsSorted(): string[] {
    return Object.keys(this.getFilteredPrescriptionsByYear()).sort((a, b) => parseInt(b) - parseInt(a));
  }

  getPrescriptionsByYear(): { [year: string]: AllPrescriptions[] } {
    const groupedPrescriptions: { [year: string]: AllPrescriptions[] } = {};
    
    this.prescriptions.forEach(prescription => {
      const year = new Date(prescription.prescriptionDate).getFullYear().toString();
      if (!groupedPrescriptions[year]) {
        groupedPrescriptions[year] = [];
      }
      groupedPrescriptions[year].push(prescription);
    });
    
    return groupedPrescriptions;
  }

  getYearsSorted(): string[] {
    return Object.keys(this.getPrescriptionsByYear()).sort((a, b) => parseInt(b) - parseInt(a));
  }

  getRecentPrescriptions(count: number = 5): AllPrescriptions[] {
    return this.filteredPrescriptions
      .sort((a, b) => new Date(b.prescriptionDate).getTime() - new Date(a.prescriptionDate).getTime())
      .slice(0, count);
  }

  getTotalMedications(): number {
    return this.filteredPrescriptions.reduce((total, prescription) => total + prescription.medications.length, 0);
  }

  getUniqueDoctors(): string[] {
    const doctors = this.filteredPrescriptions.map(p => p.doctorName);
    return [...new Set(doctors)];
  }

  getFilterStats(): { total: number, filtered: number, percentage: number } {
    const total = this.prescriptions.length;
    const filtered = this.filteredPrescriptions.length;
    const percentage = total > 0 ? Math.round((filtered / total) * 100) : 0;
    
    return { total, filtered, percentage };
  }

  goBack(): void {
    this.router.navigate(['/patient-profile', this.patientId]);
  }

  goToPatientList(): void {
    this.router.navigate(['/admin/patients']);
  }

  goToPrescriptionDetails(prescriptionId: number): void {
    this.router.navigate(['/prescriptions', prescriptionId], {
      queryParams: { patientId: this.patientId }
    });
  }
} 