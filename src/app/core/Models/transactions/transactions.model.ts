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
