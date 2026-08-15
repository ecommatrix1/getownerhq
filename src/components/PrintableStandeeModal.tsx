import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Printer, Dumbbell, Smartphone, UserCheck, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';
import { Gym } from '../types';

interface PrintableStandeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintableStandeeModal: React.FC<PrintableStandeeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [gym, setGym] = useState<Gym | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getCurrentGym().then(g => setGym(g));
    }
  }, [isOpen]);

  if (!isOpen || !gym) return null;

  // Domain link target for QR code
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.getownerhq.in';
  const publicUrl = `${baseUrl}/#/r/${gym.slug}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!gym) return;
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png', 1.0);
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      const safeName = gym.name.replace(/[^a-zA-Z0-9]/g, '-');
      downloadLink.download = `getOwnerHQ-${safeName}-QR.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      
      {/* Control bar (hidden during print) */}
      <div className="fixed top-4 right-4 flex items-center gap-3 print:hidden z-50">
        <button
          onClick={handlePrint}
          className="p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors backdrop-blur hidden sm:block"
          title="Print A4"
        >
          <Printer className="w-6 h-6" />
        </button>
        <button
          onClick={onClose}
          className="p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors backdrop-blur"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* A5 Printable Card Container */}
      <div 
        id="printable-standee"
        className="w-full max-w-[420px] bg-white rounded-3xl border border-slate-200 p-8 shadow-2xl text-center relative overflow-hidden print:m-0 print:w-full print:max-w-none print:h-screen print:border-none print:shadow-none print:flex print:flex-col print:items-center print:justify-center"
      >
        {/* Top Header */}
        <div className="mb-6 border-b border-slate-100 pb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 mb-3 shadow-sm">
            <Dumbbell className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight uppercase leading-tight">
            {gym.name}
          </h1>
          <p className="text-xs font-bold font-mono text-slate-500 uppercase tracking-widest mt-1">
            {gym.city} • SELF REGISTRATION
          </p>
        </div>

        {/* Big QR Code Frame */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm inline-block my-2 relative">
          <QRCodeCanvas 
            id="qr-canvas"
            value={publicUrl}
            size={220}
            level="H"
            includeMargin={true}
          />
          <div className="mt-3 text-[11px] font-mono text-slate-500 font-bold truncate max-w-[220px] mx-auto print:block">
            {publicUrl}
          </div>
          <div className="hidden print:block mt-2 font-bold text-slate-900 text-lg uppercase tracking-widest">
            SCAN TO JOIN
          </div>
        </div>

        {/* Clear Step-by-Step Instructions */}
        <div className="mt-6 space-y-3 text-left bg-slate-50 border border-slate-200 text-slate-900 p-5 rounded-2xl shadow-sm">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">
            3 Simple Steps to Register
          </div>
          
          <div className="flex items-start gap-3 text-xs">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0">
              1
            </div>
            <div>
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                Scan QR Code <Smartphone className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5">Open your phone camera & point at the QR code above.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0">
              2
            </div>
            <div>
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                Enter Name & Mobile <UserCheck className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5">Fill 2 fields & verify OTP code via SMS instantly.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0">
              3
            </div>
            <div>
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                Show Pass at Reception <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5">Show screen to front desk to choose membership plan.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons (Hidden on Print) */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 print:hidden">
          <button
            onClick={handleDownload}
            className="flex-1 py-3 bg-[#111827] text-white rounded-xl font-bold text-sm hover:bg-[#1F2937] transition-colors"
          >
            Download PNG
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors hidden sm:block"
          >
            Print QR
          </button>
        </div>
        
        <p className="mt-3 text-[10px] text-slate-400 text-center print:hidden font-medium">
          Print this QR and place it at your gym reception.
        </p>

      </div>
    </div>
  );
};
