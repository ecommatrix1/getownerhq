import React, { useState, useEffect } from 'react';
import { CreditCard, Download, Calendar, Search, Receipt, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import { Payment, Member, GymPlan } from '../types';
import { useDashboard } from '../components/DashboardContext';
import { RevenueAnalyticsChart } from '../components/RevenueAnalyticsChart';

export const PaymentsLedger: React.FC = () => {
  const { gym } = useDashboard();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<GymPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination state (must be at top level before conditional returns)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    const saved = localStorage.getItem('ownerhq_payments_per_page');
    const parsed = saved ? Number(saved) : 25;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 25;
  });

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (gym) {
        setLoading(true);
        try {
          const [fetchedPayments, fetchedMembers, fetchedPlans] = await Promise.all([
            api.getPayments(gym.id),
            api.getMembers(gym.id),
            api.getGymPlans(gym.id)
          ]);
          if (isMounted) {
            setPayments(fetchedPayments || []);
            setMembers(fetchedMembers || []);
            setPlans(fetchedPlans || []);
          }
        } catch (err) {
          console.error('Error fetching payments ledger data:', err);
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      } else {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
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
  const filteredPayments = (payments || []).filter((pay) => {
    if (!pay) return false;
    const member = members.find(m => m && m.id === pay.member_id);
    const memberName = member && member.full_name ? member.full_name.toLowerCase() : '';
    const receiptNum = pay.receipt_number ? pay.receipt_number.toLowerCase() : '';
    const matchesSearch = !searchQuery || 
      memberName.includes(searchQuery.toLowerCase()) || 
      receiptNum.includes(searchQuery.toLowerCase());

    let payDate = '';
    if (typeof pay.paid_at === 'string') {
      payDate = pay.paid_at.split('T')[0];
    } else if (pay.paid_at) {
      try {
        payDate = new Date(pay.paid_at).toISOString().split('T')[0];
      } catch {
        payDate = '';
      }
    }
    const matchesStart = !startDate || payDate >= startDate;
    const matchesEnd = !endDate || payDate <= endDate;

    return matchesSearch && matchesStart && matchesEnd;
  });

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalCollected = filteredPayments.reduce((acc, curr) => acc + (Number(curr?.amount) || 0), 0);

  // Client-side CSV export
  const exportToCSV = () => {
    if (filteredPayments.length === 0) return;

    const headers = ['Receipt Number', 'Member Name', 'Plan', 'Amount (INR)', 'Payment Mode', 'Payment Date'];
    const rows = filteredPayments.map(p => {
      const member = members.find(m => m && m.id === p.member_id);
      const paidDate = p.paid_at && !isNaN(new Date(p.paid_at).getTime())
        ? new Date(p.paid_at).toLocaleDateString()
        : 'N/A';
      return [
        `"${p.receipt_number || ''}"`,
        `"${member?.full_name || 'Member'}"`,
        `"${p.plan_name || 'Pass'}"`,
        p.amount || 0,
        `"${p.payment_mode || 'Cash'}"`,
        paidDate
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `payments_ledger_${gym.slug || 'export'}_${new Date().toISOString().split('T')[0]}.csv`);
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

      {/* 12-Month Revenue Comparison Graph */}
      <RevenueAnalyticsChart payments={payments} />

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
                paginatedPayments.map((p) => {
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
                        {p.paid_at && !isNaN(new Date(p.paid_at).getTime())
                          ? new Date(p.paid_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })
                          : 'N/A'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredPayments.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200 bg-slate-50">
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span>
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPayments.length)} of {filteredPayments.length} receipts
              </span>

              {/* Rows Per Page Selector */}
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <span>Rows per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setItemsPerPage(val);
                    setCurrentPage(1);
                    localStorage.setItem('ownerhq_payments_per_page', String(val));
                  }}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={250}>250</option>
                  <option value={500}>500</option>
                  <option value={1000}>1000 (All)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="h-8 px-3 flex items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">
                Page {currentPage} of {totalPages || 1}
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default PaymentsLedger;
