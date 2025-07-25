import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MedicalhistoryService } from '../../../services/patients/medicalhistory.service';
import { PatientService } from '../../../services/patients/patient.service';
import { MedicalHistory, CreateMedicalHistoryDTO, UpdateMedicalHistoryDTO } from '../../../Interfaces/patient/patients/medicalhistory';
import { PatientDto } from '../../../Interfaces/patient/patients/patient';

@Component({
  selector: 'app-medical-history',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './medical-history.component.html',
  styleUrls: ['./medical-history.component.css']
})
export class MedicalHistoryComponent implements OnInit {
  // Basic properties
  patientId!: number;
  appointmentId: number | null = null;
  cameFromAppointment = false;
  patient: PatientDto | null = null;
  
  // Data properties
  medicalHistories: MedicalHistory[] = [];
  filteredHistories: MedicalHistory[] = [];
  paginatedHistories: MedicalHistory[] = [];
  
  // Search and filter properties
  searchTerm: string = '';
  selectedDateRange: string = 'all';
  
  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalItems: number = 0;
  totalPages: number = 0;
  
  // Form and UI properties
  medicalHistoryForm: FormGroup;
  loading = false;
  error: string | null = null;
  success: string | null = null;
  showAddForm = false;
  editingHistory: MedicalHistory | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private medicalHistoryService: MedicalhistoryService,
    private patientService: PatientService
  ) {
    this.medicalHistoryForm = this.fb.group({
      allergies: this.fb.array([]),
      chronicDiseases: this.fb.array([]),
      surgeries: this.fb.array([]),
      familyHistory: ['', Validators.required],
      medications: this.fb.array([]),
      notes: ['', Validators.required]
    });
  }

  // Getters for form arrays
  get allergiesFormArray(): FormArray {
    return this.medicalHistoryForm.get('allergies') as FormArray;
  }

  get chronicDiseasesFormArray(): FormArray {
    return this.medicalHistoryForm.get('chronicDiseases') as FormArray;
  }

  get surgeriesFormArray(): FormArray {
    return this.medicalHistoryForm.get('surgeries') as FormArray;
  }

  get medicationsFormArray(): FormArray {
    return this.medicalHistoryForm.get('medications') as FormArray;
  }

  ngOnInit() {
    this.patientId = +this.route.snapshot.params['id'];
    
    // Check if we came from an appointment (appointmentId passed as query parameter)
    const appointmentId = this.route.snapshot.queryParams['appointmentId'];
    if (appointmentId) {
      this.appointmentId = +appointmentId;
      this.cameFromAppointment = true;
    }
    
    this.loadPatientDetails();
    this.loadMedicalHistories();
  }

  loadPatientDetails() {
    this.patientService.getPatientById(this.patientId).subscribe({
      next: (patient: PatientDto) => {
        this.patient = patient;
      },
      error: (err) => {
        console.error('Failed to load patient details:', err);
        this.error = 'Failed to load patient details';
      }
    });
  }

  loadMedicalHistories() {
    this.loading = true;
    this.medicalHistoryService.getMedicalHistoryByPatientId(this.patientId).subscribe({
      next: (histories: MedicalHistory[]) => {
        this.medicalHistories = histories;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load medical histories:', err);
        this.error = 'Failed to load medical histories';
        this.loading = false;
      }
    });
  }

  // Search and filter methods
  applyFilters(): void {
    let filtered = [...this.medicalHistories];

    // Apply text search
    if (this.searchTerm.trim()) {
      filtered = filtered.filter(history =>
        history.familyHistory.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        history.notes.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        history.allergies?.some(allergy => allergy.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        history.chronicDiseases?.some(disease => disease.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        history.surgeries?.some(surgery => surgery.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        history.medications?.some(medication => medication.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    }

    // Apply date range filter
    if (this.selectedDateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (this.selectedDateRange) {
        case '30days':
          filterDate.setDate(now.getDate() - 30);
          break;
        case '6months':
          filterDate.setMonth(now.getMonth() - 6);
          break;
        case '1year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(history => new Date(history.recordDate) >= filterDate);
    }

    this.filteredHistories = filtered;
    this.totalItems = filtered.length;
    this.calculatePagination();
    this.updatePaginatedHistories();
  }

  search(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedDateRange = 'all';
    this.currentPage = 1;
    this.applyFilters();
  }

  // Pagination methods
  calculatePagination(): void {
    const itemsPerPage = Number(this.itemsPerPage);
    
    if (isNaN(itemsPerPage) || itemsPerPage <= 0) {
      console.error('Invalid itemsPerPage in calculatePagination:', this.itemsPerPage);
      this.itemsPerPage = 5;
      this.totalPages = Math.ceil(this.totalItems / 5);
    } else {
      this.totalPages = Math.ceil(this.totalItems / itemsPerPage);
    }
    
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
  }

  updatePaginatedHistories(): void {
    const itemsPerPage = Number(this.itemsPerPage);
    const currentPage = Number(this.currentPage);
    
    if (isNaN(itemsPerPage) || itemsPerPage <= 0) {
      console.error('Invalid itemsPerPage in updatePaginatedHistories:', this.itemsPerPage);
      return;
    }
    
    if (isNaN(currentPage) || currentPage <= 0) {
      console.error('Invalid currentPage in updatePaginatedHistories:', this.currentPage);
      return;
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    this.paginatedHistories = this.filteredHistories.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedHistories();
      this.scrollToTop();
    }
  }

  onItemsPerPageChange(): void {
    this.itemsPerPage = Number(this.itemsPerPage);
    
    if (isNaN(this.itemsPerPage) || this.itemsPerPage <= 0) {
      console.error('Invalid items per page value:', this.itemsPerPage);
      this.itemsPerPage = 5;
    }
    
    this.currentPage = 1;
    this.calculatePagination();
    this.updatePaginatedHistories();
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

  showAddMedicalHistoryForm() {
    this.showAddForm = true;
    this.editingHistory = null;
    this.resetForm();
  }

  editMedicalHistory(history: MedicalHistory) {
    this.showAddForm = true;
    this.editingHistory = history;
    this.populateForm(history);
  }

  private resetForm() {
    this.medicalHistoryForm.reset();
    this.clearFormArrays();
    this.addEmptyArrayItems();
  }

  private populateForm(history: MedicalHistory) {
    this.clearFormArrays();
    
    // Populate arrays
    if (history.allergies) {
      history.allergies.forEach(allergy => {
        this.allergiesFormArray.push(this.fb.control(allergy));
      });
    }
    
    if (history.chronicDiseases) {
      history.chronicDiseases.forEach(disease => {
        this.chronicDiseasesFormArray.push(this.fb.control(disease));
      });
    }
    
    if (history.surgeries) {
      history.surgeries.forEach(surgery => {
        this.surgeriesFormArray.push(this.fb.control(surgery));
      });
    }
    
    if (history.medications) {
      history.medications.forEach(medication => {
        this.medicationsFormArray.push(this.fb.control(medication));
      });
    }

    // Ensure at least one empty field for each array
    this.addEmptyArrayItems();

    // Populate other fields
    this.medicalHistoryForm.patchValue({
      familyHistory: history.familyHistory,
      notes: history.notes
    });
  }

  private clearFormArrays() {
    this.allergiesFormArray.clear();
    this.chronicDiseasesFormArray.clear();
    this.surgeriesFormArray.clear();
    this.medicationsFormArray.clear();
  }

  private addEmptyArrayItems() {
    if (this.allergiesFormArray.length === 0) {
      this.addAllergy();
    }
    if (this.chronicDiseasesFormArray.length === 0) {
      this.addChronicDisease();
    }
    if (this.surgeriesFormArray.length === 0) {
      this.addSurgery();
    }
    if (this.medicationsFormArray.length === 0) {
      this.addMedication();
    }
  }

  // Methods to add/remove array items
  addAllergy() {
    this.allergiesFormArray.push(this.fb.control(''));
  }

  removeAllergy(index: number) {
    this.allergiesFormArray.removeAt(index);
  }

  addChronicDisease() {
    this.chronicDiseasesFormArray.push(this.fb.control(''));
  }

  removeChronicDisease(index: number) {
    this.chronicDiseasesFormArray.removeAt(index);
  }

  addSurgery() {
    this.surgeriesFormArray.push(this.fb.control(''));
  }

  removeSurgery(index: number) {
    this.surgeriesFormArray.removeAt(index);
  }

  addMedication() {
    this.medicationsFormArray.push(this.fb.control(''));
  }

  removeMedication(index: number) {
    this.medicationsFormArray.removeAt(index);
  }

  saveMedicalHistory() {
    if (this.medicalHistoryForm.invalid) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    const formValue = this.medicalHistoryForm.value;

    // Filter out empty values from arrays
    const allergies = formValue.allergies.filter((item: string) => item.trim() !== '');
    const chronicDiseases = formValue.chronicDiseases.filter((item: string) => item.trim() !== '');
    const surgeries = formValue.surgeries.filter((item: string) => item.trim() !== '');
    const medications = formValue.medications.filter((item: string) => item.trim() !== '');

    if (this.editingHistory) {
      // Update existing medical history
      const updateData: UpdateMedicalHistoryDTO = {
        allergies: allergies.length > 0 ? allergies : undefined,
        chronicDiseases: chronicDiseases.length > 0 ? chronicDiseases : undefined,
        surgeries: surgeries.length > 0 ? surgeries : undefined,
        familyHistory: formValue.familyHistory,
        medications: medications.length > 0 ? medications : undefined,
        notes: formValue.notes
      };

      this.medicalHistoryService.updateMedicalHistory(this.editingHistory.id, updateData).subscribe({
        next: () => {
          this.success = 'Medical history updated successfully';
          this.loading = false;
          this.showAddForm = false;
          this.loadMedicalHistories();
        },
        error: (err) => {
          console.error('Failed to update medical history:', err);
          this.error = `Failed to update medical history: ${err.error?.message || err.message || 'Unknown error'}`;
          this.loading = false;
        }
      });
    } else {
      // Create new medical history
      const createData: CreateMedicalHistoryDTO = {
        patientId: this.patientId,
        allergies: allergies.length > 0 ? allergies : undefined,
        chronicDiseases: chronicDiseases.length > 0 ? chronicDiseases : undefined,
        surgeries: surgeries.length > 0 ? surgeries : undefined,
        familyHistory: formValue.familyHistory,
        medications: medications.length > 0 ? medications : undefined,
        notes: formValue.notes
      };

      this.medicalHistoryService.addMedicalHistory(createData).subscribe({
        next: () => {
          this.success = 'Medical history created successfully';
          this.loading = false;
          this.showAddForm = false;
          this.loadMedicalHistories();
        },
        error: (err) => {
          console.error('Failed to create medical history:', err);
          this.error = `Failed to create medical history: ${err.error?.message || err.message || 'Unknown error'}`;
          this.loading = false;
        }
      });
    }
  }

  cancelForm() {
    this.showAddForm = false;
    this.editingHistory = null;
    this.resetForm();
  }

  goBack() {
    if (this.cameFromAppointment && this.appointmentId) {
      this.router.navigate(['/appointment-details', this.appointmentId]);
    } else {
      this.router.navigate(['/admin/patients']);
    }
  }

  goToPatientProfile(): void {
    this.router.navigate(['/patient-profile', this.patientId]);
  }

  clearMessages() {
    this.error = null;
    this.success = null;
  }

  calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
} 