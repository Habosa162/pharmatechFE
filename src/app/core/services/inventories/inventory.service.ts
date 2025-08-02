import { Injectable } from '@angular/core';
import { environment } from '../enviroment';
import { HttpClient } from '@angular/common/http';
import { 
  CreateInventoryCategoryDTO,
  CreateInventoryItemDTO,
  UpdateInventoryItemDTO,
  CreateInventoryTransactionDto,
  UpdateInventoryTransactionDTO,
  InventoryCategory,
  InventoryItem,
  InventoryTransaction,
  InventoryCategoryViewDTO,
  InventoryItemViewDTO
} from '../../Interfaces/all';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  private apiUrl = `${environment.apiUrl}/Inventory`;
  constructor(private http:HttpClient) {}

  //____________Inventory Category Service Methods____________
  getAllInventoryCategories():Observable<InventoryCategoryViewDTO[]> {
    return this.http.get<InventoryCategoryViewDTO[]>(`${this.apiUrl}/categories`);
  }
  
  getInventoryCategoriesByClinic(clinicId: number): Observable<InventoryCategoryViewDTO[]> {
    return this.http.get<InventoryCategoryViewDTO[]>(`${this.apiUrl}/categories/clinic/${clinicId}`);
  }
  
  getInventoryCategoryById(categoryId: number): Observable<InventoryCategoryViewDTO> {
    return this.http.get<InventoryCategoryViewDTO>(`${this.apiUrl}/categories/${categoryId}`);
  }
  
  createInventoryCategory(categoryName: string): Observable<InventoryCategoryViewDTO> {
    return this.http.post<InventoryCategoryViewDTO>(`${this.apiUrl}/categories`, `"${categoryName}"`, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  updateInventoryCategory(categoryId: number, categoryName: string): Observable<InventoryCategoryViewDTO> {
    return this.http.put<InventoryCategoryViewDTO>(`${this.apiUrl}/categories/${categoryId}`, `"${categoryName}"`, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  deleteInventoryCategory(categoryId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${categoryId}`);
  }

  //____________Inventory Items Service Methods____________
  getAllInventoryItems(): Observable<InventoryItemViewDTO[]> {
    return this.http.get<InventoryItemViewDTO[]>(`${this.apiUrl}/items`);
  }
  
  getInventoryItemsByClinic(clinicId: number): Observable<InventoryItemViewDTO[]> {
    return this.http.get<InventoryItemViewDTO[]>(`${this.apiUrl}/items/clinic/${clinicId}`);
  }
  
  getInventoryItemById(itemId: number): Observable<InventoryItemViewDTO> {
    return this.http.get<InventoryItemViewDTO>(`${this.apiUrl}/items/${itemId}`);
  }
  
  createInventoryItem(itemData: CreateInventoryItemDTO): Observable<InventoryItemViewDTO> {
    return this.http.post<InventoryItemViewDTO>(`${this.apiUrl}/items`, itemData);
  }
  
  updateInventoryItem(itemId: number, itemData: UpdateInventoryItemDTO): Observable<InventoryItemViewDTO> {
    return this.http.put<InventoryItemViewDTO>(`${this.apiUrl}/items/${itemId}`, itemData);
  }
  
  deleteInventoryItem(itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/items/${itemId}`);
  }

  //____________Inventory Transactions Service Methods____________
  getAllInventoryTransactions(): Observable<InventoryTransaction[]> {
    return this.http.get<InventoryTransaction[]>(`${this.apiUrl}/transactions`);
  }
  
  getInventoryTransactionsByClinic(clinicId: number): Observable<InventoryTransaction[]> {
    return this.http.get<InventoryTransaction[]>(`${this.apiUrl}/transactions/clinic/${clinicId}`);
  }
  
  getInventoryTransactionById(transactionId: number): Observable<InventoryTransaction> {
    return this.http.get<InventoryTransaction>(`${this.apiUrl}/transactions/${transactionId}`);
  }
  
    createInventoryTransaction(transactionData: CreateInventoryTransactionDto): Observable<InventoryTransaction> {
      console.log('Service: Sending transaction data:', transactionData);
      return this.http.post<InventoryTransaction>(`${this.apiUrl}/transactions`, transactionData, {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  
  updateInventoryTransaction(transactionId: number, transactionData: UpdateInventoryTransactionDTO): Observable<InventoryTransaction> {
    return this.http.put<InventoryTransaction>(`${this.apiUrl}/transactions/${transactionId}`, transactionData);
  }
  
  deleteInventoryTransaction(transactionId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/transactions/${transactionId}`);
  }
}
