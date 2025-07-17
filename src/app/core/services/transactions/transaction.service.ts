import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../enviroment';
import { Observable } from 'rxjs';
import { Transaction,TransactionCategory} from '../../Models/transactions/transactions.model';


@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = `${environment.apiUrl}/Transactions`;

  constructor(private http: HttpClient) {}

  // Transaction Categories
  getAllTransactionCategories(): Observable<TransactionCategory[]> {
    return this.http.get<TransactionCategory[]>(`${this.apiUrl}/categories`);
  }

  getTransactionCategoryById(categoryId: number): Observable<TransactionCategory> {
    return this.http.get<TransactionCategory>(`${this.apiUrl}/categories/${categoryId}`);
  }

  createTransactionCategory(categoryName: string): Observable<TransactionCategory> {
    return this.http.post<TransactionCategory>(`${this.apiUrl}/categories`, categoryName);
  }

  updateTransactionCategory(categoryId: number, categoryData: TransactionCategory): Observable<any> {
    return this.http.put(`${this.apiUrl}/categories/${categoryId}`, categoryData);
  }

  deleteTransactionCategory(categoryId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${categoryId}`);
  }

  // Transactions
  getAllTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}`);
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

  createTransaction(transactionData: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}`, transactionData);
  }

  updateTransaction(transactionId: number, transactionData: Transaction): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/${transactionId}`, transactionData);
  }

  deleteTransaction(transactionId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${transactionId}`);
  }
}
