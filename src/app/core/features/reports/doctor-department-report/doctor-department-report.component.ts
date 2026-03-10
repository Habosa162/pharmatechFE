import { Component, Input, OnInit } from '@angular/core';
import { DoctorDepartmentReportDto } from '../../../Models/reports/doctor-department-report.models';
import { DoctorDepartmentReportService } from '../../../services/reports/doctor-department-report.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-doctor-department-report',
  imports: [ CommonModule ,FormsModule ],
  templateUrl: './doctor-department-report.component.html',
  styleUrls: ['./doctor-department-report.component.css']
})
export class DoctorDepartmentReportComponent implements OnInit {
  @Input() clinicId!: number;

  report: DoctorDepartmentReportDto | null = null;
  isLoading   = false;
  isExporting = false;
  errorMessage: string | null = null;
  expandedDept: string | null = null;

  constructor(private reportService: DoctorDepartmentReportService) {}

  ngOnInit(): void { this.loadReport(); }

  loadReport(): void {
    this.isLoading   = true;
    this.errorMessage = null;
    this.report      = null;

    this.reportService.getReport(this.clinicId).subscribe({
      next:  (data) => { this.report = data; this.isLoading = false; },
      error: ()     => { this.errorMessage = 'Failed to load report.'; this.isLoading = false; }
    });
  }

  exportPdf(): void {
    if (!this.report) return;
    this.isExporting = true;
    setTimeout(() => { this.reportService.exportToPdf(this.report!); this.isExporting = false; }, 50);
  }

  toggleDept(name: string): void {
    this.expandedDept = this.expandedDept === name ? null : name;
  }

  isDeptExpanded(name: string): boolean {
    return this.expandedDept === name;
  }

  formatCurrency(v: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  doctorBarWidth(count: number): number {
    if (!this.report || !this.report.allDoctors.length) return 0;
    const max = Math.max(...this.report.allDoctors.map(d => d.appointmentCount));
    return max === 0 ? 0 : Math.round((count / max) * 100);
  }
}
