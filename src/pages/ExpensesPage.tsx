import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit3, 
  Trash2,
  Calendar,
  Tag
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useRealtimeExpenses, deleteExpense } from '../hooks/useRealtime';
import { formatCurrency, formatDate } from '../lib/utils';
import { ExpenseForm } from '../components/features/expenses/ExpenseForm';
import { Modal } from '../components/ui/Modal';
import { Card } from '../components/ui/Card';
import type { Expense } from '../types';

const CATEGORIES = ['Food', 'Rent', 'Utilities', 'Entertainment', 'Shopping', 'Travel', 'Savings', 'Health', 'Misc'];

export const ExpensesPage: React.FC = () => {
  const { user } = useAuth();
  const { expenses, loading } = useRealtimeExpenses();

  // Selected Month State (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      // Month Match
      const matchesMonth = selectedMonth ? exp.date.startsWith(selectedMonth) : true;
      
      // Category Match
      const matchesCategory = selectedCategory === 'ALL' ? true : exp.category === selectedCategory;

      // Text Query Match
      const matchesText = searchQuery
        ? exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exp.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exp.amount.toString().includes(searchQuery)
        : true;

      return matchesMonth && matchesCategory && matchesText;
    });
  }, [expenses, selectedMonth, selectedCategory, searchQuery]);

  // Export to CSV Functionality
  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) return;
    
    const headers = ['ID', 'Date', 'Amount (INR)', 'Category', 'Description'];
    const rows = filteredExpenses.map(exp => [
      exp._id,
      exp.date,
      exp.amount,
      `"${exp.category.replace(/"/g, '""')}"`,
      `"${exp.description.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Expense_Ledger_${selectedMonth || 'All'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditInit = (exp: Expense) => {
    setExpenseToEdit(exp);
    setIsFormOpen(true);
  };

  const handleDelete = async (exp: Expense) => {
    const confirmMessage = `Delete this expense entry? \nAmount: ${formatCurrency(exp.amount)}\nCategory: ${exp.category.toUpperCase()}`;
    if (confirm(confirmMessage)) {
      try {
        await deleteExpense(exp._id);
      } catch (err) {
        console.error('Failed to delete expense:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center font-black uppercase text-xs select-none gap-3 tracking-widest text-black">
        <div className="animate-spin h-5 w-5 border-4 border-black border-t-transparent rounded-none" />
        LOADING EXPENSES...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 border-4 border-black shadow-brutal-sm">
        <div>
          <h2 className="font-black text-lg md:text-xl uppercase tracking-tight">Expenses</h2>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">LIST OF ALL YOUR TRANSACTION RECORDS</p>
        </div>
        <button 
          onClick={() => {
            setExpenseToEdit(null);
            setIsFormOpen(true);
          }}
          className="btn-brutal text-xs py-2.5 px-4 self-stretch sm:self-auto bg-green-400"
        >
          <Plus size={16} strokeWidth={3} />
          ADD EXPENSE
        </button>
      </div>

      {/* Control filters dashboard panel */}
      <Card className="bg-white p-6 space-y-4">
        <div className="flex items-center gap-2 border-b-2 border-black pb-2 mb-4">
          <Filter size={16} strokeWidth={3} />
          <h3 className="font-black text-xs uppercase tracking-wider text-black">Filter Expenses</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Query search input */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-black flex items-center gap-1">
              <Search size={12} strokeWidth={3} /> Search Description
            </label>
            <input 
              type="text"
              placeholder="SEARCH DETAILS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-brutal text-xs p-2.5 h-11"
            />
          </div>

          {/* Month selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-black flex items-center gap-1">
              <Calendar size={12} strokeWidth={3} /> Target Month
            </label>
            <input 
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="input-brutal text-xs p-2.5 h-11"
            />
          </div>

          {/* Category selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-black flex items-center gap-1">
              <Tag size={12} strokeWidth={3} /> Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white border-2 border-black p-2.5 font-bold text-black focus:outline-none focus:bg-yellow-50 focus:shadow-brutal-sm transition-all text-xs uppercase tracking-tight h-11"
            >
              <option value="ALL">ALL CATEGORIES</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Ledger Table Container */}
      <Card className="bg-white p-6">
        <div className="border-b-2 border-black pb-3 mb-5 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <h3 className="font-black text-sm uppercase tracking-tight text-black">
              Showing {filteredExpenses.length} Records
            </h3>
            {filteredExpenses.length !== expenses.length && (
              <span className="px-2 py-0.5 border border-black text-[8px] uppercase font-black tracking-wider bg-yellow-300">Filtered</span>
            )}
          </div>
          
          <button
            onClick={handleExportCSV}
            disabled={filteredExpenses.length === 0}
            className="btn-brutal text-xs py-1.5 px-3 bg-indigo-200 border-2 disabled:opacity-40 disabled:pointer-events-none"
          >
            <Download size={14} strokeWidth={3} />
            EXPORT TO CSV
          </button>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="p-16 text-center text-xs font-black uppercase text-gray-400 border-4 border-dashed border-black bg-neutral-50 select-none">
            No matching items found.
          </div>
        ) : (
          <div className="overflow-x-auto border-4 border-black shadow-brutal-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-100 border-b-4 border-black font-black uppercase text-[10px] tracking-wider text-black divide-x-4 divide-black">
                  <th className="p-3.5">Amount (INR)</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-4 divide-black">
                {filteredExpenses.map((exp) => (
                  <tr key={exp._id} className="divide-x-4 divide-black text-xs font-black uppercase hover:bg-neutral-50 transition-colors">
                    <td className="p-3.5 font-black text-rose-600 tracking-tight text-sm">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 border-2 border-black text-[9px] font-black bg-neutral-200 shadow-brutal-sm">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-3.5 normal-case font-bold text-gray-700 min-w-[200px] break-all">
                      {exp.description || <span className="italic uppercase text-[10px] text-gray-400">No description available</span>}
                    </td>
                    <td className="p-3.5 font-bold tracking-tight">
                      {formatDate(exp.date)}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleEditInit(exp)}
                          className="p-1.5 border-2 border-black bg-yellow-300 hover:bg-yellow-400 cursor-pointer shadow-brutal-sm hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-0 active:translate-y-0 transition-all inline-flex"
                        >
                          <Edit3 size={12} strokeWidth={3} />
                        </button>
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(exp)}
                          className="p-1.5 border-2 border-black bg-red-400 hover:bg-red-500 cursor-pointer shadow-brutal-sm hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-0 active:translate-y-0 transition-all inline-flex"
                        >
                          <Trash2 size={12} strokeWidth={3} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Expense Ledger Form Edit/Create Modal */}
      <Modal 
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setExpenseToEdit(null);
        }}
        title={expenseToEdit ? "EDIT EXPENSE" : "ADD EXPENSE"}
      >
        <ExpenseForm 
          onSuccess={() => {
            setIsFormOpen(false);
            setExpenseToEdit(null);
          }}
          expenseToEdit={expenseToEdit}
        />
      </Modal>

    </div>
  );
};

export default ExpensesPage;
