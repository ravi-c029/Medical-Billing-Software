import { useMemo } from 'react';
import { useInvoiceStore } from '../store/invoiceStore';
import { useProductStore } from '../store/productStore';
import { StatCard } from '../components/dashboard/StatCard';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { NeuCard } from '../components/ui/NeuCard';
import { format, isToday, eachMonthOfInterval, isSameMonth } from 'date-fns';
import { IndianRupee, FileText, Package, Clock } from 'lucide-react';

export const Dashboard = () => {
  const { invoices } = useInvoiceStore();
  const { medicines } = useProductStore();

  const todayRevenue = useMemo(() => {
    return invoices
      .filter((inv) => isToday(new Date(inv.date)))
      .reduce((sum, inv) => sum + inv.grandTotal, 0);
  }, [invoices]);

  const unpaidCount = useMemo(() => {
    return invoices.filter((inv) => inv.status === 'unpaid').length;
  }, [invoices]);

  // DERIVE Dynamic monthly data starting from April (Financial Year)
  const chartData = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0 is January
    
    // Indian Financial Year starts in April (Month Index 3)
    let startYear = currentYear;
    if (currentMonth < 3) {
      startYear = currentYear - 1;
    }
    
    // Always show full 12 months of the financial year (Apr to Mar)
    const financialYearStart = new Date(startYear, 3, 1);
    const financialYearEnd = new Date(startYear + 1, 2, 31);
    
    const months = eachMonthOfInterval({
      start: financialYearStart,
      end: financialYearEnd,
    });

    return months.map(month => {
      const monthName = format(month, 'MMM');
      const revenue = invoices
        .filter(inv => isSameMonth(new Date(inv.date), month))
        .reduce((sum, inv) => sum + inv.grandTotal, 0);
      return { name: monthName, revenue };
    });
  }, [invoices]);

  const recentInvoices = useMemo(() => {
    return [...invoices].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  }, [invoices]);

  // Best sellers based on quantity sold
  const bestSellers = useMemo(() => {
    const sales: Record<string, number> = {};
    invoices.forEach(inv => {
      inv.items.forEach(item => {
        sales[item.productName] = (sales[item.productName] || 0) + item.qty;
      });
    });
    
    return Object.entries(sales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, qty]) => ({ name, qty }));
  }, [invoices]);

  // Top customers by total revenue
  const topCustomers = useMemo(() => {
    const customers: Record<string, number> = {};
    invoices.forEach(inv => {
      customers[inv.customerName] = (customers[inv.customerName] || 0) + inv.grandTotal;
    });

    return Object.entries(customers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, total]) => ({ name, total }));
  }, [invoices]);

  // Low stock alert (medicines with stock < 10)
  const lowStockMedicines = useMemo(() => {
    return medicines.filter(m => (m.stock ?? 0) < 10).slice(0, 5);
  }, [medicines]);

  return (
    <div className="animate-fade-in w-full max-w-7xl mx-auto pb-10 space-y-8">
      
      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="delay-100 animate-fade-in opacity-0">
          <StatCard 
            title="Today's Revenue" 
            value={todayRevenue} 
            prefix="₹"
            icon={<IndianRupee className="text-success" size={24} />} 
            colorClass="text-success" 
          />
        </div>
        <div className="delay-200 animate-fade-in opacity-0">
          <StatCard 
            title="Total Invoices" 
            value={invoices.length} 
            icon={<FileText className="text-primary" size={24} />} 
            colorClass="text-primary" 
          />
        </div>
        <div className="delay-300 animate-fade-in opacity-0">
          <StatCard 
            title="Total Products" 
            value={medicines.length} 
            icon={<Package className="text-warning" size={24} />} 
            colorClass="text-warning" 
          />
        </div>
        <div className="delay-400 animate-fade-in opacity-0">
          <StatCard 
            title="Unpaid Invoices" 
            value={unpaidCount} 
            icon={<Clock className="text-danger" size={24} />} 
            colorClass="text-danger" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2">
          <RevenueChart data={chartData} />
        </div>

        {/* Best Sellers */}
        <div>
          <NeuCard className="h-full">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Top Selling Products</h3>
            {bestSellers.length > 0 ? (
              <div className="space-y-4">
                {bestSellers.map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-background shadow-neu-down">
                    <span className="font-semibold text-slate-700">{item.name}</span>
                    <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">{item.qty} units</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-500 mt-10">No sales data yet.</div>
            )}
          </NeuCard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Customers */}
        <NeuCard>
          <h3 className="text-lg font-bold text-slate-800 mb-6">Valuable Customers</h3>
          {topCustomers.length > 0 ? (
            <div className="space-y-4">
              {topCustomers.map((cust, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-background shadow-neu-down">
                  <span className="font-semibold text-slate-700">{cust.name}</span>
                  <span className="text-sm font-bold text-success">₹{cust.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-500 py-6 italic">No customer data yet.</div>
          )}
        </NeuCard>

        {/* Low Stock Alerts */}
        <NeuCard>
          <h3 className="text-lg font-bold text-slate-800 mb-6">Inventory Alerts (Low Stock)</h3>
          {lowStockMedicines.length > 0 ? (
            <div className="space-y-4">
              {lowStockMedicines.map((med, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-background shadow-neu-down border-l-4 border-danger">
                  <div>
                    <div className="font-semibold text-slate-700">{med.name}</div>
                    <div className="text-xs text-slate-500">{med.mfdBy}</div>
                  </div>
                  <span className="text-sm font-bold text-danger px-3 py-1 bg-danger/5 rounded-full">
                    {med.stock} left
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-500 py-6 italic">All products are well-stocked!</div>
          )}
        </NeuCard>
      </div>

      {/* Recent Invoices */}
      <NeuCard>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800">Recent Invoices</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-3 text-slate-500 font-medium">Inv No</th>
                <th className="pb-3 text-slate-500 font-medium">Date</th>
                <th className="pb-3 text-slate-500 font-medium">Customer</th>
                <th className="pb-3 text-slate-500 font-medium">Amount</th>
                <th className="pb-3 text-slate-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.map((inv) => (
                <tr key={inv.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                  <td className="py-4 font-semibold text-slate-700">#{inv.invoiceNo}</td>
                  <td className="py-4 text-slate-600">{format(new Date(inv.date), 'dd MMM yyyy')}</td>
                  <td className="py-4 text-slate-700">{inv.customerName}</td>
                  <td className="py-4 font-bold text-slate-800">₹{inv.grandTotal.toLocaleString()}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      inv.status === 'paid' ? 'bg-success/10 text-success' :
                      inv.status === 'partial' ? 'bg-warning/10 text-warning' :
                      'bg-danger/10 text-danger'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentInvoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">No recent invoices found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </NeuCard>

    </div>
  );
};
