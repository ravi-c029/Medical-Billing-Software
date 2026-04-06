import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUIStore } from '../../store/uiStore';

export const Layout: React.FC = () => {
  const { isSidebarOpen, closeSidebar } = useUIStore();
  return (
    <div className="flex bg-background min-h-screen relative">
      <Sidebar />
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}
      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 md:px-8 pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
