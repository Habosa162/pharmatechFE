import { ChangeDetectorRef, Component } from '@angular/core';
import { CreateMedication, MedicationDto } from '../../../Interfaces/clinic/medications/medication';
import { CreateSurgery, SurgeryDto, UpdateSurgery } from '../../../Interfaces/patient/surgeries/surgery';
import { AddLabtest, LabtestDto, UpdateLabtest } from '../../../Interfaces/patient/labtests/labtest';
import { CreatePosition, PositionDto, UpdatePosition } from '../../../Interfaces/employee/positions/position';
import { MedicationService } from '../../../services/clinics/medication.service';
import { PositionService } from '../../../services/employees/position.service';
import { SurgeryService } from '../../../services/patients/surgery.service';
import { LabtestService } from '../../../services/patients/labtest.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule } from '@angular/forms';
import { DepartmentViewDTO } from '../../../Interfaces/all';

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
  // skills:Skill[]=[];
  // Form models
  newMedication: CreateMedication = { name: ''};
  updateMedicationModel: CreateMedication = { name: ''};

  newSurgery:CreateSurgery ={name:'', description:'', surgeryDate : new Date(), patientId: 0, doctorId: 0};
  updateSurgeryModel:UpdateSurgery ={name:'', description:'', surgeryDate : new Date(), patientId: 0, doctorId: 0};


  newPosition: CreatePosition = { name: '', departmentId: 0};
  updatePositionModel: UpdatePosition = {name: '', departmentId: 0 };


  newLabtest: AddLabtest = { name: '',result: '', testDate: new Date(), medicalRecordId: 0};
  updateLabtestModel: UpdateLabtest = { name: '', result: '', testDate: new Date()};

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
  constructor(
    private medicationService: MedicationService,
    private positionService: PositionService,
    private surgeryService: SurgeryService,
    // private httpClient: HttpClient,
    private cdr: ChangeDetectorRef,
    // private toastr: ToastrService,
    private labtestService: LabtestService
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  ngAfterViewChecked(): void {
    console.log('Change detection triggered', {
      showAddMedicationModal: this.showAddMedicationModal,
      showUpdateMedicationModal: this.showUpdateMedicationModal,
    });
  }
  loadAllData(): void {
    this.loadMedications();
    this.loadSurgeries();
    this.loadPositions();
    this.loadLabtests();
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
      case 'addLabTest':
        this.showAddLabtestModal = state;
        break;
      case 'updateLabTest':
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
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  addSurgery(): void {
    if (!this.newSurgery.name.trim()) {
      // this.toastr.error('Skill name is required');
      return;
    }

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

  selectSurgeryForUpdate(surgery: any): void {
    this.selectedSurgery = surgery;
    this.updateSurgeryModel = {name: surgery.name, description: surgery.description, surgeryDate: new Date(surgery.surgeryDate), patientId: surgery.patientId, doctorId: surgery.doctorId};
    this.toggleModal('updateSurgery', true);
  }


  // updateSurgery(): void {
  //   console.log(this.updateSurgeryModel);
  //   this.surgeryService.updateSurgery(this.updateSurgeryModel.id!,this.updateSurgeryModel).subscribe({
  //     next: () => {
  //       this.loadSurgeries();
  //       this.toggleModal('updateSurgery', false);
  //       this.selectedSurgery = null;
  //       // this.toastr.success('surgery updated successfully');
  //     },
  //     error: (err) => {
  //       console.error('Error updating surgery:', err);
  //       alert('Failed to update surgery: ' + (err.message || 'Unknown error'));
  //     }
  //   });
  // }

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

  selectMedicationForUpdate(medication: any): void {
    this.selectedMedication = medication;
    this.updateMedicationModel = {name: medication.name};
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
        this.newMedication = { name: ''};
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

  // updateMedication(): void {
  //   this.medicationService.updateMedication(this.updateMedicationModel.id,this.updateMedicationModel).subscribe({
  //     next: () => {
  //       this.loadMedications();
  //       this.toggleModal('updateMedication', false);
  //       this.selectedMedication = null;
  //       // this.toastr.success('Medication updated successfully');
  //     },
  //     error: (err) => {
  //       console.error('Error updating medication:', err);
  //       // alert('Failed to update medication: ' + (err.message || 'Unknown error'));
  //     }
  //   });
  // }

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
    this.positionService.addPosition(this.newPosition).subscribe({
      next: () => {
        this.loadPositions();
        this.toggleModal('addPositions', false);
        this.newPosition = { name: '', departmentId: 0 };
        // this.toastr.success('Positiion added successfully');
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

  // updatePosition(): void {
  //   this.positionService.updatePosition(
  //     this.updatePositionModel.id,
  //     this.updatePositionModel
  //   ).subscribe({
  //     next: () => {
  //       this.loadPositions();
  //       this.toggleModal('updatePosition', false);
  //       this.selectedPosition = null;
  //       // this.toastr.success('position updated successfully');
  //     },
  //     error: (err) => {
  //       console.error('Error updating position:', err);
  //       alert('Failed to update position: ' + (err.message || 'Unknown error'));
  //     }
  //   });
  // }

  deletePosition(): void {
    // Using the subcategory service's API URL
    console.log('Deleting position with ID:', this.selectedPosition.id);
    this.positionService.deletePosition(this.selectedPosition.id).subscribe({
      next: (response) => {
        this.toggleModal('deletePositoin', false);
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
        this.newLabtest = { name: '', result: '', testDate: new Date(), medicalRecordId: 0 };
        // this.toastr.success('Labtest added successfully');
      },
      error: (err) => {
        alert('Failed to add labtest: ' + (err.message || 'Unknown error'));
      }
    });
  }

  selectLabtestForUpdate(labtest: UpdateLabtest): void {
    this.selectedLabtest = labtest;
    this.updateLabtestModel = {
      name: labtest.name,
      result: labtest.result,
      testDate: new Date(labtest.testDate) // Convert to Date object
    };
    this.toggleModal('updateLabtest', true);
  }

  // updateLabtest(): void {
  //   this.labtestService.updateLabtest(
  //     this.updateLabtestModel.id,
  //     this.updateLabtestModel
  //   ).subscribe({
  //     next: () => {
  //       this.loadLabtests();
  //       this.toggleModal('updatelabtests', false);
  //       this.selectedLabtest = null;
  //       // this.toastr.success('Subcategory updated successfully');
  //     },
  //     error: (err) => {
  //       console.error('Error updating labtest:', err);
  //       alert('Failed to update labtest: ' + (err.message || 'Unknown error'));
  //     }
  //   });
  // }

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
    this.newMedication = { name: ''};
    this.toggleModal('addMedication', true);
  }

  openAddSurgeryModal(): void {
    this.newSurgery = { name: '', description: '', surgeryDate: new Date(), patientId: 0, doctorId: 0 };
    this.toggleModal('addSurgery', true);
  }

  openAddLabtestModal(): void {
    this.newLabtest = { name: '', result: '', testDate: new Date(), medicalRecordId: 0 };
    this.toggleModal('addLabtest', true);
  }

  openAddPositionModal(){
    this.newPosition = { name: '', departmentId: 0 };
    this.toggleModal('addPosition', true);
  }
  openUpdateMedicationModal(medication: CreateMedication): void {
    this.selectedMedication = medication;
    this.updateMedicationModel = { name: medication.name };
    this.toggleModal('updateMedication', true);
  }
  openUpdatePositionModal(position: UpdatePosition): void {
    this.selectedPosition = position;
    this.updatePositionModel = {name: position.name, departmentId: position.departmentId};
    this.toggleModal('updateposition', true);
  }

  openUpdateLabtestModal(labtest: UpdateLabtest): void {
    this.selectedLabtest = labtest;
    this.updateLabtestModel = {name: labtest.name, result: labtest.result, testDate: new Date(labtest.testDate)};
    this.toggleModal('updateLabtest', true);
  }

  openUpdateSurgeryModal(surgery: any): void {
    this.selectedSurgery = surgery;
    this.updateSurgeryModel = {name: surgery.name, description: surgery.description, surgeryDate: new Date(surgery.surgeryDate), patientId: surgery.patientId, doctorId: surgery.doctorId};
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




}
