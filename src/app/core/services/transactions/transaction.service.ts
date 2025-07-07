import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../enviroment';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  private apiUrl = `${environment.apiUrl}/Transactions`;
  constructor(private http:HttpClient) { }

  //____________Transaction Categories Methods____________
  getAllTransactionCaetgories() {
    return this.http.get(`${this.apiUrl}/categories`);
  }
  getTransactionCategoryById(categoryId: number) {
    return this.http.get(`${this.apiUrl}/categories/${categoryId}`);
  }
  createTransactionCategory(categoryData: any) {
    return this.http.post(`${this.apiUrl}/categories`, categoryData);
  }
  updateTransactionCategory(categoryId: number, categoryData: any) {
    return this.http.put(`${this.apiUrl}/categories/${categoryId}`, categoryData);
  }
  deleteTransactionCategory(categoryId: number) {
    return this.http.delete(`${this.apiUrl}/categories/${categoryId}`);
  }
  //____________Transaction Methods____________
  getAllTransactions() {
    return this.http.get(`${this.apiUrl}`);
  }
  getTransactionById(transactionId: number) {
    return this.http.get(`${this.apiUrl}/${transactionId}`);
  }
  getTransactionsByDate(from: Date, to: Date) {
    return this.http.get(`${this.apiUrl}/date/${from}/${to}`);
  }
  createTransaction(transactionData: any) {
    return this.http.post(`${this.apiUrl}`, transactionData);
  }
  updateTransaction(transactionId: number, transactionData: any) {
    return this.http.put(`${this.apiUrl}/${transactionId}`, transactionData);
  }
  deleteTransaction(transactionId: number) {
    return this.http.delete(`${this.apiUrl}/${transactionId}`);
  }


}
