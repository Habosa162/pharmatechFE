import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { PatientService } from '../../../services/patients/patient.service';
import { DepartmentService } from '../../../services/clinics/department.service';
import { CreatePatient, PatientDto } from '../../../Interfaces/patient/patients/patient';
import { DepartmentViewDTO } from '../../../Interfaces/all';
import { Gender } from '../../../Interfaces/all';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.css'
})
export class PatientListComponent implements OnInit {
  patients: PatientDto[] = [];
  filteredPatients: PatientDto[] = [];
  departments: DepartmentViewDTO[] = [];
  searchTerm: string = '';
  selectedDepartment: number | null = null;
  showModal: boolean = false; 
   submitted: boolean = false;
 formErrors: { [key: string]: string } = {};

@ViewChild('patientForm') patientForm!: NgForm;
  newPatient: CreatePatient = {
    name: '',
    phoneNumber: '',
    dateofBirth: '',
    gender: Gender.male
  };

  constructor(
    private patientService: PatientService,
    private departmentService: DepartmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPatients();
    this.loadDepartments();
  }

  loadPatients(): void {
    this.patientService.getAllPatients().subscribe({
      next: (data) => {
        this.patients = data;
        this.filteredPatients = data;
      },
      error: (err) => {
        console.error('Error fetching patients:', err);
      }
    });
  }

  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (data) => {
        this.departments = data;
      },
      error: (err) => {
        console.error('Error fetching departments:', err);
      }
    });
  }

  search(): void {
    this.filteredPatients = this.patients.filter(patient =>
      patient.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  calculateAge(dateOfBirth: string): number {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  viewDetails(patientId: number): void {
    this.router.navigate(['/patient', patientId]);
  }

  editPatient(patientId: number): void {
    this.router.navigate(['/patient/edit', patientId]);
  }


openModal(): void {
    this.showModal = true;
    this.submitted = false;
    this.newPatient = {
      name: '',
      phoneNumber: '',
      dateofBirth: '',
      gender: Gender.male
    };
    if (this.patientForm) {
      this.patientForm.resetForm();
    }
  }

  
  closeModal(): void {
    this.showModal = false;
    this.formErrors = {};
  }

  validateForm(): boolean {
    this.formErrors = {};
    let isValid = true;

    // Validate name (only letters and spaces)
    if (!/^[A-Za-z\s]+$/.test(this.newPatient.name.trim())) {
      this.formErrors['name'] = 'Name should only contain letters and spaces';
      isValid = false;
    }

    // Validate phone number (only numbers, 10-12 digits)
    if (!/^\d{10,12}$/.test(this.newPatient.phoneNumber)) {
      this.formErrors['phoneNumber'] = 'Phone number should be 10-12 digits';
      isValid = false;
    }

    // Validate date of birth
    if (!this.newPatient.dateofBirth) {
      this.formErrors['dateofBirth'] = 'Date of birth is required';
      isValid = false;
    }

    return isValid;
  }

  createPatient(): void {
    this.submitted = true;
    
    if (this.patientForm.invalid) {
      return;
    }

    this.patientService.addpatient(this.newPatient).subscribe({
      next: (response) => {
        this.loadPatients();
        this.closeModal();
      },
      error: (error) => {
        console.error('Error creating patient:', error);
      }
    });
  }

  getErrorMessage(fieldName: string, control: any): string {
    if (!control) return '';
    
    if (control.hasError('required')) {
      return `${fieldName} is required`;
    }
    if (control.hasError('pattern')) {
      switch(fieldName) {
        case 'Name':
          return 'Name should only contain letters and spaces';
        case 'Phone Number':
          return 'Phone number should be 10-12 digits';
        default:
          return 'Invalid format';
      }
    }
    return '';
  }


  getGenderName(gender: Gender): string {
    return Gender[gender].charAt(0).toUpperCase() + Gender[gender].slice(1);
  }
}