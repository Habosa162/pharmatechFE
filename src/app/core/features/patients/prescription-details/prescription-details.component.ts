import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PrescriptionService } from '../../../services/patients/prescription.service';
import { PrescriptionDto, AllPrescriptions } from '../../../Interfaces/patient/prescriptions/prescription';

@Component({
  selector: 'app-prescription-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prescription-details.component.html',
  styleUrl: './prescription-details.component.css'
})
export class PrescriptionDetailsComponent implements OnInit {
  prescription: PrescriptionDto | null = null;
  loading = false;
  downloading = false;
  error = '';

  constructor(
    public route: ActivatedRoute,
    private router: Router,
    private prescriptionService: PrescriptionService
  ) {}

  ngOnInit(): void {
    this.loadPrescriptionDetails();
  }

  loadPrescriptionDetails(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Prescription ID not provided';
      return;
    }

    this.loading = true;
    this.prescriptionService.getPrescriptionById(+id).subscribe({
      next: (prescription) => {
        this.prescription = prescription;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load prescription details: ' + err.message;
        this.loading = false;
      }
    });
  }

  backToList(): void {
    this.router.navigate(['/admin/prescriptions']);
  }

  backToPatientPrescriptions(): void {
    // Get patient ID from route query parameters or navigate back to general list
    const patientId = this.route.snapshot.queryParamMap.get('patientId');
    if (patientId) {
      this.router.navigate(['/patient-prescriptions', patientId]);
    } else {
      this.backToList();
    }
  }

  printPrescription(): void {
    // Add a small delay to ensure print styles are applied
    setTimeout(() => {
      window.print();
    }, 100);
  }

  downloadPrescription(): void {
    if (!this.prescription) {
      console.error('No prescription data available for download');
      return;
    }

    this.downloading = true;

    // Import jsPDF dynamically
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF();
      
      // Set document properties
      doc.setProperties({
        title: `Prescription - ${this.prescription!.patientName}`,
        subject: 'Medical Prescription',
        author: this.prescription!.doctorName,
        creator: 'PharmaTech System'
      });

      // Add header
      doc.setFontSize(24);
      doc.setTextColor(44, 62, 80);
      doc.text('PRESCRIPTION', 105, 30, { align: 'center' });
      
      // Add clinic name
      doc.setFontSize(14);
      doc.setTextColor(108, 117, 125);
      doc.text(this.prescription!.clinicName, 105, 45, { align: 'center' });
      
      // Add prescription date
      doc.text(`Date: ${this.formatDate(this.prescription!.prescriptionDate)}`, 20, 65);
      
      // Add patient information
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Patient Information', 20, 85);
      doc.setFontSize(12);
      doc.setTextColor(108, 117, 125);
      doc.text(`Name: ${this.prescription!.patientName}`, 20, 95);
      
      // Add doctor information
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Doctor Information', 20, 115);
      doc.setFontSize(12);
      doc.setTextColor(108, 117, 125);
      doc.text(`Doctor: ${this.prescription!.doctorName}`, 20, 125);
      
      // Add diagnosis
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Diagnosis', 20, 145);
      doc.setFontSize(12);
      doc.setTextColor(108, 117, 125);
      
      // Handle long diagnosis text
      const diagnosisLines = doc.splitTextToSize(this.prescription!.diagnosis, 170);
      doc.text(diagnosisLines, 20, 155);
      
      // Add medications
      let currentY = 155 + (diagnosisLines.length * 7) + 15;
      
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Medications', 20, currentY);
      currentY += 10;
      
      if (this.prescription!.medications && this.prescription!.medications.length > 0) {
        this.prescription!.medications.forEach((medication, index) => {
          if (currentY > 250) {
            doc.addPage();
            currentY = 20;
          }
          
          doc.setFontSize(12);
          doc.setTextColor(44, 62, 80);
          doc.text(`${index + 1}. ${medication.medicationName}`, 20, currentY);
          currentY += 8;
          
          doc.setFontSize(10);
          doc.setTextColor(108, 117, 125);
          
          if (medication.dosage) {
            doc.text(`   Dosage: ${medication.dosage}`, 25, currentY);
            currentY += 6;
          }
          
          if (medication.frequency) {
            doc.text(`   Frequency: ${medication.frequency}`, 25, currentY);
            currentY += 6;
          }
          
          if (medication.duration) {
            doc.text(`   Duration: ${medication.duration}`, 25, currentY);
            currentY += 6;
          }
          
          if (medication.notes) {
            const notesLines = doc.splitTextToSize(`   Notes: ${medication.notes}`, 150);
            doc.text(notesLines, 25, currentY);
            currentY += notesLines.length * 5;
          }
          
          currentY += 5;
        });
      } else {
        doc.setTextColor(108, 117, 125);
        doc.text('No medications prescribed', 20, currentY);
        currentY += 10;
      }
      
      // Add follow-up information
      if (this.prescription!.followUpDate) {
        currentY += 10;
        doc.setFontSize(12);
        doc.setTextColor(44, 62, 80);
        doc.text('Follow-up Information', 20, currentY);
        currentY += 8;
        doc.setFontSize(10);
        doc.setTextColor(108, 117, 125);
        doc.text(`Follow-up Date: ${this.formatDate(this.prescription!.followUpDate)}`, 20, currentY);
      }
      
      // Add footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(10);
      doc.setTextColor(108, 117, 125);
      doc.text('This prescription is valid only when signed by the prescribing physician', 105, pageHeight - 20, { align: 'center' });
      doc.text('Generated by PharmaTech System', 105, pageHeight - 15, { align: 'center' });
      
      // Save the PDF
      const fileName = `Prescription_${this.prescription!.patientName.replace(/\s+/g, '_')}_${this.formatDate(this.prescription!.prescriptionDate).replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      
      this.downloading = false;
    }).catch(error => {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
      this.downloading = false;
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }
} 