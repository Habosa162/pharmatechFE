import { Component, inject, OnInit, signal } from '@angular/core';
import { ServiceService } from '../../../services/clinics/services.service';
import { ServiceDto } from '../../../Interfaces/clinic/medications/services';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent implements OnInit {
  services = signal<ServiceDto[]>([]);
  loading = false;
  success = '';
  error = '';
  newServiceName: string = '';
  searchTerm: string = '';

  constructor(private serviceService: ServiceService) {}
  authService = inject(AuthService);
  private translateService = inject(TranslateService);

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.loading = true;
    this.serviceService.getAllServices().subscribe({
      next: (services) => {
        this.services.set(services);
        this.loading = false;
      },
      error: (err) => {
        this.translateService.get('SERVICES.FAILED_LOAD').subscribe(translation => {
          this.error = translation + ': ' + err.message;
        });
        this.loading = false;
        this.clearMessages();
      }
    });
  }

  createService(name: string): void {
    if (!name || name.trim() === '') {
      this.translateService.get(['SERVICES.SERVICE_NAME', 'COMMON.REQUIRED']).subscribe(translations => {
        this.error = translations['SERVICES.SERVICE_NAME'] + ' ' + translations['COMMON.REQUIRED'];
      });
      this.clearMessages();
      return;
    }

    this.loading = true;
    this.serviceService.createService({ 
      name: name.trim(), 
      clinicId: this.authService.getUserData().ClinicId 
    }).subscribe({
      next: (service) => {
        this.translateService.get('SERVICES.SERVICE_CREATED').subscribe(translation => {
          this.success = translation;
        });
        this.newServiceName = '';
        this.loadServices();
        this.clearMessages();
      },
      error: (err) => {
        this.translateService.get('SERVICES.FAILED_CREATE').subscribe(translation => {
          this.error = translation + ': ' + err.message;
        });
        this.loading = false;
        this.clearMessages();
      }
    });
  }

  get filteredServices(): ServiceDto[] {
    if (!this.searchTerm) {
      return this.services();
    }
    return this.services().filter(service =>
      service.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      service.id.toString().includes(this.searchTerm)
    );
  }


  deleteService(id: number): void {
    this.translateService.get('SERVICES.DELETE_CONFIRM').subscribe(confirmMsg => {
      if (confirm(confirmMsg)) {
        this.serviceService.deleteService(id).subscribe({
          next: (response) => {
            this.translateService.get('SERVICES.SERVICE_DELETED').subscribe(translation => {
              this.success = translation;
            });
            this.loadServices();
            this.clearMessages();
          },
          error: (err) => {
            this.translateService.get('SERVICES.FAILED_DELETE').subscribe(translation => {
              this.error = translation + ': ' + err.message;
            });
            this.clearMessages();
          }
        });
      }
    });
  }
  clearMessages(): void {
    setTimeout(() => {
      this.success = '';
      this.error = '';
    }, 3000);
  }
}
