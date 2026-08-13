import React, { useState } from 'react';
import { X, CreditCard } from 'lucide-react';
import { Member } from '../types';
import { api } from '../lib/api';

interface AddDueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  member: Member | null;
}

export const AddDueModal: React.FC<AddDueModalProps> = ({ isOpen, onClose, onSuccess, member }) => {
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Pass the raw amount to add (can be positive or negative, but typically positive for adding dues)
    const res = await api.addManualDue(member.id, amount);
    
    setLoading(false);
    if (res.success) {
      onSuccess();
      onClose();
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col transform transition-transform">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Add Manual Due
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">
              Add a manual charge (e.g. supplements, damage) for <span className="font-bold text-slate-900 dark:text-slate-100">{member.full_name}</span>.
            </p>
            
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Amount to Add (₹)
            </label>
            <input 
              type="number" 
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full text-base font-mono font-bold p-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              required
              autoFocus
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-sm transition-all disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Add Due'}
          </button>
        </form>
      </div>
    </div>
  );
};
