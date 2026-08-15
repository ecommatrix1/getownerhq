import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, Search, Filter, Phone, Activity, Zap, Watch, ShieldAlert,
  UserPlus, MoreVertical, Copy, Trash2, ChevronLeft, ChevronRight, MessageSquare, CreditCard, CheckCircle2
} from 'lucide-react';
import { api } from '../lib/api';
import { Member, GymPlan, Payment } from '../types';
import { ActivateRenewDrawer } from '../components/ActivateRenewDrawer';
import { PartialPaymentDrawer } from '../components/PartialPaymentDrawer';
import { AddDueModal } from '../components/AddDueModal';
import { AddMemberModal } from '../components/AddMemberModal';
import { useDashboard } from '../components/DashboardContext';
import { RevenueAnalyticsChart } from '../components/RevenueAnalyticsChart';
import { getEffectiveStatus, parseDateOnly, getDaysUntilExpiry } from '../utils/status';

interface DashboardOverviewProps {
  onNavigate: (route: string) => void;
  currentPath?: string;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate, currentPath }) => {
  const { isReadOnly, gym } = useDashboard();
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<GymPlan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Sorting & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'expiring' | 'expired' | 'lost' | 'pending-dues'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'join-date' | 'expiry-date'>(() => {
    return (localStorage.getItem('ownerhq_sort_pref') as any) || 'newest';
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    const saved = localStorage.getItem('ownerhq_items_per_page');
    return saved ? Number(saved) : 10;
  });

  const [selectedMemberForRenew, setSelectedMemberForRenew] = useState<Member | null>(null);
  const [isRenewDrawerOpen, setIsRenewDrawerOpen] = useState(false);
  const [selectedMemberForPartial, setSelectedMemberForPartial] = useState<Member | null>(null);
  const [isPartialDrawerOpen, setIsPartialDrawerOpen] = useState(false);
  const [selectedMemberForAddDue, setSelectedMemberForAddDue] = useState<Member | null>(null);
  const [isAddDueModalOpen, setIsAddDueModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (gym) {
      setLoading(true);
      const [fetchedMembers, fetchedPlans, fetchedPayments] = await Promise.all([
        api.getMembers(gym.id),
        api.getGymPlans(gym.id),
        api.getPayments(gym.id)
      ]);
      setMembers(fetchedMembers);
      setPlans(fetchedPlans);
      setPayments(fetchedPayments);
    }
    setLoading(false);
  }, [gym]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as any;
    setSortBy(val);
    localStorage.setItem('ownerhq_sort_pref', val);
    setCurrentPage(1);
  };

  // Memoized Stats & Lost Logic (USING getEffectiveStatus)
  const stats = useMemo(() => {
    let active = 0, expiring = 0, expired = 0, lost = 0, pendingDues = 0;

    members.forEach(m => {
      const effStatus = getEffectiveStatus(m);
      if (effStatus === 'active') active++;
      if (effStatus === 'expiring') expiring++;
      if (effStatus === 'expired') {
        if (m.expiry_date) {
          const now = new Date().getTime();
          const daysSinceExpiry = (now - new Date(m.expiry_date).getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceExpiry > 90) lost++;
          else expired++;
        } else {
          expired++;
        }
      }
      if ((m.outstanding_dues || 0) > 0) pendingDues++;
    });
    return { active, expiring, expired, lost, pendingDues, total: members.length };
  }, [members]);

  // Memoized Filtering & Sorting (USING getEffectiveStatus)
  const filteredAndSortedMembers = useMemo(() => {
    const now = new Date().getTime();
    
    // Filter
    let result = members.filter(m => {
      const effStatus = getEffectiveStatus(m);

      // Search
      const searchMatch = !searchQuery || 
        m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.mobile.includes(searchQuery);
      
      if (!searchMatch) return false;

      // Tab filter
      if (activeFilter === 'all') return true;
      if (activeFilter === 'pending-dues') {
        return (m.outstanding_dues || 0) > 0;
      }
      if (activeFilter === 'lost') {
        if (effStatus !== 'expired' || !m.expiry_date) return false;
        const daysSinceExpiry = (now - new Date(m.expiry_date).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceExpiry > 90;
      }
      if (activeFilter === 'expired') {
        if (effStatus !== 'expired') return false;
        if (!m.expiry_date) return true;
        const daysSinceExpiry = (now - new Date(m.expiry_date).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceExpiry <= 90;
      }
      return effStatus === activeFilter;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.registered_at).getTime() - new Date(a.registered_at).getTime();
        case 'oldest': return new Date(a.registered_at).getTime() - new Date(b.registered_at).getTime();
        case 'name-asc': return a.full_name.localeCompare(b.full_name);
        case 'name-desc': return b.full_name.localeCompare(a.full_name);
        case 'join-date': return new Date(b.start_date || b.registered_at).getTime() - new Date(a.start_date || a.registered_at).getTime();
        case 'expiry-date': return new Date(a.expiry_date || '2099').getTime() - new Date(b.expiry_date || '2099').getTime();
        default: return 0;
      }
    });

    return result;
  }, [members, searchQuery, activeFilter, sortBy]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredAndSortedMembers.length / itemsPerPage);
  const currentMembers = filteredAndSortedMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const revenueToday = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return payments
      .filter(p => p.paid_at && p.paid_at.startsWith(todayStr))
      .reduce((acc, p) => acc + Number(p.amount || 0), 0);
  }, [payments]);

  const handleDeleteMember = async (memberId: string) => {
    if (confirm('Are you sure you want to completely remove this member? This action cannot be undone.')) {
      setLoading(true);
      const res = await api.deleteMember(memberId);
      setLoading(false);
      if (res.success) {
        setToastMessage('Member deleted successfully!');
        loadData();
        setTimeout(() => setToastMessage(null), 5000);
      } else {
        alert(res.message || 'Failed to delete member.');
      }
    }
  };

  const getWhatsAppLink = (member: Member) => {
    const text = encodeURIComponent(`Hi ${member.full_name}, your gym membership at ${gym?.name} ${getEffectiveStatus(member) === 'expired' ? 'has expired' : 'is active'}.`);
    return `https://wa.me/91${member.mobile}?text=${text}`;
  };

  if (loading) return null;

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-sm rounded-xl flex items-center justify-between shadow-sm">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)}>✕</button>
        </div>
      )}

      {/* Header */}
      {(() => {
        const isMembersRoute = currentPath?.toLowerCase().includes('member');
        return (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {isMembersRoute ? 'Members Directory' : 'Dashboard'}
              </h1>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {isMembersRoute ? 'Home > Members Directory & Management' : 'Home > Overview'}
              </p>
            </div>
            {!isReadOnly && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-[#2563EB] text-white font-bold text-sm px-5 py-3 sm:py-2 rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95 w-full sm:w-auto"
              >
                <UserPlus className="w-5 h-5 sm:w-4 sm:h-4" />
                Add Member
              </button>
            )}
          </div>
        );
      })()}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
        <MetricCard label="Total Members" value={stats.total} icon={Users} color="bg-blue-50 text-blue-700 border-blue-200" onClick={() => setActiveFilter('all')} active={activeFilter === 'all'} />
        <MetricCard label="Active Members" value={stats.active} icon={Users} color="bg-emerald-50 text-emerald-700 border-emerald-200" onClick={() => setActiveFilter('active')} active={activeFilter === 'active'} />
        <MetricCard label="Expiring Soon (Next 3 days)" value={stats.expiring} icon={Watch} color="bg-amber-50 text-amber-700 border-amber-200" onClick={() => setActiveFilter('expiring')} active={activeFilter === 'expiring'} />
        <MetricCard label="Expired Members" value={stats.expired} icon={Zap} color="bg-red-50 text-red-700 border-red-200" onClick={() => setActiveFilter('expired')} active={activeFilter === 'expired'} />
        <MetricCard label="Pending Dues" value={stats.pendingDues} icon={CreditCard} color="bg-purple-50 text-purple-700 border-purple-200" onClick={() => setActiveFilter('pending-dues')} active={activeFilter === 'pending-dues'} />
        <MetricCard label="Lost Members (> 90 days)" value={stats.lost} icon={ShieldAlert} color="bg-slate-50 text-slate-700 border-slate-200" onClick={() => setActiveFilter('lost')} active={activeFilter === 'lost'} />
        <div className="col-span-2 md:col-span-1 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between transition-colors duration-200">
          <div className="flex items-center gap-2 mb-2">
             <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
               <Activity className="w-4 h-4" />
             </div>
          </div>
          <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Revenue Today</div>
          <div className="text-xl font-extrabold mt-1 text-slate-900 dark:text-slate-100">₹{revenueToday.toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-500 mt-1">Total Collections</div>
        </div>
      </div>

      {/* 12-Month Revenue Comparison & Growth Analytics */}
      <RevenueAnalyticsChart payments={payments} />

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name or mobile number..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-200"
          />
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300 py-2.5 pl-3 pr-8 rounded-xl focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors duration-200"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expiring">Expiring</option>
            <option value="expired">Expired</option>
            <option value="lost">Lost</option>
            <option value="pending-dues">Pending Dues</option>
          </select>

          <select 
            value={sortBy} 
            onChange={handleSortChange}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300 py-2.5 pl-3 pr-8 rounded-xl focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors duration-200"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="join-date">Join Date</option>
            <option value="expiry-date">Expiry Date</option>
          </select>
        </div>
      </div>

      {/* Member List Container (Responsive: Mobile Cards + Desktop Table) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col transition-colors duration-200">
        
        {/* MOBILE CARD VIEW (< md screens: 100% width, zero horizontal scrolling) */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-700/50">
          {currentMembers.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mb-1">No members found</h3>
              <p className="text-xs">Try adjusting your search or filters.</p>
            </div>
          ) : (
            currentMembers.map((member, index) => {
              const plan = plans.find(p => p.id === (member.plan_id || member.current_plan_id));
              const effStatus = getEffectiveStatus(member);
              const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
              
              let daysLeftText = '';
              if (member.expiry_date) {
                const diffDays = getDaysUntilExpiry(member.expiry_date);
                if (diffDays >= 0) {
                  daysLeftText = `(${diffDays} days left)`;
                } else {
                  daysLeftText = `(${Math.abs(diffDays)} days ago)`;
                }
              }

              return (
                <MemberMobileCard
                  key={member.id}
                  index={globalIndex}
                  member={member}
                  plan={plan}
                  effStatus={effStatus}
                  daysLeftText={daysLeftText}
                  isReadOnly={isReadOnly}
                  waLink={getWhatsAppLink(member)}
                  onRenew={() => {
                    setSelectedMemberForRenew(member);
                    setIsRenewDrawerOpen(true);
                  }}
                  onPartialPayment={() => {
                    setSelectedMemberForPartial(member);
                    setIsPartialDrawerOpen(true);
                  }}
                  onAddDue={() => {
                    setSelectedMemberForAddDue(member);
                    setIsAddDueModalOpen(true);
                  }}
                  onDelete={() => handleDeleteMember(member.id)}
                  totalRows={filteredAndSortedMembers.length}
                />
              );
            })
          )}
        </div>

        {/* DESKTOP TABLE VIEW (>= md screens) */}
        <div className="hidden md:block overflow-x-auto scrollbar-thin">
          <table className="min-w-[750px] w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50">
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Mobile</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Expiry Date</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {currentMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mb-1">No members found</h3>
                    <p className="text-sm">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              ) : (
                currentMembers.map((member, index) => {
                  const plan = plans.find(p => p.id === (member.plan_id || member.current_plan_id));
                  const effStatus = getEffectiveStatus(member);
                  const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  
                  let daysLeftText = '';
                  if (member.expiry_date) {
                    const diffDays = getDaysUntilExpiry(member.expiry_date);
                    if (diffDays >= 0) {
                      daysLeftText = `(${diffDays} days left)`;
                    } else {
                      daysLeftText = `(${Math.abs(diffDays)} days ago)`;
                    }
                  }

                  return (
                    <MemberTableRow 
                      key={member.id}
                      index={globalIndex}
                      member={member}
                      plan={plan}
                      effStatus={effStatus}
                      daysLeftText={daysLeftText}
                      isReadOnly={isReadOnly}
                      waLink={getWhatsAppLink(member)}
                      onRenew={() => {
                        setSelectedMemberForRenew(member);
                        setIsRenewDrawerOpen(true);
                      }}
                      onPartialPayment={() => {
                        setSelectedMemberForPartial(member);
                        setIsPartialDrawerOpen(true);
                      }}
                      onAddDue={() => {
                        setSelectedMemberForAddDue(member);
                        setIsAddDueModalOpen(true);
                      }}
                      onDelete={() => handleDeleteMember(member.id)}
                      totalRows={filteredAndSortedMembers.length}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        {filteredAndSortedMembers.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span>
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedMembers.length)} of {filteredAndSortedMembers.length} members
              </span>

              {/* Rows Per Page Selector */}
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                <span>Rows per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setItemsPerPage(val);
                    setCurrentPage(1);
                    localStorage.setItem('ownerhq_items_per_page', String(val));
                  }}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value={5}>5</option>
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
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="h-8 px-3 flex items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">
                Page {currentPage} of {totalPages || 1}
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ActivateRenewDrawer
        isOpen={isRenewDrawerOpen}
        onClose={() => {
          setIsRenewDrawerOpen(false);
          setSelectedMemberForRenew(null);
        }}
        member={selectedMemberForRenew}
        onSuccess={(receiptNumber, shouldPrint) => {
          setToastMessage(`Plan updated successfully! Receipt: ${receiptNumber}`);
          loadData();
          setTimeout(() => setToastMessage(null), 5000);
          
          if (shouldPrint) {
            setTimeout(() => {
               window.print();
            }, 300);
          }
        }}
      />

      <PartialPaymentDrawer
        isOpen={isPartialDrawerOpen}
        onClose={() => {
          setIsPartialDrawerOpen(false);
          setSelectedMemberForPartial(null);
        }}
        member={selectedMemberForPartial}
        onSuccess={() => {
          setToastMessage('Payment recorded successfully!');
          loadData();
          setIsPartialDrawerOpen(false);
          setTimeout(() => setToastMessage(null), 5000);
        }}
      />

      <AddDueModal
        isOpen={isAddDueModalOpen}
        onClose={() => setIsAddDueModalOpen(false)}
        member={selectedMemberForAddDue}
        onSuccess={() => {
          setToastMessage('Manual due added successfully!');
          loadData();
          setIsAddDueModalOpen(false);
          setTimeout(() => setToastMessage(null), 5000);
        }}
      />

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setToastMessage('Member added successfully!');
          loadData();
          setIsAddModalOpen(false);
          setTimeout(() => setToastMessage(null), 5000);
        }}
      />
    </div>
  );
};

