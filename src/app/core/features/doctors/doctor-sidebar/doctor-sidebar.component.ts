import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../../../services/appintments/appointment.service';
import { PatientService } from '../../../services/patients/patient.service';
import { SurgeryService } from '../../../services/patients/surgery.service';
import { LabtestService } from '../../../services/clinics/labtest.service';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../../services/account.service';
// import { AppointmentService } from 'src/app/core/services/appintments/appointment.service';
// import { PatientService } from 'src/app/core/services/patients/patient.service';
// import { SurgeryService } from 'src/app/core/services/patients/surgery.service';
// import { LabtestService } from 'src/app/core/services/clinics/labtest.service';
// import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-doctor-sidebar',
  imports:[FormsModule,CommonModule],
  templateUrl: './doctor-sidebar.component.html',
  styleUrls: ['./doctor-sidebar.component.css']
})
export class DoctorSidebarComponent implements OnInit {
  activeTab: string = 'appointments';
  appointments: any[] = [];
  patients: any[] = [];
  surgeries: any[] = [];
  labtests: any[] = [];
  doctorId: number | null = null;
  userid:string|null="";
  constructor(
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private surgeryService: SurgeryService,
    private labtestService: LabtestService,
    private authService: AuthService,
    private accountservice:AccountService
  ) {}

  ngOnInit() {
    this.userid = this.authService.getUserId();
    if (!this.doctorId) {
    this.accountservice.getDoctoridByUserid(this.userid!).subscribe(
      {
      next :
      (data) => {
        console.log("data is",data);
      this.doctorId = data.doctorid;
      
      this.loadAppointments();
    }
  ,
  error: (err) => {
    console.error('Failed to fetch doctor ID:', err);
    // Optionally, show an error message to the user here
  }
}
  
    );

  }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'appointments') this.loadAppointments();
    if (tab === 'patients') this.loadPatients();
    if (tab === 'surgeries') this.loadSurgeries();
    if (tab === 'labtests') this.loadLabtests();
  }

  loadAppointments() {
    console.log(this.userid,this.doctorId,"aaaaaaaaaaaaaaaah");
    if (!this.userid) return;
    this.appointmentService.myappointments(this.userid).subscribe(data => this.appointments = data);
  }
  loadPatients() {
    if (!this.doctorId) return;
    this.patientService.getPatientsByDoctorId(Number(this.doctorId)).subscribe(data => this.patients = data);
  }
  loadSurgeries() {
    if (!this.doctorId) return;
    this.surgeryService.getSurgeriesByDoctorId(Number(this.doctorId)).subscribe(data => this.surgeries = data);
  }
  loadLabtests() {
    // No getLabtestsByDoctorId, so just show all for now or leave empty
    this.labtestService.getAllLabtests().subscribe(data => this.labtests = data);
  }
} 