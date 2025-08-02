import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TransactionService } from '../../services/transactions/transaction.service';
import { 
  Transaction, 
  TransactionType,
  CreateTransactionDTO,
  UpdateTransactionDTO
} from '../../Models/transactions/transactions.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-transaction',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.css'
})
export class TransactionComponent implements OnInit {
  // Data properties
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  
  // UI state
  loading = false;
  error: string | null = null;
  success: string | null = null;

  // Filter properties
  selectedType = 'all';
  dateFrom = '';
  dateTo = '';

  // Modal states
  showTransactionModal = false;

  // Forms
  transactionForm: FormGroup;

  // Edit states
  editingTransaction: Transaction | null = null;

  // Enums for template
  TransactionType = TransactionType;

  constructor(
    private transactionService: TransactionService,
    private formBuilder: FormBuilder,
    private authservice:AuthService
  ) {
    this.transactionForm = this.formBuilder.group({
      amount: [0, [Validators.required, Validators.min(0.01)]],
      description: [''],
      type: [TransactionType.Income, [Validators.required]], // This will now be numeric
      date: [new Date().toISOString().split('T')[0], [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadAllData();
  }
userid:string|null=null;
  loadAllData(): void {
    this.userid=this.authservice.getUserId();
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    this.transactionService.getAllTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        console.log(this.transactions,'all transac');
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.error = 'Failed to load transactions';
        this.loading = false;
      }
    });
  }

  // Filter methods
  applyFilters(): void {
    let filtered = [...this.transactions];

    // Filter by type
    if (this.selectedType !== 'all') {
      filtered = filtered.filter(t => t.type === +this.selectedType);
    }

    // Filter by date range
    if (this.dateFrom) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(this.dateFrom));
    }
    if (this.dateTo) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(this.dateTo));
    }

    this.filteredTransactions = filtered.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedType = 'all';
    this.dateFrom = '';
    this.dateTo = '';
    this.applyFilters();
  }

  // Tab management
  setActiveTab(tab: 'transactions' | 'categories'): void {
    // This method is no longer needed as categories are removed
  }

  // Transaction management
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
    if (this.transactionForm.valid) {
      if (this.editingTransaction) {
        // Update existing transaction
        const updateData: CreateTransactionDTO = {
          amount: this.transactionForm.value.amount,
          date: new Date(this.transactionForm.value.date),
          description: this.transactionForm.value.description,
          type: Number(this.transactionForm.value.type), // Ensure it's numeric
          userId: this.userid! // You might want to get this from auth service
        };

        this.transactionService.updateTransaction(this.editingTransaction.id!, updateData).subscribe({
          next: () => {
            this.success = 'Transaction updated successfully!';
            this.closeTransactionModal();
            this.loadTransactions();
          },
          error: (error) => {
            console.error('Error updating transaction:', error);
            this.error = 'Failed to update transaction';
          }
        });
      } else {
        // Create new transaction
        const createData: CreateTransactionDTO = {
          amount: this.transactionForm.value.amount,
          date: new Date(this.transactionForm.value.date),
          description: this.transactionForm.value.description,
          type: Number(this.transactionForm.value.type), // Ensure it's numeric
          userId: this.userid! // You might want to get this from auth service
        };

        this.transactionService.createTransaction(createData).subscribe({
          next: () => {
            this.success = 'Transaction created successfully!';
            this.closeTransactionModal();
            this.loadTransactions();
          },
          error: (error) => {
            console.error('Error creating transaction:', error);
            this.error = 'Failed to create transaction';
          }
        });
      }
    }
  }

  deleteTransaction(transactionId: number): void {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.transactionService.deleteTransaction(transactionId).subscribe({
        next: () => {
          this.success = 'Transaction deleted successfully!';
          this.loadTransactions();
        },
        error: (error) => {
          console.error('Error deleting transaction:', error);
          this.error = 'Failed to delete transaction';
        }
      });
    }
  }

  // Utility methods
  getTransactionTypeClass(type: TransactionType): string {
    switch (type) {
      case TransactionType.Income:
        return 'badge-success';
      case TransactionType.Expense:
        return 'badge-danger';
      case TransactionType.Refund:
        return 'badge-warning';
      case TransactionType.Other:
        return 'badge-info';
      default:
        return 'badge-secondary';
    }
  }

  getTransactionTypeIcon(type: TransactionType): string {
    switch (type) {
      case TransactionType.Income:
        return 'fas fa-arrow-up';
      case TransactionType.Expense:
        return 'fas fa-arrow-down';
      case TransactionType.Refund:
        return 'fas fa-undo';
      case TransactionType.Other:
        return 'fas fa-ellipsis-h';
      default:
        return 'fas fa-question';
    }
  }

  getTransactionTypeText(type: TransactionType): string {
    switch (type) {
      case TransactionType.Income:
        return 'Income';
      case TransactionType.Expense:
        return 'Expense';
      case TransactionType.Refund:
        return 'Refund';
      case TransactionType.Other:
        return 'Other';
      default:
        return 'Unknown';
    }
  }

  getTotalAmount(): number {
    return this.filteredTransactions.reduce((total, transaction) => {
      return transaction.type === TransactionType.Income 
        ? total + transaction.amount 
        : total - transaction.amount;
    }, 0);
  }

  getIncomeTotal(): number {
    return this.filteredTransactions
      .filter(t => t.type === TransactionType.Income)
      .reduce((total, t) => total + t.amount, 0);
  }

  getExpenseTotal(): number {
    return this.filteredTransactions
      .filter(t => t.type === TransactionType.Expense)
      .reduce((total, t) => total + t.amount, 0);
  }

  clearMessages(): void {
    this.error = null;
    this.success = null;
  }

  // Form validation helpers
  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['min']) return `${fieldName} must be at least ${field.errors['min'].min}`;
    }
    return '';
  }
} 