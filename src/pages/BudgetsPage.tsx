import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  HelpCircle, 
  Edit3, 
  Trash2, 
  Info,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { 
  useRealtimeBudgets, 
  useRealtimeExpenses, 
  deleteBudget 
} from '../hooks/useRealtime';
import { formatCurrency, calculateRollover } from '../lib/utils';
import { BudgetForm } from '../components/features/budgets/BudgetForm';
import { Modal } from '../components/ui/Modal';
import { Card } from '../components/ui/Card';
import type { Budget } from '../types';

export const BudgetsPage: React.FC = () => {
  const { user } = useAuth();
  const { budgets, loading: loadingBudgets } = useRealtimeBudgets();
  const { expenses, loading: loadingExpenses } = useRealtimeExpenses();

  // Selected Month State (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);

  // Month navigation (for comparative budget tracking)
  const handlePrevMonth = () => {
    const parts = selectedMonth.split('-');
    let yr = parseInt(parts[0]);
    let mo = parseInt(parts[1]);
    mo--;
    if (mo < 1) {
      mo = 12;
      yr--;
    }
    setSelectedMonth(`${yr}-${String(mo).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const parts = selectedMonth.split('-');
    let yr = parseInt(parts[0]);
    let mo = parseInt(parts[1]);
    mo++;
    if (mo > 12) {
      mo = 1;
      yr++;
    }
    setSelectedMonth(`${yr}-${String(mo).padStart(2, '0')}`);
  };

  const currentMonthLabel = useMemo(() => {
    const parts = selectedMonth.split('-');
    const yearNum = parseInt(parts[0]);
    const monthIndex = parseInt(parts[1]) - 1;
    if (isNaN(yearNum) || isNaN(monthIndex)) return selectedMonth;
    const dateObj = new Date(yearNum, monthIndex, 1);
    return dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
  }, [selectedMonth]);

  // Expenses filtered for selected month (used to determine category spent actuals)
  const monthlyExpenses = useMemo(() => {
    return expenses.filter(e => e.date.startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  const handleEditInit = (budId: Budget) => {
    setBudgetToEdit(budId);
    setIsFormOpen(true);
  };

  const handleDelete = async (bud: Budget) => {
    if (confirm(`Delete budget for ${bud.category.toUpperCase()}?`)) {
      try {
        await deleteBudget(bud._id);
      } catch (err) {
        console.error('Failed to delete budget:', err);
      }
    }
  };

  if (loadingBudgets || loadingExpenses) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center font-black uppercase text-xs select-none gap-3 tracking-widest text-black">
        <div className="animate-spin h-5 w-5 border-4 border-black border-t-transparent rounded-none" />
        LOADING BUDGETS...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 border-4 border-black shadow-brutal-sm">
        <div>
          <h2 className="font-black text-lg md:text-xl uppercase tracking-tight">Budgets</h2>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">MANAGE YOUR CATEGORY BUDGETS</p>
        </div>
        <button 
          onClick={() => {
            setBudgetToEdit(null);
            setIsFormOpen(true);
          }}
          className="btn-brutal text-xs py-2.5 px-4 self-stretch sm:self-auto bg-green-400"
        >
          <Plus size={16} strokeWidth={3} />
          SET BUDGET
        </button>
      </div>

      {/* Explainer note around rollover mechanics */}
      <Card className="bg-emerald-50 border-4 border-black p-6 relative overflow-hidden">
        <div className="absolute right-4 top-4 text-emerald-200 select-none opacity-40">
          <Layers size={92} strokeWidth={4} />
        </div>
        <div className="flex gap-4 relative z-10">
          <div className="p-3 border-2 border-black bg-white shadow-brutal-sm inline-flex h-fit shrink-0">
            <HelpCircle size={22} className="text-emerald-600" strokeWidth={3} />
          </div>
          <div className="space-y-2">
            <h3 className="font-black text-xs uppercase tracking-wider text-black">Understanding Monthly Rollover</h3>
            <p className="text-xs font-bold leading-relaxed text-black/80 max-w-2xl">
              When enabled, any unspent budget from previous months is automatically added to this month's budget. This helps you carry over savings to the next month to plan more effectively.
            </p>
          </div>
        </div>
      </Card>

      {/* Month Navigator Toolbar row (for tracking comparative budget progress) */}
      <div className="flex justify-between items-center bg-white p-4 border-4 border-black shadow-brutal-sm">
        <div>
          <h3 className="font-black text-xs uppercase tracking-wider">Budget Progress Tracker</h3>
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tight">VIEW YOUR SPENDING COMPARED TO YOUR BUDGET LIMITS</p>
        </div>
        <div className="flex items-center border-2 border-black bg-white divide-x-2 divide-black shadow-brutal-sm">
          <button 
            onClick={handlePrevMonth}
            className="p-2 hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft size={14} strokeWidth={3} />
          </button>
          <span className="px-3 py-1.5 font-black text-[10px] min-w-[100px] text-center tracking-wider uppercase">
            {currentMonthLabel}
          </span>
          <button 
            onClick={handleNextMonth}
            className="p-2 hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Next Month"
          >
            <ChevronRight size={14} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Budget list grid */}
      {budgets.length === 0 ? (
        <div className="card-brutal bg-white p-16 text-center text-xs font-black uppercase text-gray-400 select-none border-4">
          No budgets set yet. Tap on Set Budget to define category spending limits.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.map((bud) => {
            // Total spent in this category
            const spentInCat = monthlyExpenses
              .filter(e => e.category === bud.category)
              .reduce((sum, e) => sum + e.amount, 0);
            
            const rollover = bud.rolloverEnabled !== false
              ? calculateRollover(expenses, bud.category, bud.limit, selectedMonth)
              : 0;
            
            const effectiveLimit = bud.limit + rollover;
            const percentUsed = effectiveLimit > 0 ? (spentInCat / effectiveLimit) * 100 : 0;
            const isOver = spentInCat > effectiveLimit;

            return (
              <Card key={bud._id} className="p-6 bg-white space-y-4 hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all relative">
                {/* Header */}
                <div className="flex justify-between items-start gap-4 border-b-2 border-black pb-3">
                  <div>
                    <span className="px-2.5 py-0.5 border-2 border-black bg-yellow-300 font-black text-[10px] uppercase tracking-wider shadow-brutal-sm">
                      {bud.category}
                    </span>
                    <h4 className="font-extrabold text-sm uppercase text-gray-500 tracking-tight mt-2.5">
                      Monthly Budget: {formatCurrency(bud.limit)}
                    </h4>
                  </div>
                  
                  {/* Edit/Purge Options */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleEditInit(bud)}
                      className="p-1.5 border-2 border-black bg-yellow-300 hover:bg-yellow-400 cursor-pointer shadow-brutal-sm hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-0 active:translate-y-0 transition-all inline-flex"
                      title="Edit Budget"
                    >
                      <Edit3 size={11} strokeWidth={3} />
                    </button>
                    <button
                      onClick={() => handleDelete(bud)}
                      className="p-1.5 border-2 border-black bg-red-400 hover:bg-red-500 cursor-pointer shadow-brutal-sm hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-0 active:translate-y-0 transition-all inline-flex"
                      title="Delete Budget"
                    >
                      <Trash2 size={11} strokeWidth={3} />
                    </button>
                  </div>
                </div>

                {/* Rollover status notification details */}
                <div className="flex items-center gap-2 p-2.5 bg-neutral-50 border-2 border-black text-[10px] font-bold uppercase transition-all">
                  <Info size={14} className="text-indigo-600 inline-block" strokeWidth={3} />
                  <span>
                    Rollover: {rollover > 0 ? (
                      <strong className="text-emerald-600 font-extrabold">Carried Over +{formatCurrency(rollover)}</strong>
                    ) : (
                      <span className="text-gray-400 font-bold">No rollover carried over</span>
                    )}
                  </span>
                </div>

                {/* Overrun metrics progress sliders */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
                    <span>Spent: {formatCurrency(spentInCat)}</span>
                    <span>Total Limit: {formatCurrency(effectiveLimit)}</span>
                  </div>
                  
                  <div className="w-full bg-white border-4 border-black h-6 overflow-hidden relative shadow-brutal-sm">
                    <div 
                      style={{ width: `${Math.min(100, percentUsed)}%` }}
                      className={`h-full border-r-4 border-black transition-all duration-300 ${isOver ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'}`}
                    />
                    <span className="absolute inset-0 flex items-center justify-center font-black text-[11px] text-black">
                      {percentUsed.toFixed(0)}% SPENT
                    </span>
                  </div>

                  {isOver && (
                    <p className="text-[9px] font-black uppercase text-red-600 animate-bounce tracking-wide">
                      ⚡ WARNING: BUDGET EXCEEDED!
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Form Dialog Modal */}
      <Modal 
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setBudgetToEdit(null);
        }}
        title={budgetToEdit ? "EDIT BUDGET" : "SET MONTHLY BUDGET"}
      >
        <BudgetForm 
          onSuccess={() => {
            setIsFormOpen(false);
            setBudgetToEdit(null);
          }}
          budgetToEdit={budgetToEdit}
          existingBudgets={budgets}
        />
      </Modal>

    </div>
  );
};

export default BudgetsPage;
