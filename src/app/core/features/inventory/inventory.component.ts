import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../../services/inventories/inventory.service';
import { ClinicService } from '../../services/clinics/clinic.service';
import { 
  InventoryCategory,
  InventoryItem,
  InventoryTransaction,
  InventoryTransactionType,
  CreateInventoryCategoryDTO,
  CreateInventoryItemDTO,
  UpdateInventoryItemDTO,
  CreateInventoryTransactionDto,
  InventoryCategoryViewDTO,
  InventoryItemViewDTO,
  ClinicViewDTO,
  Clinic
} from '../../Interfaces/all';

@Component({
  selector: 'app-inventory',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export class InventoryComponent implements OnInit {
  // Data properties
  categories: InventoryCategoryViewDTO[] = [];
  items: InventoryItemViewDTO[] = [];
  transactions: InventoryTransaction[] = [];
  clinics: ClinicViewDTO[] = [];
  
  // UI state
  activeTab: 'categories' | 'items' | 'transactions' = 'categories';
  loading = false;
  error: string | null = null;
  success: string | null = null;
  selectedClinicId: number | null = null;
  showFabMenu = false;

  // Modal states
  showCategoryModal = false;
  showItemModal = false;
  showTransactionModal = false;

  // Forms
  categoryForm: FormGroup;
  itemForm: FormGroup;
  transactionForm: FormGroup;

  // Edit states
  editingCategory: InventoryCategoryViewDTO | null = null;
  editingItem: InventoryItemViewDTO | null = null;

  // Enums for template
  InventoryTransactionType = InventoryTransactionType;

  constructor(
    private inventoryService: InventoryService,
    private clinicService: ClinicService,
    private formBuilder: FormBuilder
  ) {
    this.categoryForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]]
    });

    this.itemForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      inventoryCategoryId: ['', [Validators.required]],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      purchasePrice: [0, [Validators.required, Validators.min(0)]],
      expirationDate: ['', [Validators.required]]
    });

    this.transactionForm = this.formBuilder.group({
      inventoryItemId: ['', [Validators.required]],
      transactionType: [InventoryTransactionType.Addition, [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadClinics();
  }

  loadClinics(): void {
    this.clinicService.getAllClinics().subscribe({
      next: (clinics) => {
        this.clinics = clinics || [];
        // Load other data after clinics are loaded
        this.loadAllData();
      },
      error: (error) => {
        console.error('Error loading clinics:', error);
        this.error = 'Failed to load clinics';
        this.clinics = [];
        // Still load other data even if clinics fail
        this.loadAllData();
      }
    });
  }

  loadAllData(): void {
    this.loadCategories();
    this.loadItems();
    this.loadTransactions();
  }

  onClinicChange(): void {
    this.loadAllData();
  }

  loadCategories(): void {
    this.loading = true;
    const request = this.inventoryService.getAllInventoryCategories();
    
    request.subscribe({
      next: (categories: InventoryCategoryViewDTO[]) => {
        console.log('Categories loaded:', categories);
        this.categories = categories ;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading categories:', error);
        this.error = 'Failed to load categories';
        this.loading = false;
        this.categories = [];
      }
    });
  }

  loadItems(): void {
    this.loading = true;
    const request = this.inventoryService.getAllInventoryItems();
    
    request.subscribe({
      next: (items: InventoryItemViewDTO[]) => {
        this.items = items || [];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading items:', error);
        this.error = 'Failed to load items';
        this.loading = false;
        this.items = [];
      }
    });
  }

  loadTransactions(): void {
    this.loading = true;
    const request = this.inventoryService.getAllInventoryTransactions();
    
    request.subscribe({
      next: (transactions: InventoryTransaction[]) => {
        this.transactions = transactions || [];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading transactions:', error);
        this.error = 'Failed to load transactions';
        this.loading = false;
        this.transactions = [];
      }
    });
  }

  // Tab management
  setActiveTab(tab: 'categories' | 'items' | 'transactions'): void {
    this.activeTab = tab;
    console.log('Active tab:', this.activeTab);
    this.clearMessages();
  }

  // Category management
  showAddCategoryModal(): void {
    this.editingCategory = null;
    this.categoryForm.reset();
    this.showCategoryModal = true;
  }

  showEditCategoryModal(category: InventoryCategoryViewDTO): void {
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
      if (this.editingCategory) {
        // Update existing category - just send the name
        const categoryName = this.categoryForm.value.name;
        
        this.inventoryService.updateInventoryCategory(this.editingCategory.id, categoryName).subscribe({
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
        // Create new category - just send the name
        const categoryName = this.categoryForm.value.name;
        
        this.inventoryService.createInventoryCategory(categoryName).subscribe({
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
      this.inventoryService.deleteInventoryCategory(categoryId).subscribe({
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

  // Item management
  showAddItemModal(): void {
    this.editingItem = null;
    this.itemForm.reset();
    this.showItemModal = true;
  }

  showEditItemModal(item: InventoryItemViewDTO): void {
    this.editingItem = item;
    this.itemForm.patchValue({
      name: item.name,
      description: item.description,
      inventoryCategoryId: item.inventoryCategoryId,
      stockQuantity: item.stockQuantity,
      purchasePrice: item.purchasePrice,
      expirationDate: item.expirationDate
    });
    this.showItemModal = true;
  }

  closeItemModal(): void {
    this.showItemModal = false;
    this.editingItem = null;
    this.itemForm.reset();
  }

  saveItem(): void {
    if (this.itemForm.valid) {
      if (this.editingItem) {
        // Update existing item
        const updateData: UpdateInventoryItemDTO = {
          id: this.editingItem.id!,
          name: this.itemForm.value.name,
          description: this.itemForm.value.description,
          inventoryCategoryId: this.itemForm.value.inventoryCategoryId,
          stockQuantity: this.itemForm.value.stockQuantity,
          purchasePrice: this.itemForm.value.purchasePrice,
          expirationDate: this.itemForm.value.expirationDate
        };
        
        this.inventoryService.updateInventoryItem(this.editingItem.id!, updateData).subscribe({
          next: () => {
            this.success = 'Item updated successfully!';
            this.closeItemModal();
            this.loadItems();
          },
          error: (error) => {
            console.error('Error updating item:', error);
            this.error = 'Failed to update item';
          }
        });
      } else {
        // Create new item
        const createData: CreateInventoryItemDTO = {
          name: this.itemForm.value.name,
          description: this.itemForm.value.description,
          inventoryCategoryId: this.itemForm.value.inventoryCategoryId,
          stockQuantity: this.itemForm.value.stockQuantity,
          purchasePrice: this.itemForm.value.purchasePrice,
          expirationDate: this.itemForm.value.expirationDate
        };
        
        this.inventoryService.createInventoryItem(createData).subscribe({
          next: () => {
            this.success = 'Item created successfully!';
            this.closeItemModal();
            this.loadItems();
          },
          error: (error) => {
            console.error('Error creating item:', error);
            this.error = 'Failed to create item';
          }
        });
      }
    }
  }

  deleteItem(itemId: number): void {
    if (confirm('Are you sure you want to delete this item?')) {
      this.inventoryService.deleteInventoryItem(itemId).subscribe({
        next: () => {
          this.success = 'Item deleted successfully!';
          this.loadItems();
        },
        error: (error) => {
          console.error('Error deleting item:', error);
          this.error = 'Failed to delete item';
        }
      });
    }
  }

  // Transaction management
  showAddTransactionModal(): void {
    this.transactionForm.reset();
    this.transactionForm.patchValue({ 
      transactionType: InventoryTransactionType.Addition, 
      quantity: 1 
    });
    this.showTransactionModal = true;
  }

  closeTransactionModal(): void {
    this.showTransactionModal = false;
    this.transactionForm.reset();
  }

  saveTransaction(): void {
    console.log('=== TRANSACTION CREATION DEBUG ===');
    console.log('Form valid:', this.transactionForm.valid);
    console.log('Form values:', this.transactionForm.value);
    console.log('Form errors:', this.transactionForm.errors);
    
    // Check individual field errors
    Object.keys(this.transactionForm.controls).forEach(key => {
      const control = this.transactionForm.get(key);
      if (control && control.errors) {
        console.log(`Field ${key} errors:`, control.errors);
      }
    });
    
    if (this.transactionForm.valid) {
      // Get a proper user ID - you might want to get this from an auth service
      const userId = this.getCurrentUserId(); // You'll need to implement this method
      
      // Validate required fields
      if (!this.transactionForm.value.inventoryItemId) {
        this.error = 'Please select an inventory item';
        return;
      }
      
      if (!this.transactionForm.value.quantity || this.transactionForm.value.quantity <= 0) {
        this.error = 'Please enter a valid quantity';
        return;
      }
      
      if (!this.transactionForm.value.transactionType) {
        this.error = 'Please select a transaction type';
        return;
      }
      
      const createData: CreateInventoryTransactionDto = {
        quantity: this.transactionForm.value.quantity,
        description: this.transactionForm.value.description || '',
        transactionType: Number(this.transactionForm.value.transactionType),
        inventoryItemId: this.transactionForm.value.inventoryItemId,
        // userId: userId
      };
      
      console.log('=== FINAL TRANSACTION DATA ===');
      console.log('Complete DTO object:', createData);
      console.log('DTO type:', typeof createData);
      console.log('DTO keys:', Object.keys(createData));
      console.log('TransactionType value:', createData.transactionType, 'Type:', typeof createData.transactionType);
      console.log('API URL:', `${this.inventoryService['apiUrl']}/transactions`);
      
      this.inventoryService.createInventoryTransaction(createData).subscribe({
        next: (response) => {
          console.log('Transaction created successfully:', response);
          this.success = 'Transaction recorded successfully!';
          this.closeTransactionModal();
          this.loadTransactions();
          this.loadItems(); // Refresh items to update quantities
        },
        error: (error) => {
          console.error('Error creating transaction:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error,
            url: error.url
          });
          this.error = 'Failed to record transaction';
        }
      });
    } else {
      console.log('Form is invalid, cannot submit');
    }
  }

  // Helper method to get current user ID - you'll need to implement this based on your auth system
  private getCurrentUserId(): string {
    // TODO: Replace this with actual user ID from your authentication service
    // For now, using a placeholder - you should get this from your auth service
    return 'current-user-id'; // Replace with actual user ID
  }

  // Test method to debug transaction creation with minimal data
  testTransactionCreation(): void {
    console.log('=== TESTING MINIMAL TRANSACTION DTO ===');
    
    const testData: CreateInventoryTransactionDto = {
      quantity: 1,
      description: 'Test transaction',
      transactionType: InventoryTransactionType.Addition, // This is already a number (1)
      inventoryItemId: 1, // Assuming you have an item with ID 1
      // userId: 'test-user-id'
    };
    
    console.log('Test DTO:', testData);
    console.log('TransactionType value:', testData.transactionType, 'Type:', typeof testData.transactionType);
    
    this.inventoryService.createInventoryTransaction(testData).subscribe({
      next: (response) => {
        console.log('Test transaction created successfully:', response);
        this.success = 'Test transaction created!';
      },
      error: (error) => {
        console.error('Test transaction failed:', error);
        this.error = 'Test transaction failed: ' + (error.error?.message || error.message);
      }
    });
  }

  // Utility methods
  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  }

  getItemName(itemId: number): string {
    const item = this.items.find(i => i.id === itemId);
    return item ? item.name : 'Unknown Item';
  }

  getClinicName(clinicId: number): string {
    if (!clinicId || clinicId === 0) {
      return 'Unknown Clinic';
    }
    const clinic = this.clinics.find(c => c.id === clinicId);
    return clinic ? clinic.name : 'Unknown Clinic';
  }

  getTransactionTypeText(type: InventoryTransactionType): string {
    switch (type) {
      case InventoryTransactionType.Addition: return 'Addition';
      case InventoryTransactionType.Deduction: return 'Deduction';
      case InventoryTransactionType.Adjustment: return 'Adjustment';
      case InventoryTransactionType.Transfer: return 'Transfer';
      case InventoryTransactionType.Return: return 'Return';
      case InventoryTransactionType.Expiration: return 'Expiration';
      case InventoryTransactionType.Damage: return 'Damage';
      case InventoryTransactionType.Purchase: return 'Purchase';
      case InventoryTransactionType.Other: return 'Other';
      default: return 'Unknown';
    }
  }

  getTransactionTypeClass(type: InventoryTransactionType): string {
    switch (type) {
      case InventoryTransactionType.Addition:
      case InventoryTransactionType.Purchase:
      case InventoryTransactionType.Return:
        return 'badge-success';
      case InventoryTransactionType.Deduction:
      case InventoryTransactionType.Expiration:
      case InventoryTransactionType.Damage:
        return 'badge-danger';
      default:
        return 'badge-warning';
    }
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

  // Floating Action Button
  toggleFabMenu(): void {
    this.showFabMenu = !this.showFabMenu;
  }

  // Getter for active items (not deleted)
  get activeItems(): InventoryItemViewDTO[] {
    return this.items.filter(item => !item.isDeleted);
  }

  // Helper method to get active tab title
  getActiveTabTitle(): string {
    switch (this.activeTab) {
      case 'categories':
        return 'Categories';
      case 'items':
        return 'Items';
      case 'transactions':
        return 'Transactions';
      default:
        return 'Inventory Management';
    }
  }
} 