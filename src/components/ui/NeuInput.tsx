import React, { forwardRef, type ReactNode } from 'react';

interface NeuInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  error?: string;
  icon?: ReactNode;
}

export const NeuInput = forwardRef<HTMLInputElement, NeuInputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full text-slate-700">
        {label && <label className="text-sm font-bold pl-1 text-slate-500 uppercase tracking-wider">{label}</label>}
        <div className="relative group">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors duration-300">
              {icon}
            </div>
          )}
          <input 
            ref={ref}
            className={`neu-input ${icon ? 'pl-11' : ''} ${error ? 'ring-2 ring-danger/50' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-danger font-semibold pl-1 animate-fade-in">{error}</span>}
      </div>
    );
  }
);
NeuInput.displayName = 'NeuInput';
