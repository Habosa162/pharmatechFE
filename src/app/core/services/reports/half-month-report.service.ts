import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Observable } from 'rxjs';
import { HalfMonthReportDto } from '../../Models/reports/doctor-department-report.models';
import { MONTH_NAMES } from '../../Models/reports/monthly-report.models';
import { environment } from '../enviroment';

// ─────────────────────────────────────────────────────────────────────────────
// Half-Month Report Service
// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class HalfMonthReportService {
  private base = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getReport(clinicId: number, half: number, month: number, year: number): Observable<HalfMonthReportDto> {
    const params = new HttpParams()
      .set('half', half).set('month', month).set('year', year);
    return this.http.get<HalfMonthReportDto>(`${this.base}/half/${clinicId}`, { params });
  }

  exportToPdf(report: HalfMonthReportDto): void {
    const doc    = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const primary: [number,number,number] = [26, 107, 138];
    const green:   [number,number,number] = [39, 174, 96];
    const red:     [number,number,number] = [231, 76, 60];
    const gray:    [number,number,number] = [108, 117, 125];
    const pageW  = doc.internal.pageSize.getWidth();
    let y = 0;

    // ── Header ────────────────────────────────────────────────────────────────
    doc.setFillColor(...primary);
    doc.rect(0, 0, pageW, 36, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18); doc.setFont('helvetica', 'bold');
    doc.text(report.clinicName, 14, 12);
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text(`Half-Month Report — ${report.periodLabel}`, 14, 20);
    doc.setFontSize(8.5);
    doc.text(
      `${new Date(report.periodFrom).toLocaleDateString()} – ${new Date(report.periodTo).toLocaleDateString()}`,
      14, 27
    );
    doc.setFontSize(7.5); doc.setTextColor(200, 230, 240);
    doc.text(`Generated: ${new Date(report.generatedAt).toLocaleString()}`, 14, 33);
    y = 43;

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

    const kpiBox = (label: string, value: string, x: number, w: number, color: [number,number,number]) => {
      doc.setFillColor(244, 246, 248);
      doc.roundedRect(x, y, w, 18, 2, 2, 'F');
      doc.setDrawColor(...color); doc.setLineWidth(0.8);
      doc.line(x, y, x, y + 18);
      doc.setFontSize(7); doc.setFont('helvetica', 'normal');
      doc.setTextColor(...gray); doc.text(label, x + 4, y + 5.5);
      doc.setFontSize(10); doc.setFont('helvetica', 'bold');
      doc.setTextColor(...color); doc.text(value, x + 4, y + 13);
    };

    const fmt = (v: number) =>
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

    const fin       = report.financial;
    const profitCol: [number,number,number] = fin.netProfit >= 0 ? green : red;

    // ── Financial KPIs ────────────────────────────────────────────────────────
    sectionTitle('Financial Summary');
    kpiBox('Total Income',    fmt(fin.totalIncome),   14,  44, green);
    kpiBox('Total Expenses',  fmt(fin.totalExpenses), 61,  44, red);
    kpiBox('Net Profit/Loss', fmt(fin.netProfit),     108, 44, profitCol);
    kpiBox('Invoices',        String(fin.invoiceSummary.totalInvoices), 155, 41, primary);
    y += 24;

    // ── Invoice summary ───────────────────────────────────────────────────────
    checkPageBreak(25);
    kpiBox('Invoice Amount', fmt(fin.invoiceSummary.totalInvoiceAmount), 14,  55, primary);
    kpiBox('Cash',           fmt(fin.invoiceSummary.cashAmount),          72,  55, [41,128,185]);
    kpiBox('Other',          fmt(fin.invoiceSummary.otherAmount),         130, 56, [142,68,173]);
    y += 24;

    // ── Category Breakdown ────────────────────────────────────────────────────
    if (fin.categoryBreakdown.length > 0) {
      sectionTitle('Transaction Breakdown by Category');
      autoTable(doc, {
        startY: y,
        head: [['Category', 'Type', 'Amount']],
        body: fin.categoryBreakdown.map(c => [c.categoryName, c.type, fmt(c.totalAmount)]),
        headStyles: { fillColor: primary, fontSize: 8, textColor: [255,255,255] },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [244, 246, 248] },
        columnStyles: { 2: { halign: 'right', fontStyle: 'bold' } },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 1)
            data.cell.styles.textColor = data.cell.raw === 'Income' ? green : red;
        },
        margin: { left: 14, right: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 8;
    }

    // ── Top Invoices ──────────────────────────────────────────────────────────
    if (fin.invoiceSummary.topInvoices.length > 0) {
      sectionTitle('Top 10 Invoices');
      autoTable(doc, {
        startY: y,
        head: [['Patient', 'Service', 'Doctor', 'Method', 'Amount', 'Date']],
        body: fin.invoiceSummary.topInvoices.map(i => [
          i.patientName, i.serviceName, i.doctorName, i.paymentMethod,
          fmt(i.amount), new Date(i.date).toLocaleDateString()
        ]),
        headStyles: { fillColor: primary, fontSize: 7.5, textColor: [255,255,255] },
        bodyStyles: { fontSize: 7.5 },
        alternateRowStyles: { fillColor: [244, 246, 248] },
        columnStyles: { 4: { halign: 'right', fontStyle: 'bold' } },
        margin: { left: 14, right: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 8;
    }

    // ── Doctor Activity ───────────────────────────────────────────────────────
    sectionTitle('Doctor Activity');
    const act = report.doctorActivity;
    kpiBox('Active Doctors',     String(act.totalActiveDoctors), 14, 55, primary);
    kpiBox('Total Appointments', String(act.totalAppointments),  72, 55, primary);
    y += 24;

    if (act.doctors.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [['Doctor', 'Specialization', 'Departments', 'Appts', 'Rev %', 'Contribution']],
        body: act.doctors.map(d => [
          d.name, d.specialization, d.departments.join(', '),
          d.appointmentCount, `${d.revenuePercentage.toFixed(1)}%`, fmt(d.revenueContribution)
        ]),
        headStyles: { fillColor: primary, fontSize: 7.5, textColor: [255,255,255] },
        bodyStyles: { fontSize: 7.5 },
        alternateRowStyles: { fillColor: [244, 246, 248] },
        columnStyles: {
          3: { halign: 'center', fontStyle: 'bold' },
          4: { halign: 'center' },
          5: { halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: 14, right: 14 },
      });
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

    const monthName = MONTH_NAMES[new Date(report.periodFrom).getMonth()];
    doc.save(`HalfMonth_Report_${report.clinicName.replace(/\s+/g, '_')}_${monthName}.pdf`);
  }
}
