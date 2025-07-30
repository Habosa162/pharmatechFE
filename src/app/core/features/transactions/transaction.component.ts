import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TransactionService } from '../../services/transactions/transaction.service';
import { 
  Transaction, 
  TransactionCategory, 
  TransactionType,
  CreateTransactionDTO,
  CreateCategoryDTO,
  UpdateTransactionDTO,
  UpdateCategoryDTO
} from '../../Models/transactions/transactions.model';

@Component({
  selector: 'app-transaction',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.css'
})
export class TransactionComponent implements OnInit {
  // Data properties
  transactions: Transaction[] = [];
  categories: TransactionCategory[] = [];
  filteredTransactions: Transaction[] = [];
  
  // UI state
  activeTab: 'transactions' | 'categories' = 'transactions';
  loading = false;
  error: string | null = null;
  success: string | null = null;

  // Filter properties
  selectedCategory = 'all';
  selectedType = 'all';
  dateFrom = '';
  dateTo = '';

  // Modal states
  showTransactionModal = false;
  showCategoryModal = false;

  // Forms
  transactionForm: FormGroup;
  categoryForm: FormGroup;

  // Edit states
  editingTransaction: Transaction | null = null;
  editingCategory: TransactionCategory | null = null;

  // Enums for template
  TransactionType = TransactionType;

  constructor(
    private transactionService: TransactionService,
    private formBuilder: FormBuilder
  ) {
    this.transactionForm = this.formBuilder.group({
      amount: [0, [Validators.required, Validators.min(0.01)]],
      description: [''],
      type: [TransactionType.Income, [Validators.required]],
      categoryId: ['', [Validators.required]],
      date: [new Date().toISOString().split('T')[0], [Validators.required]]
    });

    this.categoryForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loadTransactions();
    this.loadCategories();
  }

  loadTransactions(): void {
    this.loading = true;
    this.transactionService.getAllTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
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

  loadCategories(): void {
    this.transactionService.getAllTransactionCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.error = 'Failed to load categories';
      }
    });
  }

  // Filter methods
  applyFilters(): void {
    let filtered = [...this.transactions];

    // Filter by category
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.categoryId === +this.selectedCategory);
    }

    // Filter by type
    if (this.selectedType !== 'all') {
      filtered = filtered.filter(t => t.type === this.selectedType);
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
    this.selectedCategory = 'all';
    this.selectedType = 'all';
    this.dateFrom = '';
    this.dateTo = '';
    this.applyFilters();
  }

  // Tab management
  setActiveTab(tab: 'transactions' | 'categories'): void {
    this.activeTab = tab;
    this.clearMessages();
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
          type: this.transactionForm.value.type,
          userId: 'current-user-id', // You might want to get this from auth service
          categoryId: this.transactionForm.value.categoryId
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
          type: this.transactionForm.value.type,
          userId: 'current-user-id', // You might want to get this from auth service
          categoryId: this.transactionForm.value.categoryId
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

  // Category management
  showAddCategoryModal(): void {
    this.editingCategory = null;
    this.categoryForm.reset();
    this.showCategoryModal = true;
  }

  showEditCategoryModal(category: TransactionCategory): void {
    this.editingCategory = category;
    this.categoryForm.patchValue(category);
    this.showCategoryModal = true;
  }

  closeCategoryModal(): void {
    this.showCategoryModal = false;
    this.editingCategory = null;
    this.categoryForm.reset();
  }

  saveCategory(): void {
    if (this.categoryForm.valid) {
      const categoryName = this.categoryForm.value.name;

      if (this.editingCategory) {
        // Update existing category
        const updateData: UpdateCategoryDTO = {
          id: this.editingCategory.id,
          name: categoryName
        };
        
        this.transactionService.updateTransactionCategory(this.editingCategory.id, updateData).subscribe({
          next: () => {
            this.success = 'Category updated successfully!';
            this.closeCategoryModal();
            this.loadCategories();
          },
          error: (error) => {
            console.error('Error updating category:', error);
            this.error = 'Failed to update category';
          }
        });
      } else {
        // Create new category using DTO
        const createData: CreateCategoryDTO = {
          name: categoryName
        };
        
        this.transactionService.createTransactionCategory(createData).subscribe({
          next: () => {
            this.success = 'Category created successfully!';
            this.closeCategoryModal();
            this.loadCategories();
          },
          error: (error) => {
            console.error('Error creating category:', error);
            this.error = 'Failed to create category';
          }
        });
      }
    }
  }

  deleteCategory(categoryId: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.transactionService.deleteTransactionCategory(categoryId).subscribe({
        next: () => {
          this.success = 'Category deleted successfully!';
          this.loadCategories();
        },
        error: (error) => {
          console.error('Error deleting category:', error);
          this.error = 'Failed to delete category';
        }
      });
    }
  }

  // Utility methods
  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  }

  getTransactionTypeClass(type: TransactionType): string {
    return type === TransactionType.Income ? 'badge-success' : 'badge-danger';
  }

  getTransactionTypeIcon(type: TransactionType): string {
    return type === TransactionType.Income ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
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