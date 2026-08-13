import React, { useState, useEffect } from 'react';
import { MessageSquare, ExternalLink, Info, Edit3, Save, Check, Loader2 } from 'lucide-react';
import { api, DEFAULT_TEMPLATES } from '../lib/api';
import { WhatsAppTemplate, Gym } from '../types';

export const WhatsAppTemplatesPage: React.FC = () => {
  const [gym, setGym] = useState<Gym | null>(null);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>(DEFAULT_TEMPLATES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGym = async () => {
      const currentGym = await api.getCurrentGym();
      if (currentGym) setGym(currentGym);
      setLoading(false);
    };
    fetchGym();
  }, []);

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

      {/* Manual Sending Disclaimer */}
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3 text-sm text-blue-900 shadow-sm">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-bold mb-1">Manual Click-to-Send WhatsApp Flow</div>
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

    </div>
  );
};
