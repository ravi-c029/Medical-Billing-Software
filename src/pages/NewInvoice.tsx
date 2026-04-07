import React, { useState, useEffect, useRef } from 'react';
import { NeuCard } from '../components/ui/NeuCard';
import { NeuInput } from '../components/ui/NeuInput';
import { NeuButton } from '../components/ui/NeuButton';
import { ProductSearch } from '../components/invoice/ProductSearch';
import { InvoicePrint } from '../components/invoice/InvoicePrint';
import { useSettingsStore } from '../store/settingsStore';
import { useInvoiceStore } from '../store/invoiceStore';
import { format } from 'date-fns';
import { formatDateToDisplay } from '../utils/dateUtils';
import { Printer, Save, Trash2, Plus } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { computeLineAmount, computeSubTotal, computeTax, computeGrandTotal } from '../utils/calculations';
import { numberToIndianWords } from '../utils/numberToWords';
import type { Invoice, InvoiceLineItem, Medicine } from '../types';

export const NewInvoice = () => {
  const { settings, incrementInvoiceCounter } = useSettingsStore();
  const { addInvoice } = useInvoiceStore();
  const printRef = useRef<HTMLDivElement>(null);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [mobile, setMobile] = useState('');
  const [customerDlNo, setCustomerDlNo] = useState('');
  const [paymentMode, setPaymentMode] = useState<Invoice['paymentMode']>('Cash');
  const [status, setStatus] = useState<Invoice['status']>('paid');
  
  const [invoiceDate, setInvoiceDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const invoiceNo = settings.invoiceCounter;
  const [printData, setPrintData] = useState<Invoice | null>(null);
  
  const [cgstPercent, setCgstPercent] = useState(settings.cgstPercent.toString());
  const [sgstPercent, setSgstPercent] = useState(settings.sgstPercent.toString());

  const emptyLine: InvoiceLineItem = {
    id: '', productName: '', hsn: '', batch: '', exp: '', mfdBy: '', 
    qty: 0, mrp: 0, rate: 0, taxPercent: 0, amount: 0
  };

  const [items, setItems] = useState<InvoiceLineItem[]>(
    Array.from({ length: 5 }, () => ({ ...emptyLine, id: Date.now().toString() + Math.random() }))
  );

  // Derived Totals
  const subTotal = computeSubTotal(items);
  const cgstAmount = computeTax(subTotal, Number(cgstPercent));
  const sgstAmount = computeTax(subTotal, Number(sgstPercent));
  const grandTotal = computeGrandTotal(subTotal, cgstAmount, sgstAmount);
  const amountInWords = numberToIndianWords(grandTotal);

  // Actions
  const updateItem = (index: number, field: keyof InvoiceLineItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto calculate amount if qty or rate changes
    if (field === 'qty' || field === 'rate') {
      newItems[index].amount = computeLineAmount(Number(newItems[index].qty) || 0, Number(newItems[index].rate) || 0);
    }
    setItems(newItems);
  };

  const handleProductSelect = (index: number, medicine: Medicine) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      productName: medicine.name,
      hsn: medicine.hsn,
      mrp: medicine.mrp,
      rate: medicine.mrp, // Default rate to MRP
      mfdBy: medicine.mfdBy,
      taxPercent: medicine.taxPercent,
      qty: 1, // Default qty to 1 when selected to immediately show line amt
      amount: medicine.mrp,
    };
    setItems(newItems);
  };

  const addRow = () => {
    setItems([...items, { ...emptyLine, id: Date.now().toString() + Math.random() }]);
  };

  const removeRow = (index: number) => {
    if (items.length > 5) {
      setItems(items.filter((_, i) => i !== index));
    } else {
      // Clear instead of remove if at minimum 5
      const newItems = [...items];
      newItems[index] = { ...emptyLine, id: Date.now().toString() + Math.random() };
      setItems(newItems);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' && index === items.length - 1) {
      e.preventDefault();
      addRow();
    }
  };

  const buildInvoiceObject = (): Invoice => {
    return {
      id: Date.now().toString(),
      invoiceNo,
      date: formatDateToDisplay(invoiceDate), // Format to dd-MM-yyyy for storage
      customerName,
      address,
      mobile,
      customerDlNo,
      items: items.filter(i => i.productName && Number(i.qty) > 0).map(i => ({
        ...i,
        qty: Number(i.qty) || 0,
        mrp: Number(i.mrp) || 0,
        rate: Number(i.rate) || 0,
        taxPercent: Number(i.taxPercent) || 0,
        amount: Number(i.amount) || 0
      })),
      subTotal,
      cgstPercent: Number(cgstPercent),
      sgstPercent: Number(sgstPercent),
      cgstAmount,
      sgstAmount,
      grandTotal,
      amountInWords,
      paymentMode,
      status,
      createdAt: new Date().toISOString()
    };
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef as unknown as React.RefObject<Element>,
    onAfterPrint: () => {
      if (printData) {
        setPrintData(null);
        clearForm();
      }
    }
  });

  useEffect(() => {
    if (printData) {
      handlePrint();
    }
  }, [printData, handlePrint]);

  const clearForm = () => {
    setCustomerName(''); setAddress(''); setMobile(''); setCustomerDlNo('');
    setItems(Array.from({ length: 5 }, () => ({ ...emptyLine, id: Date.now().toString() + Math.random() })));
  };

  const saveInvoice = () => {
    if (!customerName) {
      alert("Please enter a customer name.");
      return;
    }
    const inv = buildInvoiceObject();
    if (inv.items.length === 0) {
      alert("Please add at least one product with quantity > 0");
      return;
    }
    addInvoice(inv);
    incrementInvoiceCounter();
    alert("Invoice saved to history!");
    clearForm();
  };

  const handleSaveAndPrint = () => {
    if (!customerName) {
      alert("Please enter a customer name.");
      return;
    }
    const inv = buildInvoiceObject();
    if (inv.items.length === 0) {
      alert("Please add at least one product with quantity > 0");
      return;
    }
    addInvoice(inv);
    incrementInvoiceCounter();
    setPrintData(inv);
  };

  return (
    <div className="animate-fade-in w-full pb-10 flex flex-col gap-6">
      
      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NeuCard>
          <h3 className="text-lg font-bold text-slate-700 mb-4 border-b border-white/20 pb-2">Customer Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NeuInput label="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="col-span-1 sm:col-span-2" placeholder="Required" />
            <NeuInput label="Address" value={address} onChange={(e) => setAddress(e.target.value)} className="col-span-1 sm:col-span-2" />
            <NeuInput label="Mobile No" value={mobile} onChange={(e) => setMobile(e.target.value)} maxLength={10} />
            <NeuInput label="Customer DL No" value={customerDlNo} onChange={(e) => setCustomerDlNo(e.target.value)} />
            <div className="flex flex-col gap-1 w-full text-slate-700">
              <label className="text-sm font-semibold pl-1">Payment</label>
              <select className="neu-input" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value as any)}>
                <option value="Cash">Cash</option><option value="UPI">UPI</option>
                <option value="Card">Card</option><option value="Credit">Credit</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 w-full col-span-1 sm:col-span-2 text-slate-700">
              <label className="text-sm font-semibold pl-1">Status</label>
              <select className="neu-input" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                <option value="paid">Paid</option><option value="unpaid">Unpaid</option><option value="partial">Partial</option>
              </select>
            </div>
          </div>
        </NeuCard>

        <NeuCard>
          <h3 className="text-lg font-bold text-slate-700 mb-4 border-b border-white/20 pb-2">Invoice Meta</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-background shadow-neu-down rounded-neu-card mb-4">
              <span className="font-semibold text-slate-600">Invoice Number</span>
              <span className="font-bold text-xl text-primary">#{invoiceNo}</span>
            </div>
            <NeuInput label="Date" type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
          </div>
        </NeuCard>
      </div>

      {/* Invoice Table */}
      <NeuCard className="overflow-x-auto p-0 pb-4">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[900px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm whitespace-nowrap">
              <th className="p-3 font-semibold text-slate-700 w-10 text-center">Sl</th>
              <th className="p-3 font-semibold text-slate-700 min-w-[200px]">Product Name</th>
              <th className="p-3 font-semibold text-slate-700 w-24">HSN</th>
              <th className="p-3 font-semibold text-slate-700 w-24">Batch</th>
              <th className="p-3 font-semibold text-slate-700 w-24">Exp(MM/YY)</th>
              <th className="p-3 font-semibold text-slate-700 w-24">Mfd By</th>
              <th className="p-3 font-semibold text-slate-700 w-20">Qty</th>
              <th className="p-3 font-semibold text-slate-700 w-24">MRP</th>
              <th className="p-3 font-semibold text-slate-700 w-24">Rate</th>
              <th className="p-3 font-semibold text-slate-700 w-20">Tax%</th>
              <th className="p-3 font-semibold text-slate-700 w-28 text-right">Amount</th>
              <th className="p-3 font-semibold text-slate-700 w-12 text-center">×</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-2 text-center text-slate-500 text-sm font-medium">{index + 1}</td>
                <td className="p-2">
                  <ProductSearch 
                    value={item.productName} 
                    onChange={(val) => updateItem(index, 'productName', val)}
                    onSelect={(m) => handleProductSelect(index, m)}
                  />
                </td>
                <td className="p-2"><input type="text" className="w-full bg-white/60 border border-slate-300 shadow-sm outline-none text-sm text-slate-800 p-1.5 rounded focus:bg-white focus:ring-2 focus:ring-primary/50 transition-all font-medium" value={item.hsn} onChange={(e) => updateItem(index, 'hsn', e.target.value)} /></td>
                <td className="p-2"><input type="text" className="w-full bg-white/60 border border-slate-300 shadow-sm outline-none text-sm text-slate-800 p-1.5 rounded focus:bg-white focus:ring-2 focus:ring-primary/50 transition-all font-medium" value={item.batch} onChange={(e) => updateItem(index, 'batch', e.target.value)} /></td>
                <td className="p-2"><input type="text" className="w-full bg-white/60 border border-slate-300 shadow-sm outline-none text-sm text-slate-800 p-1.5 rounded focus:bg-white focus:ring-2 focus:ring-primary/50 transition-all font-medium placeholder:text-slate-400" placeholder="01/26" value={item.exp} onChange={(e) => updateItem(index, 'exp', e.target.value)} /></td>
                <td className="p-2"><input type="text" className="w-full bg-white/60 border border-slate-300 shadow-sm outline-none text-xs text-slate-800 p-1.5 rounded focus:bg-white focus:ring-2 focus:ring-primary/50 transition-all font-medium" value={item.mfdBy} onChange={(e) => updateItem(index, 'mfdBy', e.target.value)} /></td>
                <td className="p-2"><input type="number" className="w-full bg-white/60 border border-slate-300 shadow-sm outline-none text-sm font-bold text-primary p-1.5 rounded focus:bg-white focus:ring-2 focus:ring-primary/50 transition-all" value={item.qty === 0 ? '' : item.qty} onChange={(e) => updateItem(index, 'qty', e.target.value)} min={0} /></td>
                <td className="p-2"><input type="number" className="w-full bg-white/60 border border-slate-300 shadow-sm outline-none text-sm font-semibold p-1.5 rounded focus:bg-white focus:ring-2 focus:ring-primary/50 transition-all" value={item.mrp === 0 ? '' : item.mrp} onChange={(e) => updateItem(index, 'mrp', e.target.value)} /></td>
                <td className="p-2"><input type="number" className="w-full bg-white/60 border border-slate-300 shadow-sm outline-none text-sm font-semibold p-1.5 rounded focus:bg-white focus:ring-2 focus:ring-primary/50 transition-all" value={item.rate === 0 ? '' : item.rate} onChange={(e) => updateItem(index, 'rate', e.target.value)} /></td>
                <td className="p-2"><input type="number" className="w-full bg-white/60 border border-slate-300 shadow-sm outline-none text-sm font-semibold p-1.5 rounded focus:bg-white focus:ring-2 focus:ring-primary/50 transition-all" value={item.taxPercent === 0 ? '' : item.taxPercent} onChange={(e) => updateItem(index, 'taxPercent', e.target.value)} onKeyDown={(e) => handleKeyDown(e, index)} /></td>
                <td className="p-2 text-right font-bold text-success">
                  {item.amount > 0 ? item.amount.toFixed(2) : ''}
                </td>
                <td className="p-2 text-center">
                  <button onClick={() => removeRow(index)} className="text-slate-400 hover:text-danger hover:bg-danger/10 p-1 rounded-full transition-colors flex items-center justify-center mx-auto">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <div className="p-4 border-t border-slate-100 flex justify-center">
          <button onClick={addRow} className="flex items-center gap-2 text-sm text-primary font-medium hover:bg-primary/5 px-4 py-2 rounded-full transition-colors">
            <Plus size={16} /> Add Row
          </button>
        </div>
      </NeuCard>

      {/* Totals Panel */}
      <div className="flex flex-col lg:flex-row justify-between items-end gap-8">
        <div className="w-full lg:w-1/2 p-4 bg-background shadow-neu-down rounded-neu-card border border-white/10">
          <p className="text-sm font-semibold text-slate-500 mb-2">Amount in Words</p>
          <p className="text-lg font-bold text-slate-700 italic border-l-4 border-primary pl-4 py-2">
            {amountInWords}
          </p>
        </div>

        <NeuCard className="w-full lg:w-[400px]">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/20">
              <span className="font-medium text-slate-600">Sub Total</span>
              <span className="font-bold text-slate-800">₹{subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-white/20">
              <span className="flex items-center gap-2 text-slate-600 font-medium">
                CGST 
                <input type="number" step="0.1" className="w-16 bg-white/50 px-2 py-0.5 rounded text-sm outline-none" value={cgstPercent} onChange={e=>setCgstPercent(e.target.value)} />
                %
              </span>
              <span className="font-bold text-slate-800">₹{cgstAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-white/20">
              <span className="flex items-center gap-2 text-slate-600 font-medium">
                SGST 
                <input type="number" step="0.1" className="w-16 bg-white/50 px-2 py-0.5 rounded text-sm outline-none" value={sgstPercent} onChange={e=>setSgstPercent(e.target.value)} />
                %
              </span>
              <span className="font-bold text-slate-800">₹{sgstAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center pt-2" key={grandTotal}>
              <span className="font-bold text-xl text-slate-800">GRAND TOTAL</span>
              <span className="font-bold text-3xl text-success animate-[pulse_0.5s_ease-in-out]">
                ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </NeuCard>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-6 mt-8">
        <NeuButton onClick={clearForm} icon={<Trash2 size={18} />}>Clear Form</NeuButton>
        <NeuButton variant="primary" icon={<Printer size={18} />} onClick={handleSaveAndPrint}>Save & Print</NeuButton>
        <NeuButton variant="success" icon={<Save size={18} />} onClick={saveInvoice}>Save Invoice</NeuButton>
      </div>

      <div className="hidden">
        <div ref={printRef}>
          <InvoicePrint invoice={printData || buildInvoiceObject()} settings={settings} />
        </div>
      </div>

    </div>
  );
};
