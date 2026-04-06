import React from 'react';

interface NeuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'danger' | 'default';
  icon?: React.ReactNode;
}

export const NeuButton: React.FC<NeuButtonProps> = ({ children, variant = 'default', icon, className = '', ...props }) => {
  const baseClass = 'neu-btn';
  const variantClass = variant === 'default' 
    ? 'text-slate-700' 
    : `neu-btn-${variant}`;

  return (
    <button type={props.type || "button"} className={`${baseClass} ${variantClass} ${className}`} {...props}>
      {icon && <span className="flex items-center justify-center">{icon}</span>}
      {children}
    </button>
  );
};
