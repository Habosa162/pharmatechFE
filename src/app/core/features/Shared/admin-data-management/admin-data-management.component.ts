import { ChangeDetectorRef, Component } from '@angular/core';
import { CreateMedication, MedicationDto } from '../../../Interfaces/clinic/medications/medication';
import { CreateSurgery, SurgeryDto, UpdateSurgery } from '../../../Interfaces/patient/surgeries/surgery';
import { AddLabtest, LabtestDto, UpdateLabtest } from '../../../Interfaces/patient/labtests/labtest';
import { CreatePosition, PositionDto, UpdatePosition } from '../../../Interfaces/employee/positions/position';
import { MedicationService } from '../../../services/clinics/medication.service';
import { PositionService } from '../../../services/employees/position.service';
import { SurgeryService } from '../../../services/patients/surgery.service';
import { LabtestService } from '../../../services/clinics/labtest.service';
import { DepartmentService } from '../../../services/clinics/department.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule } from '@angular/forms';
import { DepartmentViewDTO, DoctorViewDTO } from '../../../Interfaces/all';
// import { PatientDto } from '../../../Interfaces/patient/patient';
import { PatientService } from '../../../services/patients/patient.service';
// import { DoctorViewDTO } from '../../../Interfaces/employee/doctor';
// import { DoctorService } from '../../../services/employees/doctor.service';
import { AccountService } from '../../../services/account.service';
import { PatientDto } from '../../../Interfaces/patient/patients/patient';

@Component({
  selector: 'app-admin-data-management',
  imports: [CommonModule,FormsModule],
  templateUrl: './admin-data-management.component.html',
  styleUrl: './admin-data-management.component.css'
})
export class AdminDataManagementComponent {
medications: MedicationDto[] = [];
  surgeries: SurgeryDto[] = [];
  labtests: LabtestDto[] = [];
  positions:PositionDto[] = [];
  departments:DepartmentViewDTO[] = [];
  updatedmedicationid:number=0;
  // skills:Skill[]=[];
  // Form models
  newMedication: CreateMedication = { name: '',concentration:''};
  updateMedicationModel: CreateMedication = { name: '', concentration:''};

  newSurgery:CreateSurgery ={name:'', description:'', surgeryDate : new Date(), patientId: 0, doctorId: 0};
  updateSurgeryModel:UpdateSurgery ={name:'', description:'', surgeryDate : new Date(), patientId: 0, doctorId: 0};


  newPosition: CreatePosition = { name: '', departmentId: 0};
  updatePositionModel: UpdatePosition = {name: '', departmentId: 0 };


  newLabtest: AddLabtest = { name: '',reference: ''};
  updateLabtestModel: UpdateLabtest = { name: '', reference: ''};

  // newCity: any = { name: '' };
  // updateCityModel: any = { id: 0, name: '' };

  // UI state
  activeTab: string = 'medications';
  selectedMedication: any = null;
  selectedSurgery: any = null;
  selectedPosition: any = null;
  selectedLabtest: any = null
  // selectedSkill: any=null;
  showAddMedicationModal: boolean = false;
  showUpdateMedicationModal: boolean = false;
  showDeleteMedicationModal: boolean = false;
  showAddSurgeryModal: boolean = false;
  showUpdateSurgeryModal: boolean = false;
  showDeleteSurgeryModal: boolean = false;
  showAddLabtestModal: boolean = false;
  showUpdateLabtestModal: boolean = false;
  showDeleteLabtestModal: boolean = false;
  showAddPositionModal: boolean = false;
  showUpdatePositionModal: boolean = false;
  showDeletePositionModal: boolean = false;
  
  // showAddCountryModal: boolean = false;
  // showUpdateCountryModal: boolean = false;
  // showDeleteCountryModal: boolean = false;
  patients: PatientDto[] = [];
  doctors: DoctorViewDTO[] = [];
  constructor(
    private medicationService: MedicationService,
    private positionService: PositionService,
    private surgeryService: SurgeryService,
    // private httpClient: HttpClient,
    private cdr: ChangeDetectorRef,
    // private toastr: ToastrService,
    private labtestService: LabtestService,
    private patientService: PatientService,
    private doctorService: AccountService,
    private departmentService: DepartmentService
  ) {}

