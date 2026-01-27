import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { MainLayoutComponent } from "./core/layouts/main-layout/main-layout.component";
import { UserLayoutComponent } from "./core/layouts/user-layout/user-layout.component";
import { AdminLayoutComponent } from "./core/layouts/admin-layout/admin-layout.component";
import { OwnerLayoutComponent } from "./core/layouts/owner-layout/owner-layout.component";
import { MasterLayoutComponent } from "./core/layouts/master-layout/master-layout.component";
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, MainLayoutComponent, UserLayoutComponent, AdminLayoutComponent, OwnerLayoutComponent, MasterLayoutComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  protected authService = inject(AuthService);
  private translateService = inject(TranslateService);

  // Use signals for reactive data
  public isLoggedIn = this.authService.isLoggedInSignal;
  public userFullData = this.authService.userFullDataSignal;

  ngOnInit() {
    // Initialize translations
    this.initializeTranslations();
    
    console.log('AppComponent - ngOnInit called');
    console.log('AppComponent - Is logged in:', this.isLoggedIn());
    
    // Load user data if logged in
    if (this.isLoggedIn()) {
      console.log('AppComponent - Loading user full data...');
      this.authService.loadUserFullData();
    }
  }

  private initializeTranslations(): void {
    // Set default language to Arabic
    const savedLanguage = localStorage.getItem('language') || 'ar';
    this.translateService.setDefaultLang('ar');
    this.translateService.use(savedLanguage);
    this.updateDocumentDirection(savedLanguage);
  }

  private updateDocumentDirection(lang: string): void {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }
}
