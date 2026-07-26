import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Card } from '../components/ui/Card';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        
        {/* Error icon bento */}
        <div className="inline-flex p-4 border-4 border-black bg-red-400 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <AlertCircle size={48} strokeWidth={3} className="text-black" />
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <h1 className="font-extrabold text-4xl uppercase tracking-tighter text-black">
            PAGE NOT FOUND
          </h1>
          <p className="font-black text-xs uppercase tracking-widest text-gray-500">
            ERROR 404
          </p>
        </div>

        <p className="font-bold text-sm leading-relaxed text-black/80 max-w-sm mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>

        {/* Back navigation button */}
        <Link
          to="/dashboard"
          className="btn-brutal text-xs py-2.5 px-5 shadow-brutal-sm font-black uppercase tracking-tight flex items-center justify-center gap-2"
        >
          <ArrowLeft size={14} strokeWidth={3} />
          GO TO DASHBOARD
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
