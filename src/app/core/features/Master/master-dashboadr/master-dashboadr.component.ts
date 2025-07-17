import { Component, OnInit } from '@angular/core';
import { MedicationService } from '../../../services/clinics/medication.service';
import { CreateMedication, MedicationDto } from '../../../Interfaces/clinic/medications/medication';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CreatePosition, PositionDto } from '../../../Interfaces/employee/positions/position';
import { CreateSurgery, SurgeryDto } from '../../../Interfaces/patient/surgeries/surgery';
import { AddLabtest, LabtestDto } from '../../../Interfaces/patient/labtests/labtest';
import { PositionService } from '../../../services/employees/position.service';
import { SurgeryService } from '../../../services/patients/surgery.service';
// import { LabtestService } from '../../../services/patients/labtest.service';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../../services/patients/patient.service';
import { TransactionService } from '../../../services/transactions/transaction.service';
import { InvoiceService } from '../../../services/appintments/invoice.service';
import { LabtestService } from '../../../services/clinics/labtest.service';



@Component({
  selector: 'app-master-dashboadr',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './master-dashboadr.component.html',
  styleUrl: './master-dashboadr.component.css'
})
export class MasterDashboadrComponent implements OnInit {
  // Dashboard statistics
  totalMedications: number = 0;
  totalSurgeries: number = 0;
  totalLabTests: number = 0;
  totalPositions: number = 0;
  totalPatients: number = 0;
  totalTransactions: number = 0;
  totalInvoices: number = 0;
  totalRevenue: number = 0;

  // Lists for different entities
  medications: MedicationDto[] = [];
  surgeries: SurgeryDto[] = [];
  labTests: LabtestDto[] = [];
  positions: PositionDto[] = [];
  recentTransactions: any[] = [];
  recentInvoices: any[] = [];

  constructor(
    private medicationService: MedicationService,
    private surgeryService: SurgeryService,
    private labtestService: LabtestService,
    private positionService: PositionService,
    private patientService: PatientService,
    private transactionService: TransactionService,
    private invoiceService: InvoiceService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Load medications
    this.medicationService.getAllMedications().subscribe(data => {
      this.medications = data;
      this.totalMedications = data.length;
    });

    // Load surgeries
    this.surgeryService.getAllSurgeries().subscribe(data => {
      this.surgeries = data;
      this.totalSurgeries = data.length;
    });

    // Load lab tests
    this.labtestService.getAllLabtests().subscribe(data => {
      this.labTests = data;
      this.totalLabTests = data.length;
    });

    // Load positions
    this.positionService.getAllPositions().subscribe(data => {
      this.positions = data;
      this.totalPositions = data.length;
    });

    // Load patients count
    this.patientService.getAllPatients().subscribe(data => {
      this.totalPatients = data.length;
    });

    // Load transactions
    // this.transactionService.getRecentTransactions().subscribe(data => {
    //   this.recentTransactions = data;
    //   this.totalTransactions = data.length;
    //   this.totalRevenue = data.reduce((sum, transaction) => sum + transaction.amount, 0);
    // });

    // Load invoices
    this.invoiceService.getAllInvoices().subscribe(data => {
      this.recentInvoices = data;
      this.totalInvoices = data.length;
    });
  }
}