// --- Subcomponents ---

const MetricCard = ({ label, value, icon: Icon, color, onClick, active }: any) => (
  <button 
    onClick={onClick}
    className={`p-4 rounded-xl border text-left transition-all duration-300 ease-out active:scale-95 hover:-translate-y-1 hover:shadow-lg ${color} ${active ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-blue-500/50 shadow-md dark:shadow-blue-500/20' : 'opacity-90 hover:opacity-100'} bg-white dark:bg-slate-800 dark:border-slate-700/80`}
  >
    <div className="flex items-center gap-2 mb-2">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200">
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">{value}</div>
    <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-line">{label.replace(' (', '\n(')}</div>
  </button>
);

const MemberMobileCard = React.memo(({ index, member, plan, effStatus, daysLeftText, isReadOnly, waLink, onRenew, onPartialPayment, onAddDue, onDelete, totalRows }: any) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="p-4 space-y-3 bg-white dark:bg-slate-800 transition-colors">
      {/* Top row: Avatar, Name, Mobile, Status Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
            {member.full_name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{member.full_name}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{member.mobile}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm border ${
            effStatus === 'active' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' :
            effStatus === 'expiring' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' :
            effStatus === 'expired' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' :
            'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
          }`}>
            {effStatus}
          </span>
          {(member.outstanding_dues || 0) > 0 && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm border bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800 whitespace-nowrap">
              Owes ₹{member.outstanding_dues}
            </span>
          )}
        </div>
      </div>

      {/* Middle row: Plan & Expiry */}
      <div className="flex items-center justify-between text-xs border-t border-b border-slate-100 dark:border-slate-700/50 py-2.5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Plan</span>
          <span className="font-bold text-slate-900 dark:text-slate-100">{plan ? plan.name : 'No Plan'}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">₹{member.amount_paid || 0}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Expiry Date</span>
          <span className="font-medium text-slate-900 dark:text-slate-200">
            {member.expiry_date ? parseDateOnly(member.expiry_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-300 font-semibold block">{daysLeftText}</span>
        </div>
      </div>

      {/* Bottom Action Controls */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <a 
            href={waLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 hover:text-emerald-600 transition-colors"
            title="WhatsApp"
          >
            <MessageSquare className="w-4 h-4" />
          </a>
          <a 
            href={`tel:${member.mobile}`} 
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 transition-colors"
            title="Call"
          >
            <Phone className="w-4 h-4" />
          </a>
        </div>

        <div className="flex items-center gap-2">
          {!isReadOnly && (
            (member.outstanding_dues || 0) > 0 ? (
              <button 
                onClick={onPartialPayment}
                className="px-3.5 h-9 flex items-center gap-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors shadow-sm"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay Dues</span>
              </button>
            ) : effStatus === 'active' ? (
              <button 
                onClick={onRenew}
                className="px-3.5 h-9 flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Active</span>
              </button>
            ) : (
              <button 
                onClick={onRenew}
                className="px-3.5 h-9 flex items-center gap-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>{effStatus === 'pending' ? 'Activate' : 'Renew'}</span>
              </button>
            )
          )}

          <div className="relative">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              onBlur={() => setTimeout(() => setMenuOpen(false), 200)}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {menuOpen && (
              <div className={`absolute right-0 ${(totalRows > 1 && index > 1 && index >= totalRows - 1) ? 'bottom-full mb-1' : 'top-full mt-1'} w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg rounded-xl p-1 z-50`}>
                <button 
                  onClick={() => navigator.clipboard.writeText(member.mobile)} 
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg"
                >
                  <Copy className="w-4 h-4 text-slate-400 dark:text-slate-500" /> Copy No.
                </button>
                {!isReadOnly && (
                  <>
                    <button 
                      onClick={() => {
                        onAddDue();
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg"
                    >
                      <CreditCard className="w-4 h-4" /> Add Due
                    </button>
                    <button 
                      onClick={() => {
                        onRenew();
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                    >
                      <UserPlus className="w-4 h-4" /> Renew
                    </button>
                    <button 
                      onClick={onDelete} 
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" /> Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

const MemberTableRow = React.memo(({ index, member, plan, effStatus, daysLeftText, isReadOnly, waLink, onRenew, onPartialPayment, onAddDue, onDelete, totalRows }: any) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
      <td className="px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-400">{index}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
            {member.full_name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{member.full_name}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Member</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-300">{member.mobile}</td>
      <td className="px-6 py-4">
        <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{plan ? plan.name : 'No Plan'}</div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400">₹{member.amount_paid || 0}</div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col items-start gap-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm border ${
            effStatus === 'active' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' :
            effStatus === 'expiring' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' :
            effStatus === 'expired' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' :
            'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
          }`}>
            {effStatus}
          </span>
          {(member.outstanding_dues || 0) > 0 && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm border bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800 whitespace-nowrap">
              Owes ₹{member.outstanding_dues}
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-slate-900 dark:text-slate-200">
          {member.expiry_date ? parseDateOnly(member.expiry_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-300 font-semibold">{daysLeftText}</div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          <a 
            href={waLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors"
            title="WhatsApp"
          >
            <MessageSquare className="w-4 h-4" />
          </a>
          <a 
            href={`tel:${member.mobile}`} 
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
            title="Call"
          >
            <Phone className="w-4 h-4" />
          </a>
          
          {!isReadOnly && (
            (member.outstanding_dues || 0) > 0 ? (
              <button 
                onClick={onPartialPayment}
                className="px-3 h-8 flex items-center gap-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors shadow-sm"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pay Dues</span>
              </button>
            ) : effStatus === 'active' ? (
              <button 
                onClick={onRenew}
                className="px-3 h-8 flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Active</span>
              </button>
            ) : (
              <button 
                onClick={onRenew}
                className="px-3 h-8 flex items-center gap-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{effStatus === 'pending' ? 'Activate' : 'Renew'}</span>
              </button>
            )
          )}

          <div className="relative">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              onBlur={() => setTimeout(() => setMenuOpen(false), 200)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {menuOpen && (
              <div className={`absolute right-0 ${(totalRows > 1 && index > 1 && index >= totalRows - 1) ? 'bottom-full mb-1' : 'top-full mt-1'} w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg rounded-xl p-1 z-50`}>
                <button 
                  onClick={() => navigator.clipboard.writeText(member.mobile)} 
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg"
                >
                  <Copy className="w-4 h-4 text-slate-400 dark:text-slate-500" /> Copy No.
                </button>
                {!isReadOnly && (
                  <>
                    <button 
                      onClick={() => {
                        onAddDue();
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg"
                    >
                      <CreditCard className="w-4 h-4" /> Add Due
                    </button>
                    <button 
                      onClick={() => {
                        onRenew();
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                    >
                      <UserPlus className="w-4 h-4" /> Renew
                    </button>
                    <button 
                      onClick={onDelete} 
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" /> Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
});
