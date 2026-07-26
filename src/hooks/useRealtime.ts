import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { isFirebaseEnabled, db, auth } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc
} from 'firebase/firestore';
import type { Expense, Budget, ExpensePayload, BudgetPayload } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Custom reactive store event bus for offline local storage state
const LOCAL_STORAGE_EVENT = 'expense_vault_db_change';
const triggerChange = () => window.dispatchEvent(new Event(LOCAL_STORAGE_EVENT));

// CRUD operations
export const addExpense = async (userId: string, payload: ExpensePayload) => {
  if (isFirebaseEnabled && db) {
    const path = 'expenses';
    try {
      await addDoc(collection(db, path), {
        ...payload,
        user: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  } else {
    const current: Expense[] = JSON.parse(localStorage.getItem('expense_vault_expenses') || '[]');
    const newExpense: Expense = {
      _id: 'exp_' + Math.random().toString(36).substring(2, 11),
      ...payload,
      user: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    current.push(newExpense);
    localStorage.setItem('expense_vault_expenses', JSON.stringify(current));
    triggerChange();
  }
};

export const updateExpense = async (expenseId: string, payload: ExpensePayload) => {
  if (isFirebaseEnabled && db) {
    const path = `expenses/${expenseId}`;
    try {
      await updateDoc(doc(db, 'expenses', expenseId), {
        ...payload,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  } else {
    const current: Expense[] = JSON.parse(localStorage.getItem('expense_vault_expenses') || '[]');
    const index = current.findIndex(e => e._id === expenseId);
    if (index !== -1) {
      current[index] = {
        ...current[index],
        ...payload,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('expense_vault_expenses', JSON.stringify(current));
      triggerChange();
    }
  }
};

export const deleteExpense = async (expenseId: string) => {
  if (isFirebaseEnabled && db) {
    const path = `expenses/${expenseId}`;
    try {
      await deleteDoc(doc(db, 'expenses', expenseId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  } else {
    let current: Expense[] = JSON.parse(localStorage.getItem('expense_vault_expenses') || '[]');
    current = current.filter(e => e._id !== expenseId);
    localStorage.setItem('expense_vault_expenses', JSON.stringify(current));
    triggerChange();
  }
};

export const addBudget = async (userId: string, payload: BudgetPayload) => {
  if (isFirebaseEnabled && db) {
    const path = 'budgets';
    try {
      await addDoc(collection(db, path), {
        ...payload,
        user: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  } else {
    const current: Budget[] = JSON.parse(localStorage.getItem('expense_vault_budgets') || '[]');
    const newBudget: Budget = {
      _id: 'bud_' + Math.random().toString(36).substring(2, 11),
      ...payload,
      user: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    current.push(newBudget);
    localStorage.setItem('expense_vault_budgets', JSON.stringify(current));
    triggerChange();
  }
};

export const updateBudget = async (budgetId: string, payload: BudgetPayload) => {
  if (isFirebaseEnabled && db) {
    const path = `budgets/${budgetId}`;
    try {
      await updateDoc(doc(db, 'budgets', budgetId), {
        ...payload,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  } else {
    const current: Budget[] = JSON.parse(localStorage.getItem('expense_vault_budgets') || '[]');
    const index = current.findIndex(b => b._id === budgetId);
    if (index !== -1) {
      current[index] = {
        ...current[index],
        ...payload,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('expense_vault_budgets', JSON.stringify(current));
      triggerChange();
    }
  }
};

export const deleteBudget = async (budgetId: string) => {
  if (isFirebaseEnabled && db) {
    const path = `budgets/${budgetId}`;
    try {
      await deleteDoc(doc(db, 'budgets', budgetId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  } else {
    let current: Budget[] = JSON.parse(localStorage.getItem('expense_vault_budgets') || '[]');
    current = current.filter(b => b._id !== budgetId);
    localStorage.setItem('expense_vault_budgets', JSON.stringify(current));
    triggerChange();
  }
};

// Real-time hooks
export const useRealtimeExpenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    if (isFirebaseEnabled && db) {
      const q = query(collection(db, 'expenses'), where('user', '==', user.uid));
      const path = 'expenses';
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: Expense[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            _id: doc.id,
            ...data,
          } as Expense);
        });
        // Sort descending by date locally
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setExpenses(list);
        setLoading(false);
      }, (err) => {
        setLoading(false);
        handleFirestoreError(err, OperationType.LIST, path);
      });
      return unsubscribe;
    } else {
      const loadLocal = () => {
        const current: Expense[] = JSON.parse(localStorage.getItem('expense_vault_expenses') || '[]');
        const userExpenses = current.filter(e => e.user === user.uid);
        userExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setExpenses(userExpenses);
        setLoading(false);
      };

      loadLocal();

      window.addEventListener(LOCAL_STORAGE_EVENT, loadLocal);
      return () => {
        window.removeEventListener(LOCAL_STORAGE_EVENT, loadLocal);
      };
    }
  }, [user]);

  return { expenses, loading };
};

export const useRealtimeBudgets = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setBudgets([]);
      setLoading(false);
      return;
    }

    if (isFirebaseEnabled && db) {
      const q = query(collection(db, 'budgets'), where('user', '==', user.uid));
      const path = 'budgets';
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: Budget[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            _id: doc.id,
            ...data,
          } as Budget);
        });
        setBudgets(list);
        setLoading(false);
      }, (err) => {
        setLoading(false);
        handleFirestoreError(err, OperationType.LIST, path);
      });
      return unsubscribe;
    } else {
      const loadLocal = () => {
        const current: Budget[] = JSON.parse(localStorage.getItem('expense_vault_budgets') || '[]');
        const userBudgets = current.filter(b => b.user === user.uid);
        setBudgets(userBudgets);
        setLoading(false);
      };

      loadLocal();

      window.addEventListener(LOCAL_STORAGE_EVENT, loadLocal);
      return () => {
        window.removeEventListener(LOCAL_STORAGE_EVENT, loadLocal);
      };
    }
  }, [user]);

  return { budgets, loading };
};
