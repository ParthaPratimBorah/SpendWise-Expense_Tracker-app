import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  badge?: string;
  badgeBg?: string;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  title, 
  badge, 
  badgeBg = 'bg-yellow-300', 
  ...props 
}) => {
  return (
    <div 
      className={cn(
        "card-brutal group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all", 
        className
      )} 
      {...props}
    >
      {title && (
        <div className="flex justify-between items-center border-b-2 border-black pb-3 mb-4">
          <h2 className="font-black text-lg uppercase tracking-tight block text-black">{title}</h2>
          {badge && (
            <span className={cn("px-2.5 py-0.5 border-2 border-black text-[10px] uppercase font-black tracking-wider shadow-brutal-sm", badgeBg)}>
              {badge}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
