import React, { forwardRef } from 'react';

interface NeuInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const NeuInput = forwardRef<HTMLInputElement, NeuInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full text-slate-700">
        {label && <label className="text-sm font-semibold pl-1">{label}</label>}
        <input 
          ref={ref}
          className={`neu-input ${error ? 'ring-2 ring-danger/50' : ''} ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-danger pl-1">{error}</span>}
      </div>
    );
  }
);
NeuInput.displayName = 'NeuInput';
