import React, { useState, useEffect } from 'react';
import { CreditCard, Download, Calendar, Search, Receipt, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { Payment, Member, GymPlan } from '../types';
import { useDashboard } from '../components/DashboardContext';

export const PaymentsLedger: React.FC = () => {
  const { gym } = useDashboard();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<GymPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (gym) {
        setLoading(true);
        const [fetchedPayments, fetchedMembers, fetchedPlans] = await Promise.all([
          api.getPayments(gym.id),
          api.getMembers(gym.id),
          api.getGymPlans(gym.id)
        ]);
        setPayments(fetchedPayments);
        setMembers(fetchedMembers);
        setPlans(fetchedPlans);
      }
      setLoading(false);
    };
    fetchData();
  }, [gym]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!gym) return null;

  // Filter payments
  const filteredPayments = payments.filter((pay) => {
    const member = members.find(m => m.id === pay.member_id);
    const memberName = member ? member.full_name.toLowerCase() : '';
    const matchesSearch = !searchQuery || 
      memberName.includes(searchQuery.toLowerCase()) || 
      pay.receipt_number.toLowerCase().includes(searchQuery.toLowerCase());

    const payDate = pay.paid_at.split('T')[0];
    const matchesStart = !startDate || payDate >= startDate;
    const matchesEnd = !endDate || payDate <= endDate;

    return matchesSearch && matchesStart && matchesEnd;
  });

  const totalCollected = filteredPayments.reduce((acc, curr) => acc + Number(curr.amount), 0);

  // Client-side CSV export
  const exportToCSV = () => {
    if (filteredPayments.length === 0) return;

    const headers = ['Receipt Number', 'Member Name', 'Plan', 'Amount (INR)', 'Payment Mode', 'Payment Date'];
    const rows = filteredPayments.map(p => {
      const member = members.find(m => m.id === p.member_id);
      return [
        p.receipt_number,
        `"${member?.full_name || 'Member'}"`,
        `"${p.plan_name || 'Pass'}"`,
        p.amount,
        p.payment_mode,
        new Date(p.paid_at).toLocaleDateString()
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `payments_ledger_${gym.slug}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Payments Ledger</h1>
          <p className="text-sm font-medium text-slate-500">
            {gym.name} • Payment Receipts & Financial Records
          </p>
        </div>

        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-bold text-sm px-4 py-2 rounded-xl hover:bg-slate-50 shadow-sm transition-all active:scale-95"
        >
          <Download className="w-4 h-4 text-slate-400" />
          Export CSV Report
        </button>
      </div>

      {/* Summary card & date filter bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-blue-600 text-white p-5 rounded-2xl shadow-sm border border-blue-700">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-200 mb-1">Total Revenue</div>
          <div className="text-3xl font-extrabold font-mono">₹{totalCollected.toLocaleString('en-IN')}</div>
          <div className="text-xs font-medium text-blue-100 mt-1">{filteredPayments.length} Receipts Logged</div>
        </div>

        <div className="md:col-span-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by member name or receipt #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto text-sm font-mono text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-1.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-1.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 text-xs">
              <tr>
                <th className="p-4">Receipt #</th>
                <th className="p-4">Member Name</th>
                <th className="p-4">Plan Name</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Mode</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-medium font-sans">
                    No payment receipts logged matching this filter.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const member = members.find(m => m.id === p.member_id);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors text-slate-700">
                      <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-slate-400" />
                        {p.receipt_number}
                      </td>
                      <td className="p-4 font-sans font-bold text-slate-900">
                        {member ? member.full_name : 'Walk-in Member'}
                      </td>
                      <td className="p-4 text-slate-600">
                        {p.plan_name || 'Pass'}
                      </td>
                      <td className="p-4 font-bold text-emerald-600">
                        ₹{p.amount}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-md bg-slate-100 font-bold text-[10px] text-slate-600 uppercase tracking-wider">
                          {p.payment_mode}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">
                        {new Date(p.paid_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
