import React from 'react';
import { cn } from '../../lib/utils';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-xs font-black uppercase tracking-wider text-black block">
          {label}
        </label>
      )}
      <input
        className={cn(
          "input-brutal",
          error && "border-red-500 focus:bg-red-50",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-[10px] font-black uppercase tracking-tight text-red-600">
          * {error}
        </p>
      )}
    </div>
  );
};

export default InputField;
