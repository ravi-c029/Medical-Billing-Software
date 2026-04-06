import React from 'react';

interface NeuCardProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

export const NeuCard: React.FC<NeuCardProps> = ({ children, inset = false, className = '', ...props }) => {
  return (
    <div 
      className={`${inset ? 'neu-card-inset' : 'neu-card'} p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
