import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Coins, 
  Database, 
  LogOut, 
  LayoutDashboard, 
  Wallet, 
  TrendingUp, 
  User,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  if (!user) return null;

  return (
    <header className="border-b-4 border-black bg-white sticky top-0 z-30 select-none shadow-[0_4px_0_0_rgba(0,0,0,1)]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Mode */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 border-2 border-black bg-yellow-400 shadow-brutal-sm inline-flex transition-transform hover:-rotate-3">
            <Coins size={22} strokeWidth={3} className="text-black" />
          </div>
          <div>
            <h1 className="font-black text-lg md:text-xl tracking-tighter uppercase text-black leading-none">
              EXPENSE VAULT
            </h1>
            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block mt-0.5">
              SIMPLE FINANCE TRACKER
            </span>
          </div>

          {/* Database Mode Badge (Hidden on super small screens, visible otherwise) */}
          <span 
            className="hidden sm:inline-flex px-2 py-0.5 border-2 border-black text-[8px] font-black uppercase tracking-wider shadow-brutal-sm items-center gap-1 shrink-0 bg-green-300"
          >
            <Database size={10} strokeWidth={3} />
            ONLINE SYNC SECURED
          </span>
        </div>

        {/* Action Controls - Consolidated to the 3-dash Menu Button */}
        <div className="flex items-center gap-3">
          {/* Main Menu Toggle Switch (All screens) */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2.5 border-2 border-black bg-yellow-400 hover:bg-yellow-500 shadow-brutal-sm active:translate-x-0 active:translate-y-0 active:shadow-none duration-150 cursor-pointer inline-flex items-center gap-2 text-xs font-black uppercase tracking-tight"
            aria-label="Toggle navigation panel"
          >
            {isMobileOpen ? (
              <>
                <X size={18} strokeWidth={3} />
                <span>CLOSE</span>
              </>
            ) : (
              <>
                <Menu size={18} strokeWidth={3} />
                <span>MENU</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Side-Drawer Navigation Overlay (Slide-in right drawer for all screen sizes) */}
      {isMobileOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 top-[76px] z-30 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          
          <div className="fixed top-[76px] right-0 bottom-0 z-40 w-full sm:max-w-sm bg-[#fbfbf9] border-l-4 border-black flex flex-col justify-between shadow-[-6px_0_0_0_rgba(0,0,0,1)] animate-in slide-in-from-right duration-200">
            <div className="flex-grow p-6 flex flex-col justify-between gap-6 overflow-y-auto">
              
              {/* Profile/Welcome Block near top */}
              <div className="p-4 border-2 border-black bg-white shadow-brutal-sm flex items-center gap-3">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Profile Avatar" 
                    className="w-10 h-10 border-2 border-black shadow-brutal-sm rounded-none object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 border-2 border-black bg-purple-300 shadow-brutal-sm font-black text-sm flex items-center justify-center uppercase shrink-0">
                    {user.displayName?.substring(0, 2) || 'US'}
                  </div>
                )}
                <div className="text-left">
                  <p className="font-black text-xs uppercase tracking-tight text-black line-clamp-1">
                    {user.displayName || 'User'}
                  </p>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wide leading-none mt-0.5 truncate max-w-[170px]">
                    {user.email || 'offline_user'}
                  </p>
                </div>
              </div>

              {/* Nav links list */}
              <nav className="flex flex-col gap-3">
                <NavLink 
                  to="/dashboard"
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) => 
                    `p-4 font-black uppercase tracking-tight text-sm flex items-center gap-3 border-2 border-black shadow-brutal-sm transition-all hover:bg-yellow-50 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-brutal-md ${
                      isActive ? 'bg-yellow-400' : 'bg-white'
                    }`
                  }
                >
                  <LayoutDashboard size={18} strokeWidth={3} />
                  DASHBOARD
                </NavLink>

                <NavLink 
                  to="/expenses"
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) => 
                    `p-4 font-black uppercase tracking-tight text-sm flex items-center gap-3 border-2 border-black shadow-brutal-sm transition-all hover:bg-yellow-50 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-brutal-md ${
                      isActive ? 'bg-yellow-400' : 'bg-white'
                    }`
                  }
                >
                  <Wallet size={18} strokeWidth={3} />
                  EXPENSES
                </NavLink>

                <NavLink 
                  to="/budgets"
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) => 
                    `p-4 font-black uppercase tracking-tight text-sm flex items-center gap-3 border-2 border-black shadow-brutal-sm transition-all hover:bg-yellow-50 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-brutal-md ${
                      isActive ? 'bg-yellow-400' : 'bg-white'
                    }`
                  }
                >
                  <TrendingUp size={18} strokeWidth={3} />
                  BUDGETS
                </NavLink>

                <NavLink 
                  to="/profile"
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) => 
                    `p-4 font-black uppercase tracking-tight text-sm flex items-center gap-3 border-2 border-black shadow-brutal-sm transition-all hover:bg-yellow-50 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-brutal-md ${
                      isActive ? 'bg-yellow-400' : 'bg-white'
                    }`
                  }
                >
                  <User size={18} strokeWidth={3} />
                  PROFILE
                </NavLink>
              </nav>

              {/* Bottom footer & actions in the drawer */}
              <div className="pt-4 border-t-2 border-dashed border-black flex flex-col gap-3">
                <span 
                  className="w-full py-1.5 border-2 border-black text-[9px] font-black uppercase tracking-wider text-center flex items-center justify-center gap-1.5 bg-green-300"
                >
                  <Database size={11} strokeWidth={3} />
                  LIVE SYNC SECURED
                </span>

                <button
                  onClick={handleLogout}
                  className="w-full py-3 border-2 border-black bg-rose-400 hover:bg-rose-500 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-brutal-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-brutal-md active:translate-x-0 active:translate-y-0"
                >
                  <LogOut size={14} strokeWidth={3} />
                  LOG OUT
                </button>
              </div>

            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Navbar;
