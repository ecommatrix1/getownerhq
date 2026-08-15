import React, { useState, useEffect } from 'react';
import { Dumbbell, ShieldCheck, CheckCircle2, Phone, User, KeyRound, AlertCircle, ArrowRight, RefreshCw, MapPin, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { Gym } from '../types';

interface PublicRegistrationPageProps {
  slug: string;
  onNavigate: (route: string) => void;
}

export const PublicRegistrationPage: React.FC<PublicRegistrationPageProps> = ({ slug, onNavigate }) => {
  const [gym, setGym] = useState<Gym | null>(null);
  const [loadingGym, setLoadingGym] = useState(true);

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Form, 2: OTP Verification, 3: Success
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [joinDate, setJoinDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [otpCode, setOtpCode] = useState('');
  const [sentOtpDemo, setSentOtpDemo] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [otpMessage, setOtpMessage] = useState('');

  useEffect(() => {
    const fetchGym = async () => {
      const data = await api.getGymBySlug(slug);
      setGym(data);
      setLoadingGym(false);
    };
    fetchGym();
  }, [slug]);

  if (loadingGym) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-extrabold text-slate-900 mb-2">Gym Not Found</h1>
          <p className="text-slate-500 text-sm">The registration link you used is invalid or the gym does not exist.</p>
        </div>
      </div>
    );
  }

  // Generate Dummy OTP
  const generateDummyOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

  // Direct Member Registration Submission
  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanName = fullName.trim();
    const cleanMobile = mobile.replace(/\D/g, '');

    if (!cleanName) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (cleanMobile.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    setLoading(true);
    const regRes = await api.registerMemberPublic(gym.id, cleanName, cleanMobile, joinDate);
    setLoading(false);

    if (!regRes.success) {
      setErrorMsg(regRes.message || 'Registration failed. Please try again.');
      return;
    }

    setStep(3); // Instant Success Screen
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans max-w-lg mx-auto border-x border-slate-200 shadow-sm">
      
      {/* Gym Branded Header */}
      <header className="bg-white border-b border-slate-200 p-6 rounded-b-3xl shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{gym.name}</h1>
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5" /> {gym.city} • Self Registration Desk
            </div>
          </div>
        </div>
      </header>

      {/* Main Form Body */}
      <main className="flex-1 p-6">
        
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-8 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className={`flex items-center gap-1.5 ${step === 1 ? 'text-blue-600' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>1</span>
            Your Details
          </div>
          <div className="h-0.5 flex-1 bg-slate-200 mx-3"></div>
          <div className={`flex items-center gap-1.5 ${step === 3 ? 'text-emerald-600' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>2</span>
            Pass Ready
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-800 text-xs font-medium rounded-2xl flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              {errorMsg}
            </div>
          </div>
        )}

        {/* STEP 1: Full Name & Mobile Number Form */}
        {step === 1 && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Get Gym Entry Pass</h2>
              <p className="text-sm text-slate-500 mt-1 font-medium">
                Enter your details to generate your digital membership pass.
              </p>
            </div>

            <form onSubmit={handleSubmitRegistration} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mobile Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-xs font-mono font-bold text-slate-500">+91</span>
                  <Phone className="w-4 h-4 text-slate-400 absolute left-12 top-3.5" />
                  <input
                    type="tel"
                    placeholder="98765 43210"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full pl-20 pr-4 py-3 text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  When did you join this gym?
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={joinDate}
                    onChange={(e) => setJoinDate(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-1.5">
                  Don't remember? Leave today's date. The gym can update it later.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#2563EB] text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95 disabled:opacity-50 mt-4"
              >
                {loading ? 'Submitting Registration...' : 'Submit Registration Pass'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}



        {/* STEP 3: Clear Registration Success Screen */}
        {step === 3 && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center relative overflow-hidden">
            
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-full mb-3 border border-slate-200">
              Status: Pending Activation
            </span>

            <h2 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">
              You're Registered!
            </h2>

            <p className="text-sm font-medium text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
              Please see the front desk reception to select your membership plan and activate your pass.
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs font-mono space-y-2 mb-6 shadow-sm">
              <div className="flex justify-between text-slate-500">
                <span>Member Name:</span>
                <span className="font-bold text-slate-900">{fullName}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Mobile Number:</span>
                <span className="font-bold text-slate-900">+91 {mobile}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Registered At:</span>
                <span className="font-bold text-slate-900">{gym.name}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setStep(1);
                setFullName('');
                setMobile('');
                setOtpCode('');
              }}
              className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              Done / Register Another Person
            </button>
          </div>
        )}

      </main>

      {/* Footer info */}
      <footer className="p-4 text-center text-[10px] text-slate-400 font-mono border-t border-slate-200">
        <div className="flex items-center justify-center gap-1 mb-1 text-slate-500 font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          Verified Secure Self Registration
        </div>
        Powered by getOwnerHQ.com
      </footer>

    </div>
  );
};
