import { Injectable } from '@angular/core';
import { environment } from '../enviroment';
import { HttpClient } from '@angular/common/http';
import { 
  CreateInventoryCategoryDTO,
  UpdateInventoryCategoryDTO,
  CreateInventoryItemDTO,
  UpdateInventoryItemDTO,
  CreateInventoryTransactionDTO,
  UpdateInventoryTransactionDTO,
  InventoryCategory,
  InventoryItem,
  InventoryTransaction
} from '../../Interfaces/all';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  private apiUrl = `${environment.apiUrl}/Inventory`;
  constructor(private http:HttpClient) {}

  //____________Inventory Category Service Methods____________
  getAllInventoryCategories() {
    return this.http.get<InventoryCategory[]>(`${this.apiUrl}/categories`);
  }
  
  getInventoryCategoryById(categoryId: number) {
    return this.http.get<InventoryCategory>(`${this.apiUrl}/categories/${categoryId}`);
  }
  
  createInventoryCategory(categoryData: CreateInventoryCategoryDTO) {
    return this.http.post<InventoryCategory>(`${this.apiUrl}/categories`, categoryData);
  }
  
  updateInventoryCategory(categoryId: number, categoryData: UpdateInventoryCategoryDTO) {
    return this.http.put<InventoryCategory>(`${this.apiUrl}/categories/${categoryId}`, categoryData);
  }
  
  deleteInventoryCategory(categoryId: number) {
    return this.http.delete(`${this.apiUrl}/categories/${categoryId}`);
  }

  //____________Inventory Items Service Methods____________
  getAllInventoryItems() {
    return this.http.get<InventoryItem[]>(`${this.apiUrl}/items`);
  }
  
  getInventoryItemById(itemId: number) {
    return this.http.get<InventoryItem>(`${this.apiUrl}/items/${itemId}`);
  }
  
  createInventoryItem(itemData: CreateInventoryItemDTO) {
    return this.http.post<InventoryItem>(`${this.apiUrl}/items`, itemData);
  }
  
  updateInventoryItem(itemId: number, itemData: UpdateInventoryItemDTO) {
    return this.http.put<InventoryItem>(`${this.apiUrl}/items/${itemId}`, itemData);
  }
  
  deleteInventoryItem(itemId: number) {
    return this.http.delete(`${this.apiUrl}/items/${itemId}`);
  }

  //____________Inventory Transactions Service Methods____________
  getAllInventoryTransactions() {
    return this.http.get<InventoryTransaction[]>(`${this.apiUrl}/transactions`);
  }
  
  getInventoryTransactionById(transactionId: number) {
    return this.http.get<InventoryTransaction>(`${this.apiUrl}/transactions/${transactionId}`);
  }
  
  createInventoryTransaction(transactionData: CreateInventoryTransactionDTO) {
    return this.http.post<InventoryTransaction>(`${this.apiUrl}/transactions`, transactionData);
  }
  
  updateInventoryTransaction(transactionId: number, transactionData: UpdateInventoryTransactionDTO) {
    return this.http.put<InventoryTransaction>(`${this.apiUrl}/transactions/${transactionId}`, transactionData);
  }
  
  deleteInventoryTransaction(transactionId: number) {
    return this.http.delete(`${this.apiUrl}/transactions/${transactionId}`);
  }
}
