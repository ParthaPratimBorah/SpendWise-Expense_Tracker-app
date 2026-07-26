import React, { useState, useEffect } from 'react';
import { InputField } from '../../ui/InputField';
import { useAuth } from '../../../hooks/useAuth';
import { addBudget, updateBudget } from '../../../hooks/useRealtime';
import type { Budget, BudgetPayload } from '../../../types';

interface BudgetFormProps {
  onSuccess: () => void;
  budgetToEdit?: Budget | null;
  existingBudgets?: Budget[];
}

export const BudgetForm: React.FC<BudgetFormProps> = ({ onSuccess, budgetToEdit, existingBudgets }) => {
  const { user } = useAuth();
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [rolloverEnabled, setRolloverEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (budgetToEdit) {
      setCategory(budgetToEdit.category);
      setLimit(budgetToEdit.limit.toString());
      setRolloverEnabled(budgetToEdit.rolloverEnabled !== false);
    } else {
      setCategory('');
      setLimit('');
      setRolloverEnabled(true);
    }
  }, [budgetToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const trimmedCategory = category.trim();
    if (!trimmedCategory) {
      setError('Please enter a category name');
      return;
    }

    // Check if category already has a budget set up (except when editing the same budget)
    if (existingBudgets) {
      const isDuplicate = existingBudgets.some(b => 
        b.category.toLowerCase() === trimmedCategory.toLowerCase() &&
        (budgetToEdit ? b._id !== budgetToEdit._id : true)
      );
      if (isDuplicate) {
        setError(`A budget for "${trimmedCategory}" already exists. Please choose a different category.`);
        return;
      }
    }

    const limitNum = parseFloat(limit);
    if (isNaN(limitNum) || limitNum <= 0) {
      setError('Please enter a valid positive limit');
      return;
    }

    setIsLoading(true);
    setError(null);

    const budgetData: BudgetPayload = {
      category: trimmedCategory,
      limit: limitNum,
      rolloverEnabled,
    };

    try {
      if (budgetToEdit) {
        await updateBudget(budgetToEdit._id, budgetData);
      } else {
        await addBudget(user.uid, budgetData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save budget.');
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
        label="Category"
        type="text"
        placeholder="e.g. Food, Rent, Entertainment"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      />

      <InputField
        label="Monthly Limit (INR)"
        type="number"
        step="any"
        placeholder="Enter monthly spending limit"
        value={limit}
        onChange={(e) => setLimit(e.target.value)}
        required
      />

      <div 
        className="flex items-center gap-3 p-4 bg-white border-2 border-black hover:bg-neutral-50 cursor-pointer group shadow-brutal-sm hover:shadow-brutal-md transition-all select-none" 
        onClick={() => setRolloverEnabled(!rolloverEnabled)}
      >
        <input 
          type="checkbox" 
          id="rolloverEnabled"
          checked={rolloverEnabled}
          onChange={(e) => setRolloverEnabled(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className="w-6 h-6 border-2 border-black bg-white appearance-none checked:bg-green-400 cursor-pointer relative after:content-['✓'] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:text-black after:font-black after:hidden checked:after:block shrink-0"
        />
        <div className="flex-grow">
          <label htmlFor="rolloverEnabled" className="text-xs font-black uppercase tracking-tight cursor-pointer block text-black">
            Enable Monthly Rollover
          </label>
          <p className="text-[9px] font-bold text-gray-500 uppercase italic">
            Remaining budget carries over to next month. Overspends reset to zero.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn-brutal mt-2"
      >
        {isLoading ? 'Saving...' : budgetToEdit ? 'Update Budget' : 'Save Budget'}
      </button>
    </form>
  );
};

export default BudgetForm;
