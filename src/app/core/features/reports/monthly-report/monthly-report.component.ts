import { Component, Input, OnInit } from '@angular/core';
import { MonthlyReportDto, MONTH_NAMES, CategoryBreakdownDto } from '../../../Models/reports/monthly-report.models';
import { ReportsService } from '../../../services/reports/reports.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-monthly-report',
  imports: [ CommonModule ,FormsModule ],
  templateUrl: './monthly-report.component.html',
  styleUrl: './monthly-report.component.css'
})

export class MonthlyReportComponent implements OnInit {
  // @Input() clinicId!: number;

  report: MonthlyReportDto | null = null;
  isLoadingData = false;
  isExporting   = false;
  errorMessage: string | null = null;

  selectedMonth: number;
  selectedYear: number;
  months = MONTH_NAMES.map((label, i) => ({ label, value: i + 1 }));
  years  = Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - i);

  constructor(private reportService: ReportsService) {
    const prev = new Date();
    prev.setMonth(prev.getMonth() - 1);
    this.selectedMonth = prev.getMonth() + 1;
    this.selectedYear  = prev.getFullYear();
  }

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.isLoadingData = true;
    this.errorMessage  = null;
    this.report        = null;

    this.reportService
      .getReportData(1, this.selectedMonth, this.selectedYear)
      .subscribe({
        next:  (data) => { this.report = data; this.isLoadingData = false; },
        error: ()     => { this.errorMessage = 'Failed to load report.'; this.isLoadingData = false; }
      });
  }

  exportPdf(): void {
    if (!this.report) return;
    this.isExporting = true;
    // jsPDF runs synchronously — wrap in timeout to let the spinner render first
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