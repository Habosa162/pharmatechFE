// services/doctor-department-report.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DoctorDepartmentReportDto, HalfMonthReportDto } from '../../Models/reports/doctor-department-report.models';
import { MONTH_NAMES } from '../../Models/reports/monthly-report.models';

@Injectable({ providedIn: 'root' })
export class DoctorDepartmentReportService {
  private base = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getReport(clinicId: number): Observable<DoctorDepartmentReportDto> {
    return this.http.get<DoctorDepartmentReportDto>(`${this.base}/doctors/${clinicId}`);
  }

  exportToPdf(report: DoctorDepartmentReportDto): void {
    const doc    = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const primary: [number,number,number] = [26, 107, 138];
    const green:   [number,number,number] = [39, 174, 96];
    const red:     [number,number,number] = [231, 76, 60];
    const gray:    [number,number,number] = [108, 117, 125];
    const pageW  = doc.internal.pageSize.getWidth();
    let y = 0;

    // ── Header ────────────────────────────────────────────────────────────────
    doc.setFillColor(...primary);
    doc.rect(0, 0, pageW, 32, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18); doc.setFont('helvetica', 'bold');
    doc.text(report.clinicName, 14, 13);
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text('Doctors & Departments Report', 14, 21);
    doc.setFontSize(8); doc.setTextColor(200, 230, 240);
    doc.text(`Generated: ${new Date(report.generatedAt).toLocaleString()}`, 14, 28);
    y = 40;

    // ── Helpers ───────────────────────────────────────────────────────────────
    const checkPageBreak = (needed: number) => {
      if (y + needed > doc.internal.pageSize.getHeight() - 15) {
        doc.addPage(); y = 15;
      }
    };

    const sectionTitle = (title: string) => {
      checkPageBreak(12);
      doc.setFontSize(11); doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primary);
      doc.text(title, 14, y);
      doc.setDrawColor(...primary); doc.setLineWidth(0.5);
      doc.line(14, y + 1.5, pageW - 14, y + 1.5);
      y += 8;
    };

    const kpiBox = (label: string, value: string, x: number, color: [number,number,number]) => {
      doc.setFillColor(244, 246, 248);
      doc.roundedRect(x, y, 55, 18, 2, 2, 'F');
      doc.setDrawColor(...color); doc.setLineWidth(0.8);
      doc.line(x, y, x, y + 18);
      doc.setFontSize(7); doc.setFont('helvetica', 'normal');
      doc.setTextColor(...gray); doc.text(label, x + 4, y + 5.5);
      doc.setFontSize(10); doc.setFont('helvetica', 'bold');
      doc.setTextColor(...color); doc.text(value, x + 4, y + 13);
    };

    const fmt = (v: number) =>
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

    // ── Overview KPIs ─────────────────────────────────────────────────────────
    sectionTitle('Overview');
    kpiBox('Total Doctors',    String(report.totalDoctors),    14,  primary);
    kpiBox('Active Doctors',   String(report.activeDoctors),   72,  green);
    kpiBox('Inactive Doctors', String(report.inactiveDoctors), 130, red);
    y += 24;

    // ── All Doctors Table ─────────────────────────────────────────────────────
    sectionTitle('All Doctors');
    autoTable(doc, {
      startY: y,
      head: [['Name', 'Specialization', 'Departments', 'Status', 'Appts', 'Rev %', 'Contribution']],
      body: report.allDoctors.map(d => [
        d.name,
        d.specialization,
        d.departments.join(', '),
        d.isActive ? 'Active' : 'Inactive',
        d.appointmentCount,
        `${d.revenuePercentage.toFixed(1)}%`,
        fmt(d.revenueContribution)
      ]),
      headStyles: { fillColor: primary, fontSize: 7.5, textColor: [255,255,255] },
      bodyStyles: { fontSize: 7.5 },
      alternateRowStyles: { fillColor: [244, 246, 248] },
      columnStyles: {
        3: { halign: 'center' },
        4: { halign: 'center', fontStyle: 'bold' },
        5: { halign: 'center' },
        6: { halign: 'right', fontStyle: 'bold' }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 3) {
          data.cell.styles.textColor =
            data.cell.raw === 'Active' ? green : red;
        }
      },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    // ── Departments ───────────────────────────────────────────────────────────
    sectionTitle('Departments Breakdown');

    for (const dept of report.departments) {
      checkPageBreak(50);

      // Dept header bar
      doc.setFillColor(244, 246, 248);
      doc.rect(14, y, pageW - 28, 10, 'F');
      doc.setDrawColor(...primary); doc.setLineWidth(1);
      doc.line(14, y, 14, y + 10);
      doc.setFontSize(9); doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primary);
      doc.text(dept.departmentName, 18, y + 6.5);

      const statusColor: [number,number,number] = dept.isActive ? green : red;
      doc.setFontSize(7); doc.setFont('helvetica', 'normal');
      doc.setTextColor(...statusColor);
      doc.text(dept.isActive ? 'Active' : 'Inactive', pageW - 28, y + 6.5);

      y += 13;

      // Dept stats inline
      doc.setFontSize(7.5); doc.setTextColor(...gray); doc.setFont('helvetica', 'normal');
      doc.text(`Doctors: ${dept.totalDoctors}`, 16, y);
      doc.text(`Appointments: ${dept.totalAppointments}`, 60, y);
      doc.text(`Revenue: ${fmt(dept.totalRevenue)}`, 120, y);
      if (dept.topDoctor) {
        doc.setTextColor(...green);
        doc.text(`⭐ Top: ${dept.topDoctor.name}`, 16, y + 5);
      }
      y += 12;

      // Doctors in dept
      if (dept.doctors.length > 0) {
        autoTable(doc, {
          startY: y,
          head: [['Doctor', 'Specialization', 'Status', 'Appointments', 'Rev %', 'Contribution']],
          body: dept.doctors.map(d => [
            d.name, d.specialization,
            d.isActive ? 'Active' : 'Inactive',
            d.appointmentCount,
            `${d.revenuePercentage.toFixed(1)}%`,
            fmt(d.revenueContribution)
          ]),
          headStyles: { fillColor: [47, 163, 195], fontSize: 7, textColor: [255,255,255] },
          bodyStyles: { fontSize: 7 },
          alternateRowStyles: { fillColor: [244, 246, 248] },
          columnStyles: {
            2: { halign: 'center' },
            3: { halign: 'center', fontStyle: 'bold' },
            4: { halign: 'center' },
            5: { halign: 'right', fontStyle: 'bold' }
          },
          didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 2) {
              data.cell.styles.textColor =
                data.cell.raw === 'Active' ? green : red;
            }
          },
          margin: { left: 14, right: 14 },
        });
        y = (doc as any).lastAutoTable.finalY + 8;
      }
    }

    // ── Footer ────────────────────────────────────────────────────────────────
    const pageCount = doc.internal.pages.length - 1;
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      const pageH = doc.internal.pageSize.getHeight();
      doc.setFillColor(244, 246, 248);
      doc.rect(0, pageH - 10, pageW, 10, 'F');
      doc.setFontSize(7); doc.setTextColor(...gray);
      doc.text(report.clinicName, 14, pageH - 3.5);
      doc.text(`Page ${p} of ${pageCount}`, pageW - 14, pageH - 3.5, { align: 'right' });
    }

    doc.save(`DoctorDept_Report_${report.clinicName.replace(/\s+/g, '_')}.pdf`);
  }
}

