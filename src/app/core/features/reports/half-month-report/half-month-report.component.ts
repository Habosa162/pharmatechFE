import { Clinic } from './../../../Interfaces/all';
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HalfMonthReportDto } from '../../../Models/reports/doctor-department-report.models';
import { MONTH_NAMES, CategoryBreakdownDto } from '../../../Models/reports/monthly-report.models';
import { HalfMonthReportService } from '../../../services/reports/half-month-report.service';


@Component({
  selector: 'app-half-month-report',
  imports: [ CommonModule ,FormsModule ],
  templateUrl: './half-month-report.component.html',
  styleUrls: ['./half-month-report.component.css']
})
export class HalfMonthReportComponent implements OnInit {
  clinicId!: number;
  report: HalfMonthReportDto | null = null;
  isLoading   = false;
  isExporting = false;
  errorMessage: string | null = null;

  selectedHalf  = 1;
  selectedMonth: number;
  selectedYear: number;
  months = MONTH_NAMES.map((label, i) => ({ label, value: i + 1 }));
  years  = Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - i);

  constructor(private reportService: HalfMonthReportService) {
    const prev = new Date(); prev.setMonth(prev.getMonth() - 1);
    this.selectedMonth = prev.getMonth() + 1;
    this.selectedYear  = prev.getFullYear();
  }

  ngOnInit(): void { this.loadReport(); }

  loadReport(): void {
    this.isLoading    = true;
    this.errorMessage = null;
    this.report       = null;

    this.reportService
      // .getReport(this.clinicId, this.selectedHalf, this.selectedMonth, this.selectedYear)
      .getReport(1, this.selectedHalf, this.selectedMonth, this.selectedYear)
      .subscribe({
        next:  (data) => { this.report = data; this.isLoading = false; },
        error: ()     => { this.errorMessage = 'Failed to load report.'; this.isLoading = false; }
      });
  }

  exportPdf(): void {
    if (!this.report) return;
    this.isExporting = true;
    setTimeout(() => { this.reportService.exportToPdf(this.report!); this.isExporting = false; }, 50);
  }

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
  formatCurrency(v: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
  }
  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
