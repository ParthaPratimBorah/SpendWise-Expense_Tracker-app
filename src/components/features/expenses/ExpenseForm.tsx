import React, { useState, useEffect } from 'react';
import { InputField } from '../../ui/InputField';
import { useAuth } from '../../../hooks/useAuth';
import { addExpense, updateExpense, useRealtimeBudgets } from '../../../hooks/useRealtime';
import type { Expense, ExpensePayload } from '../../../types';

interface ExpenseFormProps {
  onSuccess: () => void;
  expenseToEdit?: Expense | null;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSuccess, expenseToEdit }) => {
  const { user } = useAuth();
  const { budgets, loading: budgetsLoading } = useRealtimeBudgets();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic set of categories based on defined budgets (plus existing category if editing)
  const categories = Array.from(new Set([
    ...(expenseToEdit ? [expenseToEdit.category] : []),
    ...budgets.map(b => b.category)
  ])).filter(Boolean);

  useEffect(() => {
    if (expenseToEdit) {
      setAmount(expenseToEdit.amount.toString());
      setCategory(expenseToEdit.category);
      setDescription(expenseToEdit.description);
      setDate(expenseToEdit.date);
    } else {
      setAmount('');
      setCategory('');
      setDescription('');
      
      const today = new Date();
      const offsetDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
      setDate(offsetDate.toISOString().substring(0, 10));
    }
  }, [expenseToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!category) {
      setError('Please select a category');
      return;
    }
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid positive amount');
      return;
    }
    if (!date) {
      setError('Please enter a valid date');
      return;
    }

    setIsLoading(true);
    setError(null);

    const expenseData: ExpensePayload = {
      amount: amountNum,
      category,
      description: description.trim() || 'Unspecified Expense',
      date,
    };

    try {
      if (expenseToEdit) {
        await updateExpense(expenseToEdit._id, expenseData);
      } else {
        await addExpense(user.uid, expenseData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save expense.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 border-2 border-black font-bold uppercase text-xs text-red-600 shadow-brutal-sm">
          Error: {error}
        </div>
      )}

      <InputField
        label="Amount (INR)"
        type="number"
        step="any"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />

      <div className="space-y-1.5">
        <label className="text-xs font-black uppercase tracking-wider text-black block">
          Category
        </label>
        {budgetsLoading ? (
          <div className="w-full bg-white border-2 border-black p-3 font-semibold text-gray-500 text-sm animate-pulse uppercase tracking-tight">
            Loading Categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="w-full bg-red-50 border-2 border-black p-3 text-xs font-black text-red-600 uppercase tracking-tight">
            ⚠️ No budgets set yet. Please set a budget in the Budgets tab before adding an expense.
          </div>
        ) : (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full bg-white border-2 border-black p-3 font-bold text-black focus:outline-none focus:bg-yellow-50 focus:shadow-brutal-sm transition-all text-sm uppercase tracking-tight"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.toUpperCase()}
              </option>
            ))}
          </select>
        )}
      </div>

      <InputField
        label="Description / Merchant"
        type="text"
        placeholder="e.g. Dribbble Subscription, Grocery shopping"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <InputField
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn-brutal mt-2"
      >
        {isLoading ? 'Saving...' : expenseToEdit ? 'Update Expense' : 'Save Expense'}
      </button>
    </form>
  );
};

export default ExpenseForm;