  ngOnInit(): void {
    console.log('Component initializing...');
    this.loadAllData();
    this.loadPatients();
    this.loadDoctors();
    console.log('Component initialization complete');
  }

  ngAfterViewChecked(): void {
    console.log('Change detection triggered', {
      showAddMedicationModal: this.showAddMedicationModal,
      showUpdateMedicationModal: this.showUpdateMedicationModal,
    });
  }
  loadAllData(): void {
    console.log('Loading all data...');
    this.loadMedications();
    this.loadSurgeries();
    this.loadPositions();
    this.loadLabtests();
    this.loadDepartments();
    console.log('All data loading initiated');
    // this.loadSkills();
  }

  toggleModal(modalName: string, state: boolean): void {
    // Close all modals first if opening a modal
    if (state) {
      this.closeAllModals();
    }

    // Set the specific modal state
    switch (modalName) {
      case 'addMedication':
        this.showAddMedicationModal = state;
        break;
      case 'updateMedication':
        this.showUpdateMedicationModal = state;
        break;
      case 'deleteMedication':
        this.showDeleteMedicationModal = state;
        break;
        case 'addSurgery':
        this.showAddSurgeryModal = state;
        break;
      case 'updateSurgery':
        this.showUpdateSurgeryModal = state;
        break;
      case 'deleteSurgery':
        this.showDeleteSurgeryModal = state;
        break;
      case 'addLabtest':
        this.showAddLabtestModal = state;
        break;
      case 'updateLabtest':
        this.showUpdateLabtestModal = state;
        break;
      case 'deleteLabTest':
        this.showDeleteLabtestModal = state;
        break;
      case 'addPosition':
        this.showAddPositionModal = state;
        break;
      case 'updatePosition':
        this.showUpdatePositionModal = state;
        break;
      case 'deletePosition':
        this.showDeletePositionModal = state;
        break;
      // case 'addCountry':
      //   this.showAddCountryModal = state;
      //   break;
      // case 'updateCountry':
      //   this.showUpdateCountryModal = state;
      //   break;
      // case 'deleteCountry':
      //   this.showDeleteCountryModal = state;
      //   break;
    }


  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }


