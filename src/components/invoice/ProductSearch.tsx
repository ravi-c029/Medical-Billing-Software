import React, { useState, useRef, useEffect } from 'react';
import { useProductStore } from '../../store/productStore';
import type { Medicine } from '../../types';

interface ProductSearchProps {
  value: string;
  onChange: (name: string) => void;
  onSelect: (medicine: Medicine) => void;
  className?: string;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({ value, onChange, onSelect, className = '' }) => {
  const { medicines } = useProductStore();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = value
    ? medicines.filter(m => m.name.toLowerCase().includes(value.toLowerCase())).slice(0, 8)
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        className={`w-full bg-white/60 border border-slate-300 shadow-sm p-1.5 rounded outline-none font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary/50 transition-all ${className}`}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Type to search..."
      />
      {isOpen && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 mt-1 w-80 bg-background shadow-neu-up rounded-neu-card overflow-hidden border border-white/20">
          <ul className="max-h-60 overflow-y-auto">
            {filtered.map(item => (
              <li 
                key={item.id} 
                className="px-4 py-2 hover:bg-white/50 cursor-pointer border-b border-white/10 last:border-0 flex justify-between items-center"
                onClick={() => {
                  onSelect(item);
                  setIsOpen(false);
                }}
              >
                <div>
                  <div className="font-bold text-slate-700 text-sm">{item.name}</div>
                  <div className="text-xs text-slate-500">{item.mfdBy} | Stock: {item.stock}</div>
                </div>
                <div className="font-semibold text-primary">₹{item.mrp.toFixed(2)}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
