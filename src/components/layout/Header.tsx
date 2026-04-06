import React from 'react';
import { format } from 'date-fns';
import { Search, Plus, Menu } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NeuButton } from '../ui/NeuButton';
import { useUIStore } from '../../store/uiStore';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleSidebar } = useUIStore();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Overview Dashboard';
      case '/new-invoice': return 'Create Invoice';
      case '/history': return 'Invoice History';
      case '/products': return 'Product Manager';
      case '/settings': return 'System Settings';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="min-h-[5rem] w-full flex flex-col md:flex-row items-start md:items-center justify-between px-4 md:px-8 bg-background mb-4 md:mb-8 py-4 gap-4 no-print animate-fade-in relative z-30">
      <div className="flex justify-between items-center w-full md:w-auto gap-4">
        <button 
          className="lg:hidden p-2 rounded-neu-btn bg-background shadow-neu-up text-primary active:shadow-neu-down" 
          onClick={toggleSidebar}
        >
          <Menu size={24} />
        </button>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">{getPageTitle()}</h2>
          <p className="text-xs md:text-sm text-slate-500">{format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="relative flex-1 md:w-64 hidden sm:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="neu-input pl-10 w-full"
          />
        </div>

        <NeuButton icon={<Plus size={18} />} onClick={() => navigate('/new-invoice')} className="whitespace-nowrap flex-shrink-0 flex-1 md:flex-none">
          <span className="hidden sm:inline">New Invoice</span>
          <span className="sm:hidden text-sm">New</span>
        </NeuButton>
      </div>
    </header>
  );
};
