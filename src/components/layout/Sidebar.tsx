import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, History, PackageSearch, Settings, LogOut } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';

export const Sidebar: React.FC = () => {
  const { settings } = useSettingsStore();
  const { isSidebarOpen, closeSidebar } = useUIStore();
  const { logout } = useAuthStore();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'New Invoice', path: '/new-invoice', icon: <FileText size={20} /> },
    { name: 'Invoice History', path: '/history', icon: <History size={20} /> },
    { name: 'Products', path: '/products', icon: <PackageSearch size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-white/20 shadow-neu-up flex flex-col p-6 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 no-print ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="mb-10 text-center">
        <h1 className="text-xl font-bold text-primary tracking-wide">
          {settings.agencyName}
        </h1>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Billing System</p>
      </div>

      <nav className="flex flex-col gap-4 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => closeSidebar()}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-neu-btn font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-background shadow-neu-down text-primary'
                  : 'text-slate-600 hover:shadow-neu-up hover:text-primary'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-300">
        <button 
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-neu-btn font-bold text-danger hover:shadow-neu-down transition-all duration-300"
        >
          <LogOut size={20} />
          Lock Agency
        </button>
        <p className="text-[10px] text-center text-slate-400 mt-4 font-bold uppercase tracking-widest">
          v2.0.0 &copy; 2026 Ravi Agency
        </p>
      </div>
    </aside>
  );
};
