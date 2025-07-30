import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../../services/auth.service";

// import { AuthService } from "../../Services/Auth/auth.service";

export const headerInterceptor: HttpInterceptorFn = (req, next) => {

  try {
    if (!req.url.includes('/api/') || req.url.includes('/Account/login')) {
      return next(req);
    }

    const authService = inject(AuthService);

    const token = authService.getToken();
console.log("Token in interceptor:", token);
    let headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'X-Requested-With': 'XMLHttpRequest'
    };

    const isFormData = req.body instanceof FormData;
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const cloned = req.clone({
      setHeaders: headers
    });

    return next(cloned);
  } catch (error) {
    console.error('Interceptor error:', error);
    // toastr.error('An error occurred while processing the request.', 'Error');
    return next(req);
  }
};