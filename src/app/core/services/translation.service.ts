import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private translateService = inject(TranslateService);

  constructor() {
    // Set default language
    const savedLanguage= localStorage.getItem('language') as 'ar' | 'en' || 'ar';
    this.setLanguage(savedLanguage);
  }

  setLanguage(lang: 'ar' | 'en'): void {
    this.translateService.use(lang);
    localStorage.setItem('language', lang);
    this.updateDocumentDirection(lang);
  }

  getCurrentLanguage(): 'ar' | 'en' {
    return (this.translateService.currentLang || 'ar') as 'ar' | 'en';
  }

  private updateDocumentDirection(lang: string): void {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  toggleLanguage(): void {
    const currentLang = this.getCurrentLanguage();
    const newLang = currentLang === 'ar' ? 'en' : 'ar';
    this.setLanguage(newLang);
  }
}

