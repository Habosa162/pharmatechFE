import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TransactionSortBy, SortDirection, TransactionType, TransactionSearchDto, CreateTransactionDTO, Transaction } from '../../../Models/transactions/transactions.model';
import { AuthService } from '../../../services/auth.service';
import { ClinicService } from '../../../services/clinics/clinic.service';
import { TransactionService } from '../../../services/transactions/transaction.service';

@Component({
  selector: 'app-transaction',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.css'
})
export class TransactionComponent implements OnInit {

  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  totalCount = 0;
  pageSize = 10;
  pageNo = 1;
  totalPages = 0;

  sortBy: TransactionSortBy = TransactionSortBy.Date;
  sortDirection: SortDirection = SortDirection.Desc;

  loading = false;
  error: string | null = null;
  success: string | null = null;

  selectedType = 'all';
  dateFrom = '';
  dateTo = '';

  showTransactionModal = false;
  transactionForm: FormGroup;
  editingTransaction: Transaction | null = null;

  LoggedInUser: any | null = null;
  isOwner = false;
  clinics: any[] = [];
  selectedClinicId: number | null = null;

  userid: string | null = null;

  TransactionType = TransactionType;
  TransactionSortBy = TransactionSortBy;
  SortDirection = SortDirection;

  constructor(
    private transactionService: TransactionService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private clinicService: ClinicService
  ) {
    this.transactionForm = this.formBuilder.group({
      amount: [0, [Validators.required, Validators.min(0.01)]],
      description: [''],
      type: [TransactionType.Income, [Validators.required]],
      date: [new Date().toISOString().split('T')[0], [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.LoggedInUser = this.authService.getDecodedToken();
    this.userid = this.authService.getUserId();
    this.isOwner = this.LoggedInUser?.roles?.includes('Owner') ?? false;

    if (this.isOwner) {
      this.loadClinicsByOwner();
    } else {
      const clinicId = this.LoggedInUser?.ClinicId;
      if (clinicId) {
        this.selectedClinicId = clinicId;
        this.loadTransactions();
      }
    }
  }

  loadClinicsByOwner(): void {
    this.clinicService.getClinicsByOwner().subscribe({
      next: (data: any) => {
        this.clinics = data;
        if (this.clinics.length > 0) {
          this.selectedClinicId = this.clinics[0].id;
          this.loadTransactions();
        }
      },
      error: () => {
        this.error = 'Failed to load clinics.';
      }
    });
  }

  onPickUpClinic(clinicId: number): void {
    this.selectedClinicId = clinicId;
    this.pageNo = 1;
    this.loadTransactions();
  }

  get selectedClinicName(): string {
    return this.clinics.find(c => c.id === this.selectedClinicId)?.name || 'Select Clinic';
  }

  loadTransactions(): void {
    if (!this.selectedClinicId) return;

    this.loading = true;
    const searchDto: TransactionSearchDto = {
      clinicId: this.selectedClinicId,
      pageNumber: this.pageNo,
      pageSize: this.pageSize,
      fromDate: this.dateFrom ? new Date(this.dateFrom) : undefined,
      toDate: this.dateTo ? new Date(this.dateTo) : undefined,
      transcationType: this.selectedType !== 'all' ? +this.selectedType as TransactionType : undefined,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    };

    this.transactionService.getAllTransactions(searchDto).subscribe({
      next: (result: any) => {
        this.transactions = result.items;
        this.filteredTransactions = result.items;
        this.totalCount = result.totalCount;
        this.totalPages = result.totalPages;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading transactions:', error);
        this.error = 'Failed to load transactions';
        this.loading = false;
      }
    });
  }

  nextPage(): void {
    if (this.pageNo < this.totalPages) { this.pageNo++; this.loadTransactions(); }
  }

  prevPage(): void {
    if (this.pageNo > 1) { this.pageNo--; this.loadTransactions(); }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) { this.pageNo = page; this.loadTransactions(); }
  }

  onFilterChange(): void { this.pageNo = 1; this.loadTransactions(); }

  clearFilters(): void {
    this.selectedType = 'all';
    this.dateFrom = '';
    this.dateTo = '';
    this.pageNo = 1;
    this.loadTransactions();
  }

  changeSort(field: TransactionSortBy): void {
    this.sortDirection = this.sortBy === field
      ? this.sortDirection === SortDirection.Asc ? SortDirection.Desc : SortDirection.Asc
      : SortDirection.Desc;
    this.sortBy = field;
    this.loadTransactions();
  }

  showAddTransactionModal(): void {
    this.editingTransaction = null;
    this.transactionForm.reset();
    this.transactionForm.patchValue({
      type: TransactionType.Income,
      date: new Date().toISOString().split('T')[0],
      amount: 0
    });
    this.showTransactionModal = true;
  }

  showEditTransactionModal(transaction: Transaction): void {
    this.editingTransaction = transaction;
    this.transactionForm.patchValue({
      ...transaction,
      date: new Date(transaction.date).toISOString().split('T')[0]
    });
    this.showTransactionModal = true;
  }

  closeTransactionModal(): void {
    this.showTransactionModal = false;
    this.editingTransaction = null;
    this.transactionForm.reset();
  }

  saveTransaction(): void {
    if (!this.transactionForm.valid) return;

    const dto: CreateTransactionDTO = {
      amount: this.transactionForm.value.amount,
      date: new Date(this.transactionForm.value.date),
      description: this.transactionForm.value.description,
      type: Number(this.transactionForm.value.type),
      userId: this.userid!
    };

    if (this.editingTransaction) {
      this.transactionService.updateTransaction(this.editingTransaction.id!, dto).subscribe({
        next: () => { this.success = 'Transaction updated successfully!'; this.closeTransactionModal(); this.loadTransactions(); },
        error: () => { this.error = 'Failed to update transaction'; }
      });
    } else {
      this.transactionService.createTransaction(dto).subscribe({
        next: () => { this.success = 'Transaction created successfully!'; this.closeTransactionModal(); this.loadTransactions(); },
        error: () => { this.error = 'Failed to create transaction'; }
      });
    }
  }

  deleteTransaction(transactionId: number): void {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    this.transactionService.deleteTransaction(transactionId).subscribe({
      next: () => { this.success = 'Transaction deleted successfully!'; this.loadTransactions(); },
      error: () => { this.error = 'Failed to delete transaction'; }
    });
  }

  getTransactionTypeClass(type: TransactionType): string {
    switch (type) {
      case TransactionType.Income:  return 'badge-success';
      case TransactionType.Expense: return 'badge-danger';
      case TransactionType.Refund:  return 'badge-warning';
      case TransactionType.Other:   return 'badge-info';
      default:                      return 'badge-secondary';
    }
  }

  getTransactionTypeIcon(type: TransactionType): string {
    switch (type) {
      case TransactionType.Income:  return 'fas fa-arrow-up';
      case TransactionType.Expense: return 'fas fa-arrow-down';
      case TransactionType.Refund:  return 'fas fa-undo';
      case TransactionType.Other:   return 'fas fa-ellipsis-h';
      default:                      return 'fas fa-question';
    }
  }

  getTransactionTypeText(type: TransactionType): string {
    switch (type) {
      case TransactionType.Income:  return 'Income';
      case TransactionType.Expense: return 'Expense';
      case TransactionType.Refund:  return 'Refund';
      case TransactionType.Other:   return 'Other';
      default:                      return 'Unknown';
    }
  }

  getTotalAmount(): number {
    return this.filteredTransactions.reduce((total, t) =>
      t.type === TransactionType.Income ? total + t.amount : total - t.amount, 0);
  }

  getIncomeTotal(): number {
    return this.filteredTransactions.filter(t => t.type === TransactionType.Income)
      .reduce((total, t) => total + t.amount, 0);
  }

  getExpenseTotal(): number {
    return this.filteredTransactions.filter(t => t.type === TransactionType.Expense)
      .reduce((total, t) => total + t.amount, 0);
  }

  clearMessages(): void { this.error = null; this.success = null; }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required'])  return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['min'])       return `${fieldName} must be at least ${field.errors['min'].min}`;
    }
    return '';
  }
}