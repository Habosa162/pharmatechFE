import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../../services/inventories/inventory.service';
import { 
  InventoryCategory,
  InventoryItem,
  InventoryTransaction,
  InventoryTransactionType,
  CreateInventoryCategoryDTO,
  UpdateInventoryCategoryDTO,
  CreateInventoryItemDTO,
  UpdateInventoryItemDTO,
  CreateInventoryTransactionDTO
} from '../../Interfaces/all';

@Component({
  selector: 'app-inventory',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export class InventoryComponent implements OnInit {
  // Data properties
  categories: InventoryCategory[] = [];
  items: InventoryItem[] = [];
  transactions: InventoryTransaction[] = [];
  
  // UI state
  activeTab: 'categories' | 'items' | 'transactions' = 'categories';
  loading = false;
  error: string | null = null;
  success: string | null = null;

  // Modal states
  showCategoryModal = false;
  showItemModal = false;
  showTransactionModal = false;

  // Forms
  categoryForm: FormGroup;
  itemForm: FormGroup;
  transactionForm: FormGroup;

  // Edit states
  editingCategory: InventoryCategory | null = null;
  editingItem: InventoryItem | null = null;

  // Enums for template
  InventoryTransactionType = InventoryTransactionType;

  constructor(
    private inventoryService: InventoryService,
    private formBuilder: FormBuilder
  ) {
    this.categoryForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['']
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
    this.loadAllData();
  }

  loadAllData(): void {
    this.loadCategories();
    this.loadItems();
    this.loadTransactions();
  }

  loadCategories(): void {
    this.loading = true;
    this.inventoryService.getAllInventoryCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.error = 'Failed to load categories';
        this.loading = false;
      }
    });
  }

  loadItems(): void {
    this.loading = true;
    this.inventoryService.getAllInventoryItems().subscribe({
      next: (items) => {
        this.items = items;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading items:', error);
        this.error = 'Failed to load items';
        this.loading = false;
      }
    });
  }

  loadTransactions(): void {
    this.loading = true;
    this.inventoryService.getAllInventoryTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.error = 'Failed to load transactions';
        this.loading = false;
      }
    });
  }

  // Tab management
  setActiveTab(tab: 'categories' | 'items' | 'transactions'): void {
    this.activeTab = tab;
    this.clearMessages();
  }

  // Category management
  showAddCategoryModal(): void {
    this.editingCategory = null;
    this.categoryForm.reset();
    this.showCategoryModal = true;
  }

  showEditCategoryModal(category: InventoryCategory): void {
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
        // Update existing category
        const updateData: UpdateInventoryCategoryDTO = {
          id: this.editingCategory.id,
          name: this.categoryForm.value.name,
          description: this.categoryForm.value.description
        };
        
        this.inventoryService.updateInventoryCategory(this.editingCategory.id, updateData).subscribe({
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
        // Create new category
        const createData: CreateInventoryCategoryDTO = {
          name: this.categoryForm.value.name,
          description: this.categoryForm.value.description
        };
        
        this.inventoryService.createInventoryCategory(createData).subscribe({
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

  showEditItemModal(item: InventoryItem): void {
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
          id: this.editingItem.id,
          name: this.itemForm.value.name,
          description: this.itemForm.value.description,
          inventoryCategoryId: this.itemForm.value.inventoryCategoryId,
          stockQuantity: this.itemForm.value.stockQuantity,
          purchasePrice: this.itemForm.value.purchasePrice,
          expirationDate: this.itemForm.value.expirationDate
        };
        
        this.inventoryService.updateInventoryItem(this.editingItem.id, updateData).subscribe({
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
    if (this.transactionForm.valid) {
      const createData: CreateInventoryTransactionDTO = {
        quantity: this.transactionForm.value.quantity,
        description: this.transactionForm.value.description,
        date: new Date().toISOString(),
        transactionType: this.transactionForm.value.transactionType,
        inventoryItemId: this.transactionForm.value.inventoryItemId,
        userId: 'current-user-id' // You might want to get this from auth service
      };
      
      this.inventoryService.createInventoryTransaction(createData).subscribe({
        next: () => {
          this.success = 'Transaction recorded successfully!';
          this.closeTransactionModal();
          this.loadTransactions();
          this.loadItems(); // Refresh items to update quantities
        },
        error: (error) => {
          console.error('Error creating transaction:', error);
          this.error = 'Failed to record transaction';
        }
      });
    }
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
} 