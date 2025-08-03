# Invoice Management System

This module provides a comprehensive invoice management system for the pharmacy application, including list view, details view, editing capabilities, and advanced filtering.

## Components

### 1. InvoiceListComponent
**Location**: `src/app/core/features/billing/invoice-list/`

**Features**:
- Display all invoices in a responsive grid layout
- Advanced filtering by payment method, status, and date range
- Search functionality
- Create new invoices
- Edit existing invoices
- Delete invoices
- View invoice details
- Real-time balance calculation

**Key Methods**:
- `loadInvoices()`: Load all invoices from the API
- `onFilterChange()`: Apply filters to the invoice list
- `showAddInvoiceModal()`: Open modal for creating new invoices
- `showEditInvoiceModal()`: Open modal for editing invoices
- `deleteInvoice()`: Delete an invoice with confirmation

### 2. InvoiceDetailsComponent
**Location**: `src/app/core/features/billing/invoice-details/`

**Features**:
- Detailed view of a single invoice
- Patient and clinic information
- Payment summary with balance calculation
- Print and download functionality
- Navigation back to list

**Key Methods**:
- `loadInvoiceDetails()`: Load specific invoice details
- `printInvoice()`: Print the invoice
- `downloadInvoice()`: Download invoice as PDF
- `editInvoice()`: Navigate to edit page

### 3. InvoiceEditComponent
**Location**: `src/app/core/features/billing/invoice-edit/`

**Features**:
- Edit invoice amounts and payment method
- Real-time balance calculation
- Form validation
- Original vs new values comparison
- Save changes with confirmation

**Key Methods**:
- `loadInvoice()`: Load invoice for editing
- `populateForm()`: Populate form with current values
- `saveInvoice()`: Save changes to the API
- `cancel()`: Navigate back to list

## Services

### InvoiceService
**Location**: `src/app/core/services/appintments/invoice.service.ts`

**Key Methods**:
- `getAllInvoices()`: Get all invoices
- `getInvoiceById(id)`: Get specific invoice
- `addInvoice(invoice)`: Create new invoice
- `updateInvoice(id, invoice)`: Update existing invoice
- `deleteInvoice(id)`: Delete invoice
- `getInvoicesByPatientId(patientId)`: Get invoices for specific patient
- `getInvoicesByClinicId(clinicId)`: Get invoices for specific clinic
- `getInvoicesByDateRange(startDate, endDate)`: Get invoices within date range
- `getUnpaidInvoices()`: Get all unpaid invoices
- `getPaidInvoices()`: Get all paid invoices
- `markAsPaid(id)`: Mark invoice as paid
- `exportInvoicesToPdf(filters)`: Export invoices to PDF
- `exportInvoicesToExcel(filters)`: Export invoices to Excel

## Interfaces

### Invoice Interfaces
**Location**: `src/app/core/Interfaces/appointment/invoices/invoice.ts`

- `InvoiceDto`: Complete invoice data with patient and clinic info
- `AllInvoices`: Basic invoice list item
- `CreateInvoice`: Data structure for creating new invoices
- `UpdateInvoice`: Data structure for updating invoices

### Payment Method Enum
**Location**: `src/app/core/Interfaces/all.ts`

```typescript
export enum PaymentMethod {
    Cash = 0,
    CreditCard = 1,
    Wallet = 2,
    Insurance = 3,
    Other = 4
}
```

## Routing

The invoice components are configured with the following routes:

```typescript
{ path: 'invoices', component: InvoiceListComponent },
{ path: 'invoices/:id', component: InvoiceDetailsComponent },
{ path: 'invoices/edit/:id', component: InvoiceEditComponent }
```

## Features

### Filtering and Search
- **Search**: Search by invoice ID or amount
- **Payment Method**: Filter by Cash, Credit Card, Wallet, Insurance, or Other
- **Payment Status**: Filter by Paid or Unpaid
- **Date Range**: Filter by creation date range
- **Clear Filters**: Reset all filters

### Responsive Design
- Mobile-friendly layout
- Responsive grid system
- Touch-friendly buttons and controls
- Optimized for different screen sizes

### Form Validation
- Required field validation
- Minimum value validation for amounts
- Real-time validation feedback
- Error message display

### User Experience
- Loading states with spinners
- Success/error message notifications
- Confirmation dialogs for destructive actions
- Smooth transitions and animations
- Intuitive navigation

## Usage Examples

### Creating a New Invoice
```typescript
const newInvoice: CreateInvoice = {
  appointmentId: 123,
  totalAmount: 150.00,
  paidAmount: 150.00,
  isPaid: true,
  paymentMethod: PaymentMethod.Cash
};

this.invoiceService.addInvoice(newInvoice).subscribe({
  next: (result) => {
    console.log('Invoice created successfully');
  },
  error: (error) => {
    console.error('Failed to create invoice:', error);
  }
});
```

### Filtering Invoices
```typescript
// Filter by date range
const startDate = new Date('2024-01-01');
const endDate = new Date('2024-12-31');
this.invoiceService.getInvoicesByDateRange(startDate, endDate).subscribe({
  next: (invoices) => {
    console.log('Filtered invoices:', invoices);
  }
});
```

### Updating an Invoice
```typescript
const updateData: UpdateInvoice = {
  totalAmount: 200.00,
  paidAmount: 150.00,
  paymentMethod: PaymentMethod.CreditCard
};

this.invoiceService.updateInvoice(invoiceId, updateData).subscribe({
  next: (result) => {
    console.log('Invoice updated successfully');
  }
});
```

## Styling

The components use a modern, clean design with:
- Gradient backgrounds
- Card-based layouts
- Consistent color scheme
- Professional typography
- Smooth hover effects
- Status-based color coding

## Dependencies

- Angular Common Module
- Angular Forms Module
- Angular Router
- RxJS for reactive programming
- Bootstrap CSS classes (for responsive design)

## Error Handling

The service includes comprehensive error handling:
- HTTP error interception
- User-friendly error messages
- Console logging for debugging
- Graceful fallbacks

## Future Enhancements

Potential improvements for the invoice system:
- Bulk operations (bulk delete, bulk update)
- Advanced reporting and analytics
- Email invoice functionality
- Payment gateway integration
- Invoice templates customization
- Multi-currency support
- Tax calculation features 