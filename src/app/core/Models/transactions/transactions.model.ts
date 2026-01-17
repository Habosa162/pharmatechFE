export enum TransactionType {
  Income = 1,
  Expense = 2,
  Refund = 3,
  Other = 4
}

export interface Transaction {
  id?: number;
  amount: number;
  date: string;
  description?: string;
  type: TransactionType;
  userId?: string;
  // categoryId: number;
}

export interface TransactionCategory {
  id: number;
  name: string;
}
export enum TransactionSortBy {
  Date = 0,
  Amount = 1
}
export enum SortDirection {
  Asc = 0,
  Desc = 1
}
export interface TransactionSearchDto {
  clinicId: number;
  pageNumber: number;
  pageSize: number;
  transcationType?: TransactionType | null;
  categoryId?: number; // Made optional since we're removing category functionality
  fromDate?: Date;
  toDate?: Date;
  sortBy?: TransactionSortBy;
  sortDirection?: SortDirection;
}
export interface CreateTransactionDTO {
  amount: number;
  date?: Date; // Optional if you want to default to new Date() in code
  updatedAt?: Date | null;
  description?: string;
  type?: TransactionType | null;
  userId: string;
  categoryId?: number; // Made optional since we're removing category functionality
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
