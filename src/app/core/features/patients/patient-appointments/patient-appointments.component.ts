import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../services/appintments/appointment.service';
import { AppointmentDetails, AppointmentStatus, CreateAppointmentDTO, DoctorDepartment, DoctorDepartmentViewDTO } from '../../../Interfaces/all';
import { DepartmentService } from '../../../services/clinics/department.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './patient-appointments.component.html',
  styleUrl: './patient-appointments.component.css'
})
export class PatientAppointmentsComponent implements OnInit {
  appointments: AppointmentDetails[] = [];
  patientId!: number;
  loading: boolean = true;
  error: string = '';



  showModal: boolean = false;
  appointmentForm!: FormGroup;
  doctordepartments: DoctorDepartmentViewDTO[] = [];
 
  AppointmentStatus = AppointmentStatus;





  doctorDepartments: DoctorDepartmentViewDTO[] = [];
  departments: { id: number, name: string }[] = [];
  doctorsByDepartment: { [key: number]: { id: number, name: string }[] } = {};
  selectedDepartmentId: number | null = null;
  constructor(
    private appointmentService: AppointmentService,
    private departmentService: DepartmentService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
  ) {}

    ngOnInit(): void {
    this.appointmentForm = this.fb.group({
      appointmentDate: ['', Validators.required],
      notes: [''],
      departmentId: ['', Validators.required],
      doctorId: ['', Validators.required]
      // doctorDepartmentId: ['', Validators.required]
    });

    this.patientId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAppointments();
    this.loadDoctorDepartments();

    // Subscribe to department changes
    this.appointmentForm.get('departmentId')?.valueChanges.subscribe(departmentId => {
      this.selectedDepartmentId = departmentId;
      this.appointmentForm.patchValue({ doctorId: '', doctorDepartmentId: '' });
    });

    // Subscribe to doctor changes
    this.appointmentForm.get('doctorId')?.valueChanges.subscribe(doctorId => {
      if (this.selectedDepartmentId && doctorId) {
        const doctorDepartment = this.doctorDepartments.find(
          dd => dd.departmentId === this.selectedDepartmentId && dd.doctorId === doctorId
        );
        if (doctorDepartment) {
          this.appointmentForm.patchValue({ doctorDepartmentId: doctorDepartment.id }, { emitEvent: false });
        }
      }
    });
  }


  loadDoctorDepartments(): void {
    this.departmentService.getDoctorDepartments().subscribe({
      next: (data) => {
        this.doctorDepartments = data;
        
        // Extract unique departments
        const departmentsMap = new Map<number, string>();
        data.forEach(dd => departmentsMap.set(dd.departmentId, dd.departmentName));
        this.departments = Array.from(departmentsMap).map(([id, name]) => ({ id, name }));

        // Group doctors by department
        this.doctorsByDepartment = data.reduce((acc, dd) => {
          if (!acc[dd.departmentId]) {
            acc[dd.departmentId] = [];
          }
          if (!acc[dd.departmentId].some(d => d.id === dd.doctorId)) {
            acc[dd.departmentId].push({ id: dd.doctorId, name: dd.doctorName });
          }
          return acc;
        }, {} as { [key: number]: { id: number, name: string }[] });
      },
      error: (error) => {
        console.error('Error loading doctor departments:', error);
        this.error = 'Failed to load departments and doctors';
      }
    });
  }

  // ... existing methods ...

  getAvailableDoctors(): { id: number, name: string }[] {
    return this.selectedDepartmentId ? (this.doctorsByDepartment[this.selectedDepartmentId] || []) : [];
  }

  loadAppointments(): void {
    this.loading = true;
    this.appointmentService.getPatientAppointments(this.patientId).subscribe({
      next: (data) => {
        this.appointments = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load appointments';
        this.loading = false;
        console.error('Error loading appointments:', error);
      }
    });
  }
loadDepartments(): void {
    this.departmentService.getDoctorDepartments().subscribe({
      next: (data) => {
        this.doctordepartments = data;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
      }
    });
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.appointmentForm.reset();
  }

  createAppointment(): void {
    if (this.appointmentForm.valid) {
            const formValue = this.appointmentForm.value;
            const doctorDepartment = this.doctorDepartments.find(d => 
        d.departmentId == formValue.departmentId && 
        d.doctorId == formValue.doctorId
      );

      if (!doctorDepartment) {
        this.error = 'Selected doctor is not available in the selected department';
        return;
      }
      const appointmentData: CreateAppointmentDTO = {
       appointmentDate: formValue.appointmentDate,
        notes: formValue.notes,
        doctorDepartmentId: doctorDepartment.id,
        patientId: this.patientId
      };

      this.appointmentService.createAppointment(appointmentData).subscribe({
        next: () => {
          this.loadAppointments();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating appointment:', error);
          this.error = 'Failed to create appointment';
        }
      });
    }
  }

  getStatusName(status: AppointmentStatus): string {
    return AppointmentStatus[status];
  }



  getStatusClass(status: string): string {
    switch (status) {
      case 'Scheduled': return 'badge bg-warning';
      case 'Completed': return 'badge bg-success';
      case 'Cancelled': return 'badge bg-danger';
      case 'NoShow': return 'badge bg-secondary';
      default: return 'badge bg-primary';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }
}