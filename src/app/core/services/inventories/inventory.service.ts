import { Injectable } from '@angular/core';
import { environment } from '../enviroment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  private apiUrl = `${environment.apiUrl}/Inventory`;
  constructor(private http:HttpClient) {}


  // getInventoryByCategory(categoryId: number) {
  //   return this.http.get(`${this.apiUrl}/category/${categoryId}`);
  // } ????

  //____________Inventory Category Service Methods____________
  getAllInventoryCategories() {
    return this.http.get(`${this.apiUrl}/categories`);
  }
  getInventoryCategoryById(categoryId: number) {
    return this.http.get(`${this.apiUrl}/categories /${categoryId}`);
  }
  createInventoryCategory(categoryData: any) {
    return this.http.post(`${this.apiUrl}/categories`, categoryData);
  }
  updateInventoryCategory(categoryId: number, categoryData: any) {
    return this.http.put(`${this.apiUrl}/categories/${categoryId}`, categoryData);
  }
  deleteInventoryCategory(categoryId: number) {
    return this.http.delete(`${this.apiUrl}/categories /${categoryId}`);
  }
//____________Inventory Items Service Methods____________

  getAllInventoryItems() {
    return this.http.get(`${this.apiUrl}/items`);
  }
  getInventoryItemById(itemId: number) {
    return this.http.get(`${this.apiUrl}/items/${itemId}`);
  }
  createInventoryItem(itemData: any) {
    return this.http.post(`${this.apiUrl}/items`, itemData);
  }
  updateInventoryItem(itemId: number, itemData: any) {
    return this.http.put(`${this.apiUrl}/items/${itemId}`, itemData);
  }
  deleteInventoryItem(itemId: number) {
    return this.http.delete(`${this.apiUrl}/items/${itemId}`);
  }
  //____________Inventory Transactions Service Methods____________

  getAllInventoryTransactions() {
    return this.http.get(`${this.apiUrl}/transactions`);
  }
  getInventoryTransactionById(transactionId: number) {
    return this.http.get(`${this.apiUrl}/transactions/${transactionId}`);
  }
  createInventoryTransaction(transactionData: any) {
    return this.http.post(`${this.apiUrl}/transactions`, transactionData);
  }
  updateInventoryTransaction(transactionId: number, transactionData: any) {
    return this.http.put(`${this.apiUrl}/transactions/${transactionId}`, transactionData);
  }
  deleteInventoryTransaction(transactionId: number) {
    return this.http.delete(`${this.apiUrl}/transactions/${transactionId}`);
  }

}
