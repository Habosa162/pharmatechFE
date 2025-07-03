import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { PatientService } from '../../../services/patients/patient.service';
import { PatientDto } from '../../../Interfaces/patient/patients/patient';
import { Gender } from '../../../Interfaces/all';

@Component({
  selector: 'app-patient-list',
  imports: [RouterModule],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.css'
})
export class PatientListComponent implements OnInit {

  Allpatients:PatientDto[] = [];
  Searchedpatients:PatientDto[] = [];
  pat2:PatientDto = {
    name: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: Gender.male,
    surgeryCount: 0,
    medicalRecordsCount: 0,
    appointmentsCount: 0,
    clinicIds: []
  }
  constructor(
    private patient:PatientService,
    private router: Router) {

  };
  ngOnInit(): void {
    // You can initialize any additional logic here if needed
    this.patient.getPatientByPhoneNumber("7698689").subscribe({
      next: (data) => {
        this.Allpatients = data;
        this.Searchedpatients = data;
        console.log('Patients fetched successfully:', this.Allpatients);
      },
      error: (err) => {
        console.error('Error fetching patients:', err);
      }
    });
   }

   search(searched:string){
  this.Searchedpatients = this.Allpatients.filter(m=>m.name?.toLowerCase().includes(searched.toLowerCase()));
}

navigatetodetails(id:number) {
  this.router.navigateByUrl(`/patient/${id}`)
}

Update(id:number){
  this.router.navigateByUrl(`/updatepatient/${id}`)
}

  }
  // You can add methods here to handle patient list operations
  // For example, fetching patients from a service, handling search, etc.


