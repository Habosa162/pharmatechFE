import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastr: ToastrService) { }

  // Success toast
  success(message: string, title: string = 'Success') {
    this.toastr.success(message, title);
  }

  // Error toast
  error(message: string, title: string = 'Error') {
    this.toastr.error(message, title);
  }

  // Warning toast
  warning(message: string, title: string = 'Warning') {
    this.toastr.warning(message, title);
  }

  // Info toast
  info(message: string, title: string = 'Information') {
    this.toastr.info(message, title);
  }

  // Clear all toasts
  clear() {
    this.toastr.clear();
  }

  // Show toast with custom options
  show(message: string, title: string = '', options: any = {}) {
    this.toastr.show(message, title, options);
  }
} 