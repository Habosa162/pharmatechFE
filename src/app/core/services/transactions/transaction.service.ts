import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../enviroment';
import { Observable } from 'rxjs';
import { 
  CreateTransactionDTO, 
  Transaction,
  TransactionCategory,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  TransactionSearchDto
} from '../../Models/transactions/transactions.model';
import { PagedResult } from '../../Models/Helpers/helperModels.model';


@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = `${environment.apiUrl}/Transaction`;

  constructor(private http: HttpClient) {}

  // Transaction Categories
  getAllTransactionCategories(): Observable<TransactionCategory[]> {
    return this.http.get<TransactionCategory[]>(`${this.apiUrl}/categories`);
  }

  getTransactionCategoryById(categoryId: number): Observable<TransactionCategory> {
    return this.http.get<TransactionCategory>(`${this.apiUrl}/categories/${categoryId}`);
  }

  createTransactionCategory(categoryData: CreateCategoryDTO): Observable<TransactionCategory> {
    return this.http.post<TransactionCategory>(`${this.apiUrl}/categories`, categoryData);
  }

  updateTransactionCategory(categoryId: number, categoryData: UpdateCategoryDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/categories/${categoryId}`, categoryData);
  }

  deleteTransactionCategory(categoryId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${categoryId}`);
  }

  // Transactions
  getAllTransactions(transactionSearchDto : TransactionSearchDto): Observable<PagedResult<Transaction>> {
    return this.http.post<PagedResult<Transaction>>(`${this.apiUrl}`, transactionSearchDto);
  }

  getTransactionById(transactionId: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${transactionId}`);
  }

  getTransactionsByDate(from: Date, to: Date): Observable<Transaction[]> {
    const params = new HttpParams()
      .set('from', from.toISOString())
      .set('to', to.toISOString());

    return this.http.get<Transaction[]>(`${this.apiUrl}/date`, { params });
  }

  createTransaction(transactionData: CreateTransactionDTO): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}`, transactionData);
  }

  updateTransaction(transactionId: number, transactionData: CreateTransactionDTO): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/${transactionId}`, transactionData);
  }

  deleteTransaction(transactionId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${transactionId}`);
  }
}
