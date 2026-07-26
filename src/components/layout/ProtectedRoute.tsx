import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfbf9] flex flex-col items-center justify-center font-black uppercase text-sm select-none gap-3 tracking-widest text-black">
        <div className="animate-spin h-6 w-6 border-4 border-black border-t-transparent rounded-none" />
        VALIDATING VAULT SECURITY SYSTEMS...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
