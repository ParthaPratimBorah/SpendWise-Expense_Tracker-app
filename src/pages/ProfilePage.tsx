import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Database, 
  LogOut, 
  Coins, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useRealtimeExpenses, useRealtimeBudgets } from '../hooks/useRealtime';
import { Card } from '../components/ui/Card';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { expenses } = useRealtimeExpenses();
  const { budgets } = useRealtimeBudgets();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Compile Ledger Sync statistics
  const walletStats = useMemo(() => {
    const totalTransactionsSum = expenses.reduce((sum, e) => sum + e.amount, 0);
    const averageSpent = expenses.length > 0 ? totalTransactionsSum / expenses.length : 0;
    
    return {
      expensesCount: expenses.length,
      budgetsCount: budgets.length,
      totalSum: totalTransactionsSum,
      averageSpent
    };
  }, [expenses, budgets]);

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header toolbar */}
      <div className="flex justify-between items-center bg-white p-4 border-4 border-black shadow-brutal-sm">
        <div>
          <h2 className="font-black text-lg md:text-xl uppercase tracking-tight">Profile & Settings</h2>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">MANAGE YOUR ACCOUNT AND CONNECTIVITY OPTIONS</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Account Profile Detail */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-white p-6 text-center space-y-4">
            <div className="border-b-2 border-black pb-3 mb-4">
              <h3 className="font-black text-xs uppercase tracking-wider text-black">User Account Profile</h3>
            </div>

            <div className="flex justify-center">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Avatar" 
                  className="w-24 h-24 border-4 border-black shadow-brutal-sm object-cover rounded-none"
                />
              ) : (
                <div className="w-24 h-24 border-4 border-black bg-purple-300 shadow-brutal-sm font-black text-3xl flex items-center justify-center uppercase">
                  {user.displayName?.substring(0, 2) || 'US'}
                </div>
              )}
            </div>

            <div className="space-y-2 border-b border-black pb-4">
              <h4 className="font-black text-lg uppercase tracking-tight text-black line-clamp-1">
                {user.displayName || 'User'}
              </h4>
              <p className="text-xs font-bold text-gray-500 uppercase italic line-clamp-1">
                {user.email || 'No email (SMS login)'}
              </p>
            </div>

            <div className="text-left space-y-1 bg-neutral-50 border-2 border-black p-3 font-mono text-[9px] uppercase tracking-tight">
              <p className="font-black text-gray-400">USER ID:</p>
              <p className="font-bold text-black break-all">{user.uid}</p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full btn-brutal border-4 h-11 bg-red-400 text-xs font-black uppercase tracking-tight shadow-brutal-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut size={14} strokeWidth={3} />
              LOG OUT
            </button>
          </Card>
        </div>

        {/* Right Columns: Sync Ledger details and connections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Connection status detail */}
          <Card className="bg-white p-6 space-y-4">
            <div className="border-b-2 border-black pb-3">
              <h3 className="font-black text-xs uppercase tracking-wider text-black">Database Connectivity Status</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border-2 border-black shadow-brutal-sm bg-green-100 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-black text-xs uppercase tracking-tight text-black">Active Database Mode</p>
                    <h4 className="font-black text-sm uppercase text-black mt-1">
                      ONLINE CLOUD SYNC
                    </h4>
                  </div>
                  <Database size={20} strokeWidth={3} className="text-black shrink-0" />
                </div>
                <p className="text-[9px] font-bold text-gray-600 uppercase tracking-tight mt-4">
                  Your data syncs in real-time across devices with secure cloud storage.
                </p>
              </div>

              <div className="p-4 border-2 border-black shadow-brutal-sm bg-neutral-50 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-black text-xs uppercase tracking-tight text-black">System Status</p>
                    <h4 className="font-black text-sm uppercase text-green-600 flex items-center gap-1.5 mt-1">
                      <CheckCircle2 size={16} strokeWidth={3} /> ONLINE & READY
                    </h4>
                  </div>
                  <Clock size={20} strokeWidth={3} className="text-black shrink-0" />
                </div>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tight mt-4">
                  System is running healthy and database connection is synchronized.
                </p>
              </div>
            </div>
          </Card>

          {/* Sync Stats bento */}
          <Card className="bg-white p-6 space-y-4">
            <div className="border-b-2 border-black pb-3">
              <h3 className="font-black text-xs uppercase tracking-wider text-black">General Statistics</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 border-2 border-black bg-neutral-50 shadow-brutal-sm text-center">
                <span className="text-[9px] font-black uppercase text-gray-400 block pb-1">TOTAL EXPENSES</span>
                <span className="font-black text-2xl text-black">{walletStats.expensesCount}</span>
              </div>
              
              <div className="p-3 border-2 border-black bg-neutral-50 shadow-brutal-sm text-center">
                <span className="text-[9px] font-black uppercase text-gray-400 block pb-1">TOTAL BUDGETS</span>
                <span className="font-black text-2xl text-black">{walletStats.budgetsCount}</span>
              </div>

              <div className="p-3 border-2 border-black bg-neutral-50 shadow-brutal-sm text-center">
                <span className="text-[9px] font-black uppercase text-gray-400 block pb-1">TOTAL AMOUNT</span>
                <span className="font-black text-xs text-rose-600 block pt-1.5 truncate max-w-[120px] mx-auto">
                  {expenses.length > 0 ? `${(walletStats.totalSum / 1000).toFixed(1)}k` : 'N/A'}
                </span>
              </div>

              <div className="p-3 border-2 border-black bg-neutral-50 shadow-brutal-sm text-center">
                <span className="text-[9px] font-black uppercase text-gray-400 block pb-1">AVERAGE AMOUNT</span>
                <span className="font-black text-xs text-indigo-600 block pt-1.5 truncate max-w-[120px] mx-auto">
                  {expenses.length > 0 ? `${(walletStats.averageSpent).toFixed(0)}` : 'N/A'}
                </span>
              </div>
            </div>
          </Card>
          
          {/* Security alerts block */}
          <div className="p-4 bg-yellow-50 border-4 border-black shadow-brutal-sm flex gap-3">
            <ShieldAlert size={20} strokeWidth={3} className="text-yellow-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-black text-[10px] uppercase tracking-wide text-black">AI Core Security</h4>
              <p className="text-[9px] font-bold text-black/80 leading-relaxed uppercase">
                Your AI analyses are processed safely and securely on our encrypted server-side system. None of your API keys are ever shared with the browser.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ProfilePage;
