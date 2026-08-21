import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import { GymPlan, Gym } from '../types';

export const PlansPage: React.FC = () => {
  const [gym, setGym] = useState<Gym | null>(null);
  const [plans, setPlans] = useState<GymPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // New plan state
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDuration, setNewPlanDuration] = useState(1);
  const [newPlanPrice, setNewPlanPrice] = useState(1500);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const currentGym = await api.getCurrentGym();
      if (currentGym) {
        setGym(currentGym);
        const fetchedPlans = await api.getGymPlans(currentGym.id);
        setPlans(fetchedPlans);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName.trim() || !gym) return;

    const res = await api.addPlan(gym.id, newPlanName.trim(), Number(newPlanDuration), Number(newPlanPrice));
    if (res.success && res.data) {
      setPlans(prev => [...prev, res.data as GymPlan]);
      setNewPlanName('');
      setNewPlanDuration(1);
      setNewPlanPrice(1500);
      setToastMessage('New membership plan tier created successfully!');
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (confirm('Are you sure you want to delete this membership plan?')) {
      const res = await api.deletePlan(id);
      if (res.success) {
        setPlans(prev => prev.filter(p => p.id !== id));
        setToastMessage('Membership plan removed.');
        setTimeout(() => setToastMessage(null), 4000);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!gym) return null;

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-brand-500" />
            Membership Plans Manager
          </h1>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
            {gym.name} • Manage pricing tiers, durations, and subscription options
          </p>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-sm rounded-xl flex items-center justify-between shadow-sm">
          <span>{toastMessage}</span>
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
      )}

      {/* Grid: Existing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div key={p.id} className="bg-white dark:bg-[#121215] p-6 rounded-2xl border-2 border-slate-300 dark:border-zinc-800 shadow-md flex flex-col justify-between space-y-4 hover:border-brand-400 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-200/50 dark:border-brand-500/20">
                  {p.duration_months} Month{p.duration_months > 1 ? 's' : ''} Tier
                </span>
                <button
                  onClick={() => handleDeletePlan(p.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
                  title="Delete Plan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-2">{p.name}</h3>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">Full access to gym facilities & trainer guidance.</p>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-baseline justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">₹{p.price.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Form: Add New Plan Tier */}
      <div className="bg-white dark:bg-[#121215] p-6 rounded-2xl border-2 border-slate-300 dark:border-zinc-800 shadow-md">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-500" />
          Create New Membership Plan Tier
        </h2>

        <form onSubmit={handleAddPlan} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Plan Name
              </label>
              <input
                type="text"
                placeholder="e.g. 6-Month Half Yearly Saver"
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                className="w-full text-sm font-medium text-slate-900 dark:text-white p-2.5 border border-slate-300 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-800/80 focus:ring-2 focus:ring-brand-500/40 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Duration (Months)
              </label>
              <input
                type="number"
                min="1"
                max="36"
                placeholder="1"
                value={newPlanDuration}
                onChange={(e) => setNewPlanDuration(Number(e.target.value))}
                className="w-full text-sm font-mono font-bold text-slate-900 dark:text-white p-2.5 border border-slate-300 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-800/80 focus:ring-2 focus:ring-brand-500/40 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Price (₹)
              </label>
              <input
                type="number"
                min="0"
                placeholder="1500"
                value={newPlanPrice}
                onChange={(e) => setNewPlanPrice(Number(e.target.value))}
                className="w-full text-sm font-mono font-bold text-slate-900 dark:text-white p-2.5 border border-slate-300 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-800/80 focus:ring-2 focus:ring-brand-500/40 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 text-white font-extrabold text-sm rounded-xl hover:bg-brand-600 shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Membership Tier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