  // Category CRUD operations
  loadMedications(): void {
    this.medicationService.getAllMedications().subscribe({
      next: (data) => {
        this.medications = data;
        console.log(data,"allmedicationsuponloading")
      },
      error: (err) => {
        console.error('Error loading medications:', err);
      }
    });
  }
  loadSurgeries(): void {
    this.surgeryService.getAllSurgeries().subscribe({
      next: (data) => {
        this.surgeries = data;
        console.log("surgeries are here",data);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  addSurgery(): void {
    if (!this.newSurgery.name.trim() || !this.newSurgery.patientId || !this.newSurgery.doctorId) {
      return;
    }
    // surgeryDate is already a Date object
    this.surgeryService.addSurgery(this.newSurgery).subscribe({
      next: () => {
        this.loadSurgeries();
        this.toggleModal('addSurgery', false);
        this.newSurgery = { name: '', description: '', surgeryDate: new Date(), patientId: 0, doctorId: 0 };
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error adding Surgery:', err);
        alert('Failed to add Surgery: ' + (err.message || 'Unknown error'));
      },
      complete: () => {
        // this.toastr.success('Add Surgery operation completed');
      },
    });
  }

  selectSurgeryForUpdate(surgery: SurgeryDto): void {
    this.selectedSurgery = surgery;
    console.log(this.selectedSurgery,"this.selectedSurgery");
    console.log(surgery.patientId,"surgerysurgery");

    this.updateSurgeryModel = {
      name: surgery.name,
      description: surgery.description,
      surgeryDate: surgery.surgeryDate ? new Date(surgery.surgeryDate) : new Date(),
      patientId: surgery.patientId,
      doctorId: surgery.doctorId
    };
    console.log("updateSurgeryModel",this.updateSurgeryModel);
    this.toggleModal('updateSurgery', true);
  }


  updateSurgery(): void {
    if (!this.updateSurgeryModel.name.trim() || !this.updateSurgeryModel.patientId || !this.updateSurgeryModel.doctorId) {
       return;
     }
     // Convert string to Date if needed
     let surgeryDateValue: Date | undefined = undefined;
     if (typeof this.updateSurgeryModel.surgeryDate === 'string') {
       surgeryDateValue = new Date(this.updateSurgeryModel.surgeryDate);
     } else {
       surgeryDateValue = this.updateSurgeryModel.surgeryDate;
     }
     this.surgeryService.updateSurgery(this.selectedSurgery.id, {
       ...this.updateSurgeryModel,
       surgeryDate: surgeryDateValue
     }).subscribe({
       next: () => {
         this.loadSurgeries();
         this.toggleModal('updateSurgery', false);
         this.selectedSurgery = null;
         this.cdr.detectChanges();
       },
       error: (err) => {
         console.error('Error updating surgery:', err);
         alert('Failed to update surgery: ' + (err.message || 'Unknown error'));
       }
     });
  }

  selectSurgeryForDelete(surgery: any): void {
    this.selectedSurgery = surgery;
    this.toggleModal('deleteSurgery', true);
  }


  deleteSurgery(): void {
    console.log('Deleting surgery with ID:', this.selectedSurgery.id);
    this.surgeryService.deleteSurgery(this.selectedSurgery.id).subscribe({
      next: (response) => {

        this.toggleModal('deleteselectedSurgery', false);
        this.selectedSurgery = null;
        this.showDeleteSurgeryModal=false;
        this.loadSurgeries();
        this.cdr.detectChanges(); // Force change detection
        this.closeAllModals();
      },
      error: (err) => {
        console.error('Error deleting selected Surgery:', err);
      },
      complete: () => {
        // this.toastr.success('selectedSurgery deleted successfully');
      },
    });
  }

  selectMedicationForUpdate(id:number,medication: any): void {
    this.updatedmedicationid=id;
    console.log(this.updatedmedicationid,'medicationiduponinsert')
    this.selectedMedication = medication;
    this.updateMedicationModel = {name: medication.name,concentration:medication.concentration};
    this.toggleModal('updateMedication', true);
  }


  addMedication(): void {
    if (!this.newMedication.name.trim()) {
      // this.toastr.error('Medication name is required');
      return;
    }

    this.medicationService.addMedication(this.newMedication).subscribe({
      next: () => {

        this.loadMedications();
        this.toggleModal('addMedication', false);
        this.newMedication = { name: '',concentration:''};
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error adding medication:', err);
        alert('Failed to add medication: ' + (err.message || 'Unknown error'));
      },
      complete: () => {
        // this.toastr.success('Add medication operation completed');
      },
    });
  }

  updateMedication(): void {
    console.log(this.updatedmedicationid,this.updateMedicationModel,'updatingmedication');
    this.medicationService.updateMedication(this.updatedmedicationid,this.updateMedicationModel).subscribe({
      next: () => {
        this.toggleModal('updateMedication', false);
        this.selectedMedication = null;
        this.updatedmedicationid=0;
        this.closeAllModals();
        this.loadMedications();
        // this.toastr.success('Medication updated successfully');
      },
      error: (err) => {
        console.error('Error updating medication:', err);
        // alert('Failed to update medication: ' + (err.message || 'Unknown error'));
      }
    });
  }

  selectMedicationForDelete(medication: any): void {
    this.selectedMedication = medication;
    this.toggleModal('deleteMedication', true);
  }


  deleteMedication(): void {
    console.log('Deleting category with ID:', this.selectedMedication.id);
    this.medicationService.deleteMedication(this.selectedMedication.id).subscribe({
      next: (response) => {
        this.toggleModal('deleteMedication', false);
        this.selectedMedication = null;
        this.loadMedications();
        this.cdr.detectChanges(); // Force change detection
      },
      error: (err) => {
        console.error('Error deleting medication:', err);
      },
      complete: () => {
        // this.toastr.success('medication deleted successfully');
      },
    });
  }

  // Cities CRUD operations
  loadPositions(): void {
    this.positionService.getAllPositions().subscribe({
      next: (data) => {
        this.positions = data;
        console.log(data,'mypositionssss');
      },
      error: (err) => {
        console.error('Error loading positions:', err);
      }
    });
  }

  addPosition(): void {
    if (!this.newPosition.name.trim() || !this.newPosition.departmentId) {
      return;
    }
    
    this.positionService.addPosition(this.newPosition).subscribe({
      next: () => {
        this.loadPositions();
        this.toggleModal('addPosition', false);
        this.newPosition = { name: '', departmentId: 0 };
        this.cdr.detectChanges();
        // this.toastr.success('Position added successfully');
      },
      error: (err) => {
        alert('Failed to add position: ' + (err.message || 'Unknown error'));
      }
    });
  }

  selectPositionForUpdate(position: any): void {
    this.selectedPosition = position;
    this.updatePositionModel = {
      name: position.name,
      departmentId: position.departmentId
    };
    this.toggleModal('updatePosition', true);
  }

  updatePosition(): void {
    if (!this.updatePositionModel.name.trim() || !this.updatePositionModel.departmentId) {
      return;
    }
    
    this.positionService.updatePosition(
      this.selectedPosition.id,
      this.updatePositionModel
    ).subscribe({
      next: () => {
        this.loadPositions();
        this.toggleModal('updatePosition', false);
        this.selectedPosition = null;
        this.cdr.detectChanges();
        // this.toastr.success('position updated successfully');
      },
      error: (err) => {
        console.error('Error updating position:', err);
        alert('Failed to update position: ' + (err.message || 'Unknown error'));
      }
    });
  }

  deletePosition(): void {
    // Using the subcategory service's API URL
    console.log('Deleting position with ID:', this.selectedPosition.id);
    this.positionService.deletePosition(this.selectedPosition.id).subscribe({
      next: (response) => {
        this.toggleModal('deletePosition', false);
        this.selectedPosition = null;
        this.loadPositions();
        this.cdr.detectChanges(); // Force change detection
      },
      error: (err) => {
        console.error('Error deleting position:', err);
      },
      complete: () => {
        // this.toastr.success('position deleted successfully');
      },
    });
  }
  selectPositionForDelete(Position: any): void {
    this.selectedPosition = Position;
    this.toggleModal('deletePosition', true);
  }

  // SubCategory CRUD operations
  loadLabtests(): void {
    this.labtestService.getAllLabtests().subscribe({
      next: (data) => {
        this.labtests = data;
      },
      error: (err) => {
        console.error('Error loading labtests:', err);
      }
    });
  }

  addLabtest(): void {
    this.labtestService.addLabtest(this.newLabtest).subscribe({
      next: () => {
        this.loadLabtests();
        this.toggleModal('addLabtest', false);
        this.newLabtest = { name: '', reference: '' };
        // this.toastr.success('Labtest added successfully');
      },
      error: (err) => {
        alert('Failed to add labtest: ' + (err.message || 'Unknown error'));
      }
    });
  }

  selectLabtestForUpdate(id: number, labtest: UpdateLabtest): void {
    this.selectedLabtest = labtest;
    this.updatinglabtestid = id;
    this.updateLabtestModel = {
      name: labtest.name,
      reference: labtest.reference
    };
    this.toggleModal('updateLabtest', true);
  }
updatinglabtestid:number=0;
  updateLabtest(): void {
    this.labtestService.updateLabtest(
      this.updatinglabtestid,
      this.updateLabtestModel
    ).subscribe({
      next: () => {
        this.loadLabtests();
        this.toggleModal('updateLabtest', false);
        this.selectedLabtest = null;
        // this.toastr.success('Labtest updated successfully');
      },
      error: (err) => {
        console.error('Error updating labtest:', err);
        alert('Failed to update labtest: ' + (err.message || 'Unknown error'));
      }
    });
  }

  deleteLabtest(): void {
    // Using the subcategory service's API URL
    console.log('Deleting labtest with ID:', this.selectedLabtest.id);
    this.labtestService.deleteLabtest(this.selectedLabtest.id).subscribe({
      next: (response) => {
        this.toggleModal('deleteLabtest', false);
        this.selectedLabtest = null;
        this.loadLabtests();
        this.cdr.detectChanges(); // Force change detection
      },
      error: (err) => {
        console.error('Error deleting labtest:', err);
      },
      complete: () => {
        // this.toastr.success('labtest deleted successfully');
      },
    });
  }
  selectLabytestForDelete(labtest: any): void {
    this.selectedLabtest = labtest;
    this.toggleModal('deleteLabtest', true);
  }

  // Modal management
  // openAddSkillModal(): void {
  //   this.newSkill = { name: '' };
  //   this.toggleModal('addSkill', true);
  // }
  openAddMedicationModal(): void {
    this.newMedication = { name: '',concentration:''};
    this.toggleModal('addMedication', true);
  }

  openAddSurgeryModal(): void {
    this.newSurgery = { name: '', description: '', surgeryDate: new Date(), patientId: 0, doctorId: 0 };
    this.toggleModal('addSurgery', true);
  }

  openAddLabtestModal(): void {
    this.newLabtest = { name: '', reference: ''};
    this.toggleModal('addLabtest', true);
  }

  openAddPositionModal(){
    console.log('Opening add position modal, departments:', this.departments);
    this.newPosition = { name: '', departmentId: 0 };
    this.toggleModal('addPosition', true);
  }
  openUpdateMedicationModal(id:number,medication: CreateMedication): void {
    this.updatedmedicationid=id;
    this.selectedMedication = medication;
    this.updateMedicationModel = { name: medication.name,concentration:medication.concentration };
    this.toggleModal('updateMedication', true);
  }
  openUpdatePositionModal(position: UpdatePosition): void {
    this.selectedPosition = position;
    this.updatePositionModel = {name: position.name, departmentId: position.departmentId};
    this.toggleModal('updatePosition', true);
  }

  openUpdateLabtestModal(labtest: UpdateLabtest): void {
    this.selectedLabtest = labtest;
    this.updateLabtestModel = {name: labtest.name, reference: labtest.reference};
    this.toggleModal('updateLabtest', true);
  }

  openUpdateSurgeryModal(surgery: any): void {
    this.selectedSurgery = surgery;
    this.updateSurgeryModel = {name: surgery.name, description: surgery.description, surgeryDate: new Date(surgery.surgeryDate), patientId: surgery.patientId, doctorId: surgery.doctorId};
    console.log("updateSurgeryModel",this.updateSurgeryModel);
    this.toggleModal('updateSurgery', true);
  }

  closeAllModals(): void {
    this.showAddMedicationModal = false;
    this.showUpdateMedicationModal = false;
    this.showDeleteMedicationModal = false;
    this.showAddPositionModal = false;
    this.showUpdatePositionModal = false;
    this.showDeletePositionModal = false;
    this.showAddSurgeryModal = false;
    this.showUpdateSurgeryModal = false;
    this.showDeleteSurgeryModal = false;
    this.showAddLabtestModal = false;
    this.showUpdateLabtestModal = false;
    this.showDeleteLabtestModal = false;
    // this.showAddCountryModal = false;
    // this.showUpdateCountryModal = false;
    // this.showDeleteCountryModal = false;
  }

  // getMedicationName(medicationId: number): string {
  //   const medication = this.medications.find(c => c.id === medicationId);
  //   console.log(this.medications,'countrieeeeeeeeeeeeeeeeeeees')
  //   return medication ? medication.name : 'Unknown';
  // }

  // getCountryName(countryId: number): string {

  //   const country = this.countries.find(c => c.id === countryId);
  //   return country ? country.name : 'Unknown';
  // }

  loadPatients(): void {
    this.patientService.getAllPatients().subscribe({
      next: (data) => { this.patients = data; },
      error: (err) => { console.error('Error loading patients:', err); }
    });
  }

  loadDoctors(): void {
    this.doctorService.getAllDoctors().subscribe({
      next: (data) => { this.doctors = data; },
      error: (err) => { console.error('Error loading doctors:', err); }
    });
  }

  loadDepartments(): void {
    console.log('Loading departments...');
    this.departmentService.getAllDepartments().subscribe({
      next: (data) => {
        this.departments = data;
        console.log('Loaded departments:', data);
        console.log('Departments array length:', this.departments.length);
      },
      error: (err) => {
        console.error('Error loading departments:', err);
      }
    });
  }

  get updateSurgeryDateString(): string {
    if (!this.updateSurgeryModel.surgeryDate) return '';
    const d = new Date(this.updateSurgeryModel.surgeryDate);
    // Pad month and day with leading zeros
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }

  set updateSurgeryDateString(val: string) {
    this.updateSurgeryModel.surgeryDate = val ? new Date(val) : new Date();
  }


}
