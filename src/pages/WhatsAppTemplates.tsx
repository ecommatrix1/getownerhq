import React, { useState, useEffect } from 'react';
import { MessageSquare, ExternalLink, Info, Edit3, Save, Check, Loader2, CheckCircle2, AlertCircle, Sparkles, Send, Phone } from 'lucide-react';
import { api, DEFAULT_TEMPLATES } from '../lib/api';
import { supabase } from '../lib/supabase';
import { WhatsAppTemplate, Gym, WhatsAppAccount } from '../types';

export const WhatsAppTemplatesPage: React.FC = () => {
  const [gym, setGym] = useState<Gym | null>(null);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>(DEFAULT_TEMPLATES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [waAccount, setWaAccount] = useState<WhatsAppAccount | null>(null);
  const [waNotice, setWaNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [testPhone, setTestPhone] = useState<string>('8876640141');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);

  useEffect(() => {
    const fetchGym = async () => {
      const currentGym = await api.getCurrentGym();
      if (currentGym) {
        setGym(currentGym);
        // Check if gym has official WhatsApp Cloud API connected
        const { data: waData } = await supabase
          .from('whatsapp_accounts')
          .select('*')
          .eq('gym_id', currentGym.id)
          .eq('account_status', 'active')
          .maybeSingle();

        if (waData) {
          setWaAccount(waData as WhatsAppAccount);
        }
      }
      setLoading(false);
    };

    fetchGym();

    // Check URL parameters for OAuth return notifications
    const searchParams = new URLSearchParams(window.location.search || window.location.hash.split('?')[1]);
    if (searchParams.get('connected') === 'true') {
      const phone = searchParams.get('phone');
      setWaNotice({
        type: 'success',
        message: `Official WhatsApp Business Account successfully connected! ${phone ? `(${phone})` : ''}`,
      });
    } else if (searchParams.get('error')) {
      setWaNotice({
        type: 'error',
        message: `WhatsApp connection failed: ${decodeURIComponent(searchParams.get('error') || '')}`,
      });
    }
  }, []);

  const handleConnectWhatsApp = async () => {
    if (!gym) return;
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) {
      setWaNotice({ type: 'error', message: 'Please log in to connect your WhatsApp account.' });
      return;
    }
    try {
      const res = await fetch(`/api/whatsapp-connect?gym_id=${gym.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      const data = await res.json();
      if (data.auth_url) {
        window.location.href = data.auth_url;
      } else {
        setWaNotice({ type: 'error', message: data.message || 'Unable to initiate WhatsApp connection' });
      }
    } catch (err: any) {
      setWaNotice({ type: 'error', message: err.message || 'Connection request failed' });
    }
  };

  const handleEdit = (tpl: WhatsAppTemplate) => {
    setEditingId(tpl.id);
    setEditText(tpl.body);
  };

  const handleSave = (id: string) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, body: editText } : t));
    setEditingId(null);
    setSavedNotice('Template updated locally for this session!');
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const handleTestSendOfficial = async () => {
    if (!gym || !testPhone) return;
    setIsSendingTest(true);
    setWaNotice(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        setWaNotice({ type: 'error', message: 'Authentication required. Please re-login.' });
        setIsSendingTest(false);
        return;
      }

      const res = await fetch('/api/whatsapp-test-send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gym_id: gym.id,
          recipient_phone: testPhone,
          message_text: `🏋️ Test Message from ${gym.name}!\n\nThis confirms your OwnerHQ Official WhatsApp Cloud API connection is active and operational. Messages will dispatch directly from your official number!`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setWaNotice({
          type: 'success',
          message: `Official WhatsApp test message sent successfully to ${data.recipient}! (WAMID: ${data.wamid || 'verified'})`,
        });
        setShowTestModal(false);
      } else {
        setWaNotice({
          type: 'error',
          message: `Test send failed: ${data.message || 'Unknown error'}`,
        });
      }
    } catch (err: any) {
      setWaNotice({ type: 'error', message: `Test dispatch error: ${err.message}` });
    } finally {
      setIsSendingTest(false);
    }
  };

  const sampleMember = {
    full_name: 'Rahul Sharma',
    mobile: '9876543210',
    expiry_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  };

  const getPreviewText = (templateBody: string) => {
    if (!gym) return templateBody;
    return templateBody
      .replace(/{member_name}/g, sampleMember.full_name)
      .replace(/{gym_name}/g, gym.name)
      .replace(/{expiry_date}/g, sampleMember.expiry_date || '2026-08-15')
      .replace(/{plan_name}/g, 'Monthly Pass')
      .replace(/{plan_price}/g, '1500')
      .replace(/{upi_id}/g, gym.upi_id || 'gym@upi')
      .replace(/{amount}/g, '1500')
      .replace(/{payment_mode}/g, 'UPI')
      .replace(/{receipt_number}/g, 'REC-PH-1001')
      .replace(/{city}/g, gym.city || 'your city')
      .replace(/{google_review_link}/g, gym.google_place_id ? `https://search.google.com/local/writereview?placeid=${gym.google_place_id}` : '[Please add Google Place ID in Settings]');
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
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">WhatsApp Message Templates</h1>
        <p className="text-sm font-medium text-slate-500">
          Customized Renewal Messages for {gym.name}
        </p>
      </div>

      {/* OAuth Notification Alert */}
      {waNotice && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between shadow-sm border ${
            waNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2.5 font-bold text-sm">
            {waNotice.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span>{waNotice.message}</span>
          </div>
          <button
            onClick={() => setWaNotice(null)}
            className="text-xs font-extrabold uppercase tracking-wider text-slate-500 hover:text-slate-900"
          >
            ✕
          </button>
        </div>
      )}

      {/* Official WhatsApp Cloud API (Meta Embedded Signup) Card */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
              waAccount
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-brand-50 text-brand-600 border border-brand-200'
            }`}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-extrabold text-slate-900 text-base">Official WhatsApp Cloud API</h3>
              {waAccount ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Connected
                </span>
              ) : (
                <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  Not Connected
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
              {waAccount ? (
                <>
                  Active for <strong>{waAccount.verified_name || gym.name}</strong> ({waAccount.display_phone_number || 'Official WABA'}). Automated 3-day expiry reminders will dispatch directly from your official number.
                </>
              ) : (
                <>
                  Connect your Official Meta WhatsApp Business Account via 1-Click Embedded Signup to enable automated background expiry reminders and delivery receipts.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-shrink-0">
          {waAccount ? (
            <>
              <button
                onClick={() => setShowTestModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                Send Test Message
              </button>
              <button
                onClick={handleConnectWhatsApp}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl transition-colors"
              >
                Reconnect
              </button>
            </>
          ) : (
            <button
              onClick={handleConnectWhatsApp}
              className="btn-brand !min-h-[40px] text-xs px-4 py-2 flex items-center gap-2 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Connect Official WhatsApp
            </button>
          )}
        </div>
      </div>

      {/* Manual Sending Disclaimer */}
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3 text-sm text-blue-900 shadow-sm">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-bold mb-1">Manual Click-to-Send WhatsApp Flow (Always Available)</div>
          <p className="text-blue-800 leading-relaxed font-medium">
            Clicking any reminder button on your dashboard creates a pre-filled <code className="bg-white px-2 py-0.5 rounded font-mono border border-blue-200">wa.me</code> link. 
            <strong className="underline ml-1">Click to open WhatsApp and send manually.</strong> No automated spamming or bot configuration required.
          </p>
        </div>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-sm rounded-xl flex items-center justify-between shadow-sm">
          <span>{savedNotice}</span>
          <Check className="w-4 h-4 text-emerald-600" />
        </div>
      )}

      {/* Placeholders Guide */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-xs">
        <div className="font-bold text-slate-900 uppercase tracking-wider mb-3">Available Smart Placeholders:</div>
        <div className="flex flex-wrap gap-2 font-mono">
          {['{member_name}', '{gym_name}', '{expiry_date}', '{plan_name}', '{upi_id}', '{receipt_number}', '{city}', '{google_review_link}'].map(tag => (
            <span key={tag} className="bg-slate-50 px-2 py-1 rounded-md text-slate-700 border border-slate-200 font-bold">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Templates List */}
      <div className="grid grid-cols-1 gap-6">
        {templates.map((tpl) => {
          const isEditing = editingId === tpl.id;
          const preview = getPreviewText(tpl.body);
          const encodedText = encodeURIComponent(preview);
          const sampleWaLink = `https://wa.me/91${sampleMember.mobile}?text=${encodedText}`;

          return (
            <div key={tpl.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900">{tpl.title}</h3>
                    <span className="text-[10px] font-bold font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md uppercase mt-1 inline-block">
                      Category: {tpl.category}
                    </span>
                  </div>
                </div>

                {!isEditing ? (
                  <button
                    onClick={() => handleEdit(tpl)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-xl transition-colors shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Template
                  </button>
                ) : (
                  <button
                    onClick={() => handleSave(tpl.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 px-4 py-2 rounded-xl shadow-sm transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Changes
                  </button>
                )}
              </div>

              {/* Template Body Editor */}
              {isEditing ? (
                <div>
                  <textarea
                    rows={4}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full text-sm font-mono p-3 border border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm font-mono text-slate-700 leading-relaxed font-medium">
                  {tpl.body}
                </div>
              )}

              {/* Live Sample WhatsApp Message Preview */}
              <div className="bg-emerald-50/50 border border-emerald-200 p-5 rounded-2xl text-sm space-y-3">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center justify-between">
                  <span>Live WhatsApp Message Preview:</span>
                  <a
                    href={sampleWaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] bg-emerald-600 text-white px-3 py-1 rounded-lg font-sans font-bold flex items-center gap-1.5 hover:bg-emerald-700 shadow-sm"
                  >
                    Test Send on WhatsApp <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="bg-white p-4 rounded-xl border border-emerald-100 text-slate-800 font-sans shadow-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {preview}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Official WhatsApp Live Test Dispatch Modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Test Official Dispatch</h3>
                  <p className="text-xs text-slate-500 font-medium">Send a live message via Meta Cloud API</p>
                </div>
              </div>
              <button
                onClick={() => setShowTestModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                  Recipient Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value.replace(/\D/g, '').slice(-10))}
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
                  Dispatches directly from your official WhatsApp Business number: <strong>{waAccount?.display_phone_number || 'Connected WABA'}</strong>.
                </p>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-900 font-medium leading-relaxed">
                🏋️ <strong>Sample Test Content:</strong>
                <div className="mt-1 text-slate-700 font-sans italic bg-white p-2.5 rounded-lg border border-emerald-100">
                  "Hello! This confirms your OwnerHQ Official WhatsApp Cloud API connection is active and operational for {gym.name}!"
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleTestSendOfficial}
                  disabled={isSendingTest || testPhone.length < 10}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  {isSendingTest ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Send to +91 {testPhone}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
