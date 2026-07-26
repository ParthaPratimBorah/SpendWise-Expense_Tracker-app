export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface Expense {
  _id: string;
  amount: number;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  user: string; // user UID
  createdAt?: string;
  updatedAt?: string;
}

export interface Budget {
  _id: string;
  category: string;
  limit: number;
  rolloverEnabled?: boolean;
  user: string; // user UID
  createdAt?: string;
  updatedAt?: string;
}

export type ExpensePayload = Omit<Expense, '_id' | 'user' | 'createdAt' | 'updatedAt'>;
export type BudgetPayload = Omit<Budget, '_id' | 'user' | 'createdAt' | 'updatedAt'>;
