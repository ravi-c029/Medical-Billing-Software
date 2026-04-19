import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const [render, setRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setRender(true);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      const timer = setTimeout(() => setRender(false), 320);
      return () => clearTimeout(timer);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!render) return null;

  return (
    /* Full-screen backdrop — scrollable so content never hides behind top */
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 overflow-y-auto py-6 px-4 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal box — natural height, no internal scroll on the shell */}
      <div
        className={`bg-background w-full max-w-4xl rounded-neu-card shadow-neu-up transition-all duration-300 transform flex flex-col ${
          isOpen ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'
        }`}
      >
        {/* Sticky header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 sticky top-0 bg-background rounded-t-neu-card z-10">
          <h2 className="text-xl font-bold text-slate-800 truncate pr-4">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full neu-btn text-slate-500 hover:text-danger flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="p-5 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
