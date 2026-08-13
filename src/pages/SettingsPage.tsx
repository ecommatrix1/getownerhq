import React, { useState, useEffect } from 'react';
import { Settings, Building2, MapPin, Phone, QrCode, Plus, Trash2, Save, Printer, AlertCircle, CheckCircle, Bell, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { GymPlan, Gym } from '../types';

interface SettingsPageProps {
  onOpenStandee: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onOpenStandee }) => {
  const [gym, setGym] = useState<Gym | null>(null);
  const [plans, setPlans] = useState<GymPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [gymName, setGymName] = useState('');
  const [city, setCity] = useState('');
  const [tagline, setTagline] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerMobile, setOwnerMobile] = useState('');
  const [upiId, setUpiId] = useState('');
  const [googlePlaceId, setGooglePlaceId] = useState('');
  const [autoFilterExpiring, setAutoFilterExpiring] = useState(true);

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
        setGymName(currentGym.name);
        setCity(currentGym.city);
        setTagline(currentGym.tagline || '');
        setOwnerName(currentGym.owner_name || '');
        setOwnerMobile(currentGym.owner_mobile || '');
        setUpiId(currentGym.upi_id || '');
        setGooglePlaceId(currentGym.google_place_id || '');
        
        const fetchedPlans = await api.getGymPlans(currentGym.id);
        setPlans(fetchedPlans);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gym) return;
    
    await api.updateGymProfile(gym.id, {
      name: gymName,
      city,
      tagline,
      owner_name: ownerName,
      owner_mobile: ownerMobile,
      upi_id: upiId,
      google_place_id: googlePlaceId,
    });
    setGym(prev => prev ? { ...prev, name: gymName, city, tagline, owner_name: ownerName, owner_mobile: ownerMobile, upi_id: upiId, google_place_id: googlePlaceId } : null);
    
    setToastMessage('Gym profile settings saved successfully!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName.trim() || !gym) return;

    const res = await api.addPlan(gym.id, newPlanName.trim(), Number(newPlanDuration), Number(newPlanPrice));
    if (res.success && res.data) {
      setPlans(prev => [...prev, res.data as GymPlan]);
      setNewPlanName('');
      setNewPlanDuration(1);
      setNewPlanPrice(1500);
      setToastMessage('New membership plan added!');
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
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!gym) return null;

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Gym Settings & Standee</h1>
          <p className="text-sm font-medium text-slate-500">
            {gym.name} • Setup Profile, Custom Plans & Printable QR Poster
          </p>
        </div>

        <button
          onClick={onOpenStandee}
          className="flex items-center gap-2 bg-[#2563EB] text-white font-bold text-sm px-5 py-3 rounded-xl hover:bg-blue-700 shadow-sm transition-all active:scale-95"
        >
          <QrCode className="w-4 h-4" />
          Generate A5 Standee Poster
        </button>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-sm rounded-xl flex items-center justify-between shadow-sm">
          <span>{toastMessage}</span>
          <CheckCircle className="w-4 h-4 text-emerald-600" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Gym Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Gym Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" /> Gym Business Profile
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Gym Name
                  </label>
                  <input
                    type="text"
                    value={gymName}
                    onChange={(e) => setGymName(e.target.value)}
                    className="w-full text-sm font-bold text-slate-900 p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none bg-slate-50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    City / Branch Location
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-sm font-bold text-slate-900 p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none bg-slate-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tagline / Motto
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Transform Your Mind & Body"
                  className="w-full text-sm p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full text-sm p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Owner Mobile Phone
                  </label>
                  <input
                    type="text"
                    value={ownerMobile}
                    onChange={(e) => setOwnerMobile(e.target.value)}
                    className="w-full text-sm font-mono p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    UPI ID for Receipts
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="gymname@upi"
                    className="w-full text-sm font-mono p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Google Place ID</span>
                    <a href="https://developers.google.com/maps/documentation/places/web-service/place-id" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline lowercase text-[10px] normal-case">How to find?</a>
                  </label>
                  <input
                    type="text"
                    value={googlePlaceId}
                    onChange={(e) => setGooglePlaceId(e.target.value)}
                    placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
                    className="w-full text-sm font-mono p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none bg-slate-50"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 shadow-sm"
                >
                  <Save className="w-4 h-4" /> Save Profile Settings
                </button>
              </div>
            </form>
          </div>

          {/* Membership Plans Manager */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-900 mb-6">
              Membership Plans Manager
            </h2>

            {/* List Existing Plans */}
            <div className="space-y-3 mb-6">
              {plans.map((p) => (
                <div key={p.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">Duration: {p.duration_months} Month{p.duration_months > 1 ? 's' : ''}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-extrabold text-slate-900 text-base">₹{p.price}</span>
                    <button
                      onClick={() => handleDeletePlan(p.id)}
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors bg-white border border-slate-200 rounded-lg shadow-sm hover:border-red-200 hover:bg-red-50"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Form: Add New Plan */}
            <form onSubmit={handleAddPlan} className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl space-y-3">
              <div className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Add New Membership Tier</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="Plan Name"
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                    className="w-full text-sm p-2 border border-blue-200 rounded-lg focus:outline-none focus:border-blue-400"
                    required
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Duration (Months)"
                    value={newPlanDuration}
                    onChange={(e) => setNewPlanDuration(Number(e.target.value))}
                    className="w-full text-sm font-mono p-2 border border-blue-200 rounded-lg focus:outline-none focus:border-blue-400"
                    required
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Price (₹)"
                    value={newPlanPrice}
                    onChange={(e) => setNewPlanPrice(Number(e.target.value))}
                    className="w-full text-sm font-mono p-2 border border-blue-200 rounded-lg focus:outline-none focus:border-blue-400"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 shadow-sm mt-2"
              >
                <Plus className="w-4 h-4" /> Add Plan Tier
              </button>
            </form>

          </div>

        </div>

        {/* Right Column: QR Code Standee Card & Dashboard Notifications */}
        <div className="space-y-6">
          
          {/* Quick Standee Card */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl text-center border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 shadow-sm border border-blue-500">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-extrabold text-white mb-2 tracking-tight">
              Front-Desk Standee
            </h3>

            <p className="text-sm font-medium text-slate-400 leading-relaxed mb-6">
              Print this A5 poster and keep it on your reception desk. Members scan the QR code to self-register.
            </p>

            <div className="bg-white/10 p-3 rounded-xl border border-white/20 text-xs font-mono font-medium mb-6 truncate text-blue-400">
              getownerhq.com/r/{gym.slug}
            </div>

            <button
              onClick={onOpenStandee}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-500 shadow-lg transition-transform active:scale-95"
            >
              <Printer className="w-4 h-4" /> Open & Print Poster
            </button>
          </div>

          {/* Preferences / Toggles */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" /> Dashboard Preferences
            </h3>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <div className="text-sm font-bold text-slate-900">Auto-Prioritize Expiring</div>
                <div className="text-xs font-medium text-slate-500 mt-0.5">Show members expiring within 3 days on load</div>
              </div>
              <input
                type="checkbox"
                checked={autoFilterExpiring}
                onChange={(e) => setAutoFilterExpiring(e.target.checked)}
                className="w-4 h-4 text-blue-600 accent-blue-600 rounded cursor-pointer border-slate-300"
              />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
