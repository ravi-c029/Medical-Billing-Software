import React, { useState, useMemo, useRef } from 'react';
import { useInvoiceStore } from '../store/invoiceStore';
import { useSettingsStore } from '../store/settingsStore';
import { NeuCard } from '../components/ui/NeuCard';
import { NeuInput } from '../components/ui/NeuInput';
import { NeuButton } from '../components/ui/NeuButton';
import { Modal } from '../components/ui/Modal';
import { InvoicePrint } from '../components/invoice/InvoicePrint';
import { Search, Eye, Printer, Trash2, FileSpreadsheet, Calendar } from 'lucide-react';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { useReactToPrint } from 'react-to-print';
import type { Invoice } from '../types';

export const InvoiceHistory = () => {
  const { invoices, deleteInvoice } = useInvoiceStore();
  const { settings } = useSettingsStore();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef as unknown as React.RefObject<Element>,
    documentTitle: `Invoice_${selectedInvoice?.invoiceNo}`,
  });

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchSearch = 
        inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
        inv.invoiceNo.toString().includes(search);
      const matchStatus = statusFilter === 'All' || inv.status === statusFilter.toLowerCase();
      
      let matchDate = true;
      if (startDate || endDate) {
        const invDate = new Date(inv.date);
        const start = startDate ? startOfDay(new Date(startDate)) : new Date(0);
        const end = endDate ? endOfDay(new Date(endDate)) : new Date(8640000000000000);
        matchDate = isWithinInterval(invDate, { start, end });
      }

      return matchSearch && matchStatus && matchDate;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [invoices, search, statusFilter, startDate, endDate]);

  const totalRevenue = useMemo(() => {
    return filteredInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  }, [filteredInvoices]);

  const handleOpenView = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setIsViewModalOpen(true);
  };

  const handleQuickPrint = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  const handleDelete = (id: string, no: number) => {
    if (window.confirm(`Are you sure you want to delete Invoice #${no}?`)) {
      deleteInvoice(id);
    }
  };

  const handleExportCSV = () => {
    if (filteredInvoices.length === 0) return;

    const headers = ['Inv No', 'Date', 'Customer', 'Mobile', 'SubTotal', 'CGST', 'SGST', 'GrandTotal', 'Payment', 'Status'];
    const rows = filteredInvoices.map(inv => [
      `#${inv.invoiceNo}`,
      inv.date,
      inv.customerName,
      inv.mobile,
      inv.subTotal,
      inv.cgstAmount,
      inv.sgstAmount,
      inv.grandTotal,
      inv.paymentMode,
      inv.status
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Invoices_Export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in w-full max-w-7xl mx-auto pb-10">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Invoice History</h1>
          <p className="text-slate-500 text-sm mt-1">View, search, and manage past invoices.</p>
        </div>
        <NeuButton icon={<FileSpreadsheet size={18} />} onClick={handleExportCSV} className="w-full md:w-auto">
          Export History (.CSV)
        </NeuButton>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <NeuInput 
            placeholder="Search customer or invoice..." 
            className="pl-9 text-sm w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 bg-background shadow-neu-down p-2 rounded-neu-btn flex-1 min-w-[300px]">
          <Calendar size={16} className="text-slate-400 ml-2" />
          <input type="date" className="bg-transparent border-none text-xs outline-none text-slate-600 w-full" value={startDate} onChange={e=>setStartDate(e.target.value)} />
          <span className="text-slate-400 text-xs">to</span>
          <input type="date" className="bg-transparent border-none text-xs outline-none text-slate-600 w-full" value={endDate} onChange={e=>setEndDate(e.target.value)} />
        </div>

        <div className="flex gap-2 bg-background shadow-neu-down p-1 rounded-neu-btn">
          {['All', 'Paid', 'Unpaid', 'Partial'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-neu-btn text-sm font-medium transition-all duration-300 ${
                statusFilter === status 
                  ? 'neu-filter-active' 
                  : 'text-slate-600 hover:text-primary'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <NeuCard className="overflow-hidden p-0 mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-semibold text-slate-700">Invoice No</th>
                <th className="p-4 font-semibold text-slate-700">Date</th>
                <th className="p-4 font-semibold text-slate-700">Customer</th>
                <th className="p-4 font-semibold text-slate-700 text-center">Items</th>
                <th className="p-4 font-semibold text-slate-700 text-right">Grand Total</th>
                <th className="p-4 font-semibold text-slate-700 text-center">Payment</th>
                <th className="p-4 font-semibold text-slate-700 text-center">Status</th>
                <th className="p-4 font-semibold text-slate-700 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv, index) => (
                <tr 
                  key={inv.id} 
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors animate-fade-in opacity-0"
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
                >
                  <td className="p-4 font-bold text-slate-700">#{inv.invoiceNo}</td>
                  <td className="p-4 text-slate-600">{format(new Date(inv.date), 'dd MMM yyyy')}</td>
                  <td className="p-4 font-medium text-slate-800">{inv.customerName}</td>
                  <td className="p-4 text-center text-slate-600 font-semibold">{inv.items.length}</td>
                  <td className="p-4 text-right font-bold text-slate-800">₹{inv.grandTotal.toLocaleString()}</td>
                  <td className="p-4 text-center text-slate-600">{inv.paymentMode}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                      inv.status === 'paid' ? 'bg-success/10 text-success' :
                      inv.status === 'partial' ? 'bg-warning/10 text-warning' :
                      'bg-danger/10 text-danger'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleOpenView(inv)} className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors" title="View">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleQuickPrint(inv)} className="p-2 text-slate-600 hover:bg-slate-200 rounded-full transition-colors" title="Print">
                        <Printer size={16} />
                      </button>
                      <button onClick={() => handleDelete(inv.id, inv.invoiceNo)} className="p-2 text-danger hover:bg-danger/10 rounded-full transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </NeuCard>

      <div className="flex justify-between items-center bg-slate-800 text-white p-4 rounded-neu-card shadow-neu-up">
        <span className="font-semibold px-4">Summary: {filteredInvoices.length} Invoices</span>
        <span className="font-bold text-xl px-4 text-success">Total Revenue: ₹{totalRevenue.toLocaleString()}</span>
      </div>

      <div className="hidden">
        {selectedInvoice && (
          <div ref={printRef}>
            <InvoicePrint invoice={selectedInvoice} settings={settings} />
          </div>
        )}
      </div>

      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`Invoice #${selectedInvoice?.invoiceNo}`}>
        {selectedInvoice && (
          <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="scale-75 origin-top scale-y-75 transform-gpu mb-[-25%]">
              <InvoicePrint invoice={selectedInvoice} settings={settings} />
            </div>
            
            <div className="flex justify-end gap-4 mt-6 sticky bottom-0 bg-background/90 p-4 border-t border-slate-200">
              <NeuButton onClick={() => setIsViewModalOpen(false)}>Close</NeuButton>
              <NeuButton variant="primary" icon={<Printer size={16} />} onClick={() => handlePrint()}>
                Print Invoice
              </NeuButton>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};
