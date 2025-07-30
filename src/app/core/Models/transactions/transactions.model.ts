export enum TransactionType {
  Income = 'Income',
  Expense = 'Expense'
}

export interface Transaction {
  id?: number;
  amount: number;
  date: string;
  description?: string;
  type: TransactionType;
  userId?: string;
  categoryId: number;
}

export interface TransactionCategory {
  id: number;
  name: string;
}

export interface CreateTransactionDTO {
  amount: number;
  date?: Date; // Optional if you want to default to new Date() in code
  updatedAt?: Date | null;
  description?: string;
  type?: TransactionType | null;
  userId: string;
  categoryId: number;
}

export interface CreateCategoryDTO {
  name: string;
}

export interface UpdateTransactionDTO {
  id: number;
  amount: number;
  date: string;
  description?: string;
  type: TransactionType;
  categoryId: number;
}

export interface UpdateCategoryDTO {
  id: number;
  name: string;
}
