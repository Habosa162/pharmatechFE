import { Component } from '@angular/core';
import { AppointmentService } from '../../../services/appintments/appointment.service';
import { Appointment, CreateAppointmentDTO } from '../../../Interfaces/all';

@Component({
  selector: 'app-appointment-list',
  imports: [],
  templateUrl: './appointment-list.component.html',
  styleUrl: './appointment-list.component.css'
})
export class AppointmentListComponent {
appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  // departments: DepartmentViewDTO[] = [];
  searchTerm: string = '';
  selectedDepartment: number | null = null;
  showModal: boolean = false;
   submitted: boolean = false;
 formErrors: { [key: string]: string } = {};

// @ViewChild('patientForm') patientForm!: NgForm;
//   newAppointment: CreateAppointmentDTO = {
//     patientId: 0,
//     appointmentDate: '',
//     notes: '',
//     doctorDepartmentId: 0
//   };

  constructor(private appointment:AppointmentService){}

  // ngOnInit() {
  //   this.appointment.getAppointments().subscribe({
  //     next: (data) => {
  //       this.appointments = data;
  //     },
  //     error: (error) => {
  //       console.error('Error fetching appointments:', error);
  //     }
  //   });
  // }
  // cancelAppointment(appointmentId: string) {
  //   this.appointment.cancelAppointment(appointmentId).subscribe({
  //     next: () => {
  //       this.appointments = this.appointments.filter(app => app.id !== appointmentId);
  //     },
  //     error: (error) => {
  //       console.error('Error cancelling appointment:', error);
  //     }
  //   });
  // }



}
