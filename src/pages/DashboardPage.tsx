import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Wallet, 
  ChevronLeft, 
  ChevronRight, 
  FileSpreadsheet, 
  TrendingUp 
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { 
  useRealtimeExpenses, 
  useRealtimeBudgets 
} from '../hooks/useRealtime';
import { formatCurrency, calculateRollover } from '../lib/utils';
import { BudgetForm } from '../components/features/budgets/BudgetForm';
import { ExpenseForm } from '../components/features/expenses/ExpenseForm';
import { AiAnalysis } from '../components/features/analysis/AiAnalysis';
import { DashboardCharts } from '../components/charts/DashboardCharts';
import { Modal } from '../components/ui/Modal';
import { Card } from '../components/ui/Card';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { expenses, loading: loadingExpenses } = useRealtimeExpenses();
  const { budgets, loading: loadingBudgets } = useRealtimeBudgets();

  // Selected Month State (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  // Modal States
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Month navigation
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

  // Calculations for current selected month
  const monthlyExpenses = useMemo(() => {
    return expenses.filter(e => e.date.startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  const totalSpent = useMemo(() => {
    return monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [monthlyExpenses]);

  const totalBudgetLimit = useMemo(() => {
    return budgets.reduce((sum, b) => {
      const rollover = b.rolloverEnabled !== false
        ? calculateRollover(expenses, b.category, b.limit, selectedMonth)
        : 0;
      return sum + b.limit + rollover;
    }, 0);
  }, [budgets, expenses, selectedMonth]);

  if (loadingExpenses || loadingBudgets) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center font-black uppercase text-xs select-none gap-3 tracking-widest text-black">
        <div className="animate-spin h-5 w-5 border-4 border-black border-t-transparent rounded-none" />
        LOADING DASHBOARD...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Month Navigator Toolbar row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 border-4 border-black shadow-brutal-sm">
        <div>
          <h2 className="font-black text-lg md:text-xl uppercase tracking-tight">Dashboard Overview</h2>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">YOUR MONTHLY BALANCE & ANALYSIS</p>
        </div>

        <div className="flex items-center border-2 border-black bg-white divide-x-2 divide-black shadow-brutal-sm self-stretch sm:self-auto">
          <button 
            onClick={handlePrevMonth}
            className="p-2 hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft size={16} strokeWidth={3} />
          </button>
          <span className="px-4 py-2 font-black text-xs min-w-[124px] text-center tracking-wider flex-grow">
            {currentMonthLabel}
          </span>
          <button 
            onClick={handleNextMonth}
            className="p-2 hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Next Month"
          >
            <ChevronRight size={16} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Row 1: Key Metrics Bento Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Total Spent */}
        <Card className="bg-rose-100 flex flex-col justify-between p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="font-black text-xs uppercase tracking-wider text-black/60">Total Spent This Month</p>
              <h3 className="font-black text-2xl md:text-3xl tracking-tighter text-black mt-2">
                {formatCurrency(totalSpent)}
              </h3>
            </div>
            <div className="p-3 border-2 border-black bg-white shadow-brutal-sm">
              <Wallet size={20} strokeWidth={3} />
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsExpenseModalOpen(true)}
              className="btn-brutal text-xs py-1.5 px-3 flex-grow bg-white border-2 hover:bg-rose-50"
            >
              <Plus size={14} strokeWidth={3} />
              ADD EXPENSE
            </button>
          </div>
        </Card>

        {/* Card 2: Combined Budgets */}
        <Card className="bg-emerald-100 flex flex-col justify-between p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="font-black text-xs uppercase tracking-wider text-black/60">Total Monthly Budget</p>
              <h3 className="font-black text-2xl md:text-3xl tracking-tighter text-black mt-2">
                {formatCurrency(totalBudgetLimit)}
              </h3>
            </div>
            <div className="p-3 border-2 border-black bg-white shadow-brutal-sm">
              <TrendingUp size={20} strokeWidth={3} />
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsBudgetModalOpen(true)}
              className="btn-brutal text-xs py-1.5 px-3 flex-grow bg-white border-2 hover:bg-emerald-50"
            >
              <Plus size={14} strokeWidth={3} />
              SET BUDGET
            </button>
          </div>
        </Card>

        {/* Card 3: Free Cash / Overrun Ratio */}
        <Card className="bg-blue-100 flex flex-col justify-between p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="font-black text-xs uppercase tracking-wider text-black/60">Savings Trend Indicator</p>
              {totalBudgetLimit > 0 ? (
                <h3 className="font-black text-2xl md:text-3xl tracking-tighter text-black mt-2">
                  {((1 - (totalSpent / totalBudgetLimit)) * 100).toFixed(0)}%
                </h3>
              ) : (
                <h3 className="font-black text-sm uppercase tracking-tight text-black mt-4 bg-yellow-300 p-1 border border-black inline-block">
                  NO ACTIVE BUDGETS
                </h3>
              )}
            </div>
            <div className="p-3 border-2 border-black bg-white shadow-brutal-sm">
              <FileSpreadsheet size={20} strokeWidth={3} />
            </div>
          </div>
          <p className="text-[10px] font-bold text-gray-700 uppercase italic">
            {totalBudgetLimit > 0 
              ? totalSpent <= totalBudgetLimit 
                ? 'Safe margins! You are staying inside configured parameters.' 
                : 'Warning: You have spent more than your target budget!'
              : 'Set some budget limits to see your savings progress.'
            }
          </p>
        </Card>
      </section>

      {/* Row 2: AI Core Block */}
      <section>
        <AiAnalysis expenses={expenses} budgets={budgets} />
      </section>

      {/* Row 3: Analytical Charts Section */}
      <section>
        <DashboardCharts expenses={expenses} budgets={budgets} selectedMonth={selectedMonth} />
      </section>

      {/* Expense Modal */}
      <Modal 
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="ADD NEW EXPENSE"
      >
        <ExpenseForm 
          onSuccess={() => setIsExpenseModalOpen(false)}
        />
      </Modal>

      {/* Budget Modal */}
      <Modal 
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        title="SET MONTHLY BUDGET"
      >
        <BudgetForm 
          onSuccess={() => setIsBudgetModalOpen(false)}
          existingBudgets={budgets}
        />
      </Modal>

    </div>
  );
};

export default DashboardPage;
