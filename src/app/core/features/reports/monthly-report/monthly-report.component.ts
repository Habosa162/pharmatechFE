import { Component, OnInit } from '@angular/core';
import { MonthlyReportDto, MONTH_NAMES, CategoryBreakdownDto } from '../../../Models/reports/monthly-report.models';
import { ReportsService } from '../../../services/reports/reports.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicService } from '../../../services/clinics/clinic.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-monthly-report',
  imports: [CommonModule, FormsModule],
  templateUrl: './monthly-report.component.html',
  styleUrl: './monthly-report.component.css'
})
export class MonthlyReportComponent implements OnInit {

  report: MonthlyReportDto | null = null;
  isLoadingData = false;
  isExporting   = false;
  errorMessage: string | null = null;

  LoggedInUser: any | null = null;
  clinics: any[] = [];
  isOwner = false;
  selectedClinicId: number | null = null; // ← track current clinic

  selectedMonth: number;
  selectedYear: number;
  months = MONTH_NAMES.map((label, i) => ({ label, value: i + 1 }));
  years  = Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - i);

  constructor(
    private reportService: ReportsService,
    private clinincService: ClinicService,
    private authService: AuthService,
  ) {
    const prev = new Date();
    prev.setMonth(prev.getMonth() - 1);
    this.selectedMonth = prev.getMonth() + 1;
    this.selectedYear  = prev.getFullYear();
  }

  ngOnInit(): void {
    this.LoggedInUser = this.authService.getDecodedToken();
    this.isOwner = this.LoggedInUser?.roles?.includes('Owner') ?? false;

    if (this.isOwner) {
      this.loadClinicsByOwner();
    } else {
      const clinicId = this.authService.getUserClinicId();
      if (clinicId) {
        this.selectedClinicId = clinicId[0];
        this.loadReport(clinicId[0]);
      }
    }
  }

  loadReport(clinicId: number): void {
    this.selectedClinicId = clinicId;
    this.isLoadingData = true;
    this.errorMessage  = null;
    this.report        = null;

    this.reportService
      .getReportData(clinicId, this.selectedMonth, this.selectedYear)
      .subscribe({
        next:  (data) => { this.report = data; this.isLoadingData = false; },
        error: ()     => { this.errorMessage = 'Failed to load report.'; this.isLoadingData = false; }
      });
  }

  // Called by the Generate button — reuses the currently selected clinic
  regenerateReport(): void {
    if (this.selectedClinicId) {
      this.loadReport(this.selectedClinicId);
    }
  }

  loadClinicsByOwner(): void {
    this.clinincService.getClinicsByOwner().subscribe({
      next: (data) => {
        this.clinics = data;
        if (this.clinics.length > 0) {
          this.loadReport(this.clinics[0].id);
        }
      },
      error: () => {
        this.errorMessage = 'Failed to load clinics.';
        this.isLoadingData = false;
      }
    });
  }

  onPickUpClinic(clinicId: number): void {
    this.loadReport(clinicId);
  }

  exportPdf(): void {
    if (!this.report) return;
    this.isExporting = true;
    setTimeout(() => {
      this.reportService.exportToPdf(this.report!);
      this.isExporting = false;
    }, 50);
  }

  get monthLabel(): string { return MONTH_NAMES[this.selectedMonth - 1]; }

  get netProfitClass(): string {
    return !this.report ? '' : this.report.financial.netProfit >= 0 ? 'text-success' : 'text-danger';
  }

  get netProfitIcon(): string {
    return !this.report ? '' : this.report.financial.netProfit >= 0 ? '↑' : '↓';
  }

  incomeCategories(cats: CategoryBreakdownDto[]): CategoryBreakdownDto[] {
    return cats.filter(c => c.type === 'Income');
  }

  expenseCategories(cats: CategoryBreakdownDto[]): CategoryBreakdownDto[] {
    return cats.filter(c => c.type === 'Expense');
  }

  barWidth(amount: number, cats: CategoryBreakdownDto[]): number {
    const max = Math.max(...cats.map(c => c.totalAmount));
    return max === 0 ? 0 : Math.round((amount / max) * 100);
  }

  doctorBarWidth(count: number): number {
    if (!this.report) return 0;
    const max = Math.max(...this.report.doctorActivity.doctors.map(d => d.appointmentCount));
    return max === 0 ? 0 : Math.round((count / max) * 100);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}