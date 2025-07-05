import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Files, projectImages } from '../../../base/environment';
import { AppUser } from '../../../Interfaces/all';
import { AccountService } from '../../../services/account.service';
import { AuthService } from '../../../services/auth.service';
import { AdminDashboardComponent } from '../../dashboard/admin-dashboard/admin-dashboard.component';
import { AdminDataManagementComponent } from '../admin-data-management/admin-data-management.component';
import { AppointmentListComponent } from '../../appointments/appointment-list/appointment-list.component';
import { DoctorListComponent } from '../../doctors/doctor-list/doctor-list.component';
import { PatientListComponent } from '../../patients/patient-list/patient-list.component';
import { TransactionsListComponent } from '../../transactions/transactions-list/transactions-list.component';
import { TransactionsComponent } from '../../transactions/transactions/transactions.component';
import { InventoryCategoryComponent } from '../../inventory/inventory-category/inventory-category.component';
import { InventoryItemsComponent } from '../../inventory/inventory-items/inventory-items.component';
import { InventoryTransactionsComponent } from '../../inventory/inventory-transactions/inventory-transactions.component';
import { InvoiceListComponent } from '../../billing/invoice-list/invoice-list.component';
import { MasterDashboadrComponent } from '../../Master/master-dashboadr/master-dashboadr.component';


@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, AdminDashboardComponent , AdminDataManagementComponent,AppointmentListComponent,DoctorListComponent,PatientListComponent,TransactionsListComponent,InventoryCategoryComponent,InventoryItemsComponent,InventoryTransactionsComponent,InvoiceListComponent,MasterDashboadrComponent],
  templateUrl: './admin-navbar.component.html',
  styleUrl: './admin-navbar.component.css'
})
export class AdminNavbarComponent {
ngOnInit() {
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        this.activeTab = fragment;
      }
    });
    // this.loadCountries();
    // this.picturesurl=Files.filesUrl;
    // this.loadProfile();
    // this.initializeForm();
    // this.initializeskills();
    // this.initializeNonrecommendedskills();
    // // this.loadEducation();
    // this.initializeEducationForm();
    // this.initializeExperienceForm();
    // this.initProjectForm();
    // this.initCertificateForm();
    // this.initLanguageForm();

  }
constructor(private route: ActivatedRoute
    ,private router: Router
    ,private account:AccountService
    ,protected authService:AuthService
    ,private fb: FormBuilder
    // ,private toastr: ToastrService
    ,private cdr: ChangeDetectorRef
  ) {


  }

  activeTab: string = 'admin-dashboard';
   setActiveTab(tab: string) {
        this.activeTab = tab;
    }
    //#endregion
//#endregion

}
