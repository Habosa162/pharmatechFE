import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TransactionService } from '../../../services/transactions/transaction.service';

export enum TranscationType {
  Income = 'Income',
  Expense = 'Expense'
}

interface Transaction {
  id?: number;
  amount: number;
  date: string;
  updatedAt?: string;
  description?: string;
  type: TranscationType;
  userId?: string;
  categoryId: number;
}

interface TransactionCategory {
  id: number;
  name: string;
}

@Component({
  selector: 'app-transactions-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transactions-list.component.html',
  styleUrls: ['./transactions-list.component.css'],
  providers: [DatePipe]
})
export class TransactionsListComponent implements OnInit {

  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  categories: TransactionCategory[] = [];
  transactionForm!: FormGroup;
  searchForm!: FormGroup;
  dateRangeForm!: FormGroup;

  transactionTypes = Object.values(TranscationType);
  showCreateForm = false;
  showDateRangeSearch = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadCategories();
    this.loadTransactions();
    this.searchForm.valueChanges.subscribe(() => this.filterTransactions());
  }

  initForms(): void {
    this.transactionForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(0.01)]],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      description: [''],
      type: [TranscationType.Expense, Validators.required],
      categoryId: ['', Validators.required]
    });

    this.searchForm = this.fb.group({
      date: [''],
      categoryId: [''],
      description: ['']
    });

    this.dateRangeForm = this.fb.group({
      from: ['', Validators.required],
      to: ['', Validators.required]
    });
  }

  loadCategories(): void {
    this.isLoading = true;
    this.transactionService.getAllTransactionCategories().subscribe({
      next: (categories: any) => {
        this.categories = categories;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.isLoading = false;
      }
    });
  }

  loadTransactions(): void {
    this.isLoading = true;
    this.transactionService.getAllTransactions().subscribe({
      next: (transactions: any) => {
        this.transactions = transactions;
        this.filteredTransactions = transactions;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading transactions:', err);
        this.isLoading = false;
      }
    });
  }

  loadTransactionsByDateRange(): void {
    if (this.dateRangeForm.invalid) return;

    const { from, to } = this.dateRangeForm.value;
    this.isLoading = true;

    this.transactionService.getTransactionsByDate(from, to).subscribe({
      next: (transactions: any) => {
        this.transactions = transactions;
        this.filteredTransactions = transactions;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading by date range:', err);
        this.isLoading = false;
      }
    });
  }

  createTransaction(): void {
    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formData = this.transactionForm.value;

    this.transactionService.createTransaction(formData).subscribe({
      next: (newTransaction: any) => {
        this.transactions.unshift(newTransaction);
        this.filterTransactions();
        this.transactionForm.reset({
          date: new Date().toISOString().split('T')[0],
          type: TranscationType.Expense
        });
        this.showCreateForm = false;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error creating transaction:', err);
        this.isLoading = false;
      }
    });
  }

  filterTransactions(): void {
    const { date, categoryId, description } = this.searchForm.value;
    const searchDate = date ? new Date(date) : null;

    this.filteredTransactions = this.transactions.filter(t => {
      const tDate = new Date(t.date);
      const matchDate = !searchDate || (
        tDate.getFullYear() === searchDate.getFullYear() &&
        tDate.getMonth() === searchDate.getMonth() &&
        tDate.getDate() === searchDate.getDate()
      );

      const matchCategory = !categoryId || t.categoryId === +categoryId;
      const matchDescription = !description || (t.description?.toLowerCase().includes(description.toLowerCase()));

      return matchDate && matchCategory && matchDescription;
    });
  }

  getCategoryName(id: number): string {
    return this.categories.find(c => c.id === id)?.name || 'Unknown';
  }

  formatDate(dateStr: string): string {
    return this.datePipe.transform(dateStr, 'yyyy-MM-dd') || '';
  }

  resetSearch(): void {
    this.searchForm.reset();
    this.loadTransactions();
  }

  toggleDateRangeSearch(): void {
    this.showDateRangeSearch = !this.showDateRangeSearch;
    if (!this.showDateRangeSearch) {
      this.loadTransactions();
    }
  }
}
