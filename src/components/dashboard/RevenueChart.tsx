import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { NeuCard } from '../ui/NeuCard';

interface RevenueData {
  name: string;
  revenue: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  return (
    <NeuCard className="w-full h-[400px]">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800">Monthly Revenue</h3>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 11 }} 
              width={65}
              tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val} 
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '6px 6px 12px #b8bec7, -6px -6px 12px #ffffff', backgroundColor: '#e0e5ec' }}
              itemStyle={{ color: '#2c7be5', fontWeight: 'bold' }}
              formatter={(value: any) => [`₹${(Number(value) || 0).toLocaleString()}`, 'Revenue']}
            />
            <Bar dataKey="revenue" fill="#2c7be5" radius={[6, 6, 0, 0]} maxBarSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </NeuCard>
  );
};
