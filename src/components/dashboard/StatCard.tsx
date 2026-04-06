import React, { useEffect, useState } from 'react';
import { NeuCard } from '../ui/NeuCard';

interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  icon: React.ReactNode;
  colorClass: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, prefix = '', icon, colorClass }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) return;
    const duration = 1000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <NeuCard className="flex items-center gap-6 p-6">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-neu-down ${colorClass}`}>
        {icon}
      </div>
      <div>
        <h4 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{title}</h4>
        <div className="text-3xl font-bold text-slate-800 mt-1">
          {prefix}{displayValue.toLocaleString('en-IN')}
        </div>
      </div>
    </NeuCard>
  );
};
