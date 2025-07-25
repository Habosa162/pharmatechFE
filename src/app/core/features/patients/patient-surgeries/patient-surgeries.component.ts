import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SurgeryService } from '../../../services/patients/surgery.service';
import { PatientService } from '../../../services/patients/patient.service';
import { SurgeryDto } from '../../../Interfaces/patient/surgeries/surgery';
import { PatientDto } from '../../../Interfaces/patient/patients/patient';

@Component({
  selector: 'app-patient-surgeries',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-surgeries.component.html',
  styleUrls: ['./patient-surgeries.component.css']
})
export class PatientSurgeriesComponent implements OnInit {
  patientId!: number;
  patient: PatientDto | null = null;
  surgeries: SurgeryDto[] = [];
  
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private surgeryService: SurgeryService,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.patientId = Number(this.route.snapshot.paramMap.get('id'));
    console.log(this.patientId, "asdsaodpjaspdojas")
    this.loadPatientInfo();
    this.loadSurgeries();
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

  loadSurgeries(): void {
    this.loading = true;
    this.error = null;

    this.surgeryService.getSurgeriesByPatientId(this.patientId).subscribe({
      next: (surgeries) => {
        this.surgeries = surgeries;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading surgeries:', err);
        this.error = 'Failed to load surgeries';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/patient-profile', this.patientId]);
  }

  goToPatientList(): void {
    this.router.navigate(['/admin/patients']);
  }

  getSurgeriesByYear(): { [year: string]: SurgeryDto[] } {
    const groupedSurgeries: { [year: string]: SurgeryDto[] } = {};
    
    this.surgeries.forEach(surgery => {
      if (surgery.surgeryDate) {
        const year = new Date(surgery.surgeryDate).getFullYear().toString();
        if (!groupedSurgeries[year]) {
          groupedSurgeries[year] = [];
        }
        groupedSurgeries[year].push(surgery);
      }
    });
    
    return groupedSurgeries;
  }

  getYearsSorted(): string[] {
    return Object.keys(this.getSurgeriesByYear()).sort((a, b) => parseInt(b) - parseInt(a));
  }

  getRecentSurgeries(count: number = 5): SurgeryDto[] {
    return this.surgeries
      .filter(s => s.surgeryDate)
      .sort((a, b) => new Date(b.surgeryDate!).getTime() - new Date(a.surgeryDate!).getTime())
      .slice(0, count);
  }
} 