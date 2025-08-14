# Role-Based Navigation System

This document describes the implementation of the role-based navigation system for the PharmaTech application.

## Overview

The system now supports role-based access control with the following user roles in hierarchical order:
1. **MASTER** - Highest level access with system-wide control
2. **OWNER** - Business-level access with strategic insights
3. **ADMIN** - Administrative access with management capabilities
4. **ACCOUNTANT** - Financial access with reporting capabilities
5. **USER** - Basic user access

Additionally, users can have special designations:
- **isDoctor** - Access to doctor-specific features
- **isEmployee** - Access to employee-specific features

## Implementation Details

### 1. AuthService Updates

The `AuthService` has been enhanced with new methods:
- `loadUserFullData()` - Loads user's complete role and status information
- `getHighestRole()` - Returns the user's highest role from the hierarchy
- `isDoctor()` - Checks if user is a doctor
- `isEmployee()` - Checks if user is an employee
- `hasRole(role)` - Checks if user has a specific role
- `hasAnyRole(roles[])` - Checks if user has any of the specified roles
- `canAccessFeature(feature)` - Checks feature access based on role hierarchy

### 2. RoleService

A new `RoleService` provides centralized role management:
- Role checking methods
- Feature access control
- Doctor and employee ID retrieval
- User data management

### 3. Navigation Components

#### Navbar Component
- Dynamic navigation based on user roles
- Role-specific dropdown menus
- User profile with role badge
- Conditional menu items

#### Sidebar Component
- Role-based menu sections
- Collapsible menu groups
- Feature-specific navigation
- User role display

#### Admin Navbar Component
- Role-specific tab navigation
- Conditional tab visibility
- Feature access control

### 4. Routing Structure

New routes have been added for role-specific functionality:

#### Doctor Routes
- `/doctor/dashboard` - Doctor dashboard
- `/doctor/appointments` - My appointments
- `/doctor/patients` - My patients
- `/doctor/schedule` - Schedule management
- `/doctor/medical-records` - Medical records
- `/doctor/prescriptions` - Prescriptions

#### Employee Routes
- `/employee/dashboard` - Employee dashboard
- `/employee/payments` - Payment management
- `/employee/transactions` - Transaction management
- `/employee/invoices` - Invoice management
- `/employee/customer-service` - Customer service

#### Accountant Routes
- `/accountant/dashboard` - Financial dashboard
- `/accountant/reports` - Financial reports
- `/accountant/transactions` - All transactions
- `/accountant/invoices` - Invoice management
- `/accountant/tax-reports` - Tax reports
- `/accountant/budget-planning` - Budget planning

#### Master Routes
- `/master/dashboard` - Master dashboard
- `/master/system-settings` - System settings
- `/master/audit-logs` - Audit logs
- `/master/global-config` - Global configuration

#### Owner Routes
- `/owner/dashboard` - Owner dashboard
- `/owner/business-analytics` - Business analytics
- `/owner/strategic-reports` - Strategic reports

### 5. Feature Access Control

The system implements feature-based access control:

```typescript
// Example usage
if (this.authService.canAccessFeature('user_management')) {
  // Show user management features
}

if (this.authService.canAccessFeature('financial_reports')) {
  // Show financial reporting features
}
```

### 6. Doctor-Specific Functionality

For doctors, the system provides:
- Access to patient appointments using `getDoctoridByUserid()`
- Patient management capabilities
- Medical record access
- Prescription management
- Schedule management

### 7. Employee-Specific Functionality

For employees, the system provides:
- Payment processing
- Transaction management
- Invoice management
- Customer service tools

## Usage Examples

### Checking User Roles
```typescript
// In component
constructor(private authService: AuthService) {}

ngOnInit() {
  if (this.authService.isLoggedIn()) {
    this.authService.loadUserFullData();
  }
}

// Check specific role
canAccessAdmin(): boolean {
  return this.authService.hasAnyRole(['MASTER', 'OWNER', 'ADMIN']);
}

// Check if doctor
canAccessDoctor(): boolean {
  return this.authService.isDoctor();
}
```

### Template Usage
```html
<!-- Show admin features only for admin users -->
<div *ngIf="canAccessAdmin()">
  <h3>Admin Panel</h3>
  <!-- Admin content -->
</div>

<!-- Show doctor features only for doctors -->
<div *ngIf="canAccessDoctor()">
  <h3>Doctor Panel</h3>
  <!-- Doctor content -->
</div>
```

### Getting Doctor ID
```typescript
// Get doctor ID for current user
this.roleService.getDoctorId().subscribe(doctorId => {
  if (doctorId) {
    // Use doctorId for doctor-specific API calls
    this.loadDoctorAppointments(doctorId);
  }
});
```

## Security Considerations

1. **Role Validation**: All role checks are performed on the frontend and should be validated on the backend
2. **Route Guards**: Use route guards to prevent unauthorized access to protected routes
3. **API Security**: Ensure backend APIs validate user roles and permissions
4. **Token Management**: JWT tokens should contain role information and be properly validated

## Future Enhancements

1. **Dynamic Role Assignment**: Allow admins to assign/remove roles dynamically
2. **Permission Granularity**: Implement more granular permissions within roles
3. **Audit Logging**: Track role changes and access attempts
4. **Role Templates**: Predefined role templates for common use cases
5. **Multi-tenant Support**: Role management for multiple organizations

## Troubleshooting

### Common Issues

1. **Roles not loading**: Ensure `loadUserFullData()` is called after login
2. **Navigation not updating**: Check if user data is properly loaded
3. **Permission errors**: Verify role hierarchy and feature access rules
4. **Route access denied**: Check route guards and role validation

### Debug Information

Enable debug logging to troubleshoot role-related issues:
```typescript
console.log('User Full Data:', this.authService.getUserFullData());
console.log('Highest Role:', this.authService.getHighestRole());
console.log('Is Doctor:', this.authService.isDoctor());
console.log('Is Employee:', this.authService.isEmployee());
```

## Conclusion

The role-based navigation system provides a robust foundation for managing user access and permissions in the PharmaTech application. It ensures that users only see and access features appropriate to their role while maintaining a clean and intuitive user experience. 