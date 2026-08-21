import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Printer, Dumbbell, Smartphone, UserCheck, CheckCircle2, Download, QrCode } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-up">

      {/* Control bar (hidden during print) */}
      <div className="fixed top-4 right-4 flex items-center gap-3 print:hidden z-50">
        <button
          onClick={handlePrint}
          className="p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors backdrop-blur hidden sm:flex items-center gap-2 px-4"
          title="Print A4"
        >
          <Printer className="w-5 h-5" />
          <span className="text-sm font-bold">Print</span>
        </button>
        <button
          onClick={onClose}
          aria-label="Close"
          className="p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors backdrop-blur"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* A5 Printable Card Container */}
      <div
        id="printable-standee"
        className="relative w-full max-w-[420px] bg-white dark:bg-white rounded-3xl border border-slate-200 p-8 shadow-2xl text-center overflow-hidden print:m-0 print:w-full print:max-w-none print:h-screen print:border-none print:shadow-none print:flex print:flex-col print:items-center print:justify-center"
      >
        {/* Decorative top gradient strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-brand print:hidden" aria-hidden />

        {/* Decorative mesh in background */}
        <div className="absolute inset-0 bg-mesh opacity-40 pointer-events-none print:hidden" aria-hidden />

        {/* Top Header */}
        <div className="relative mb-6 border-b border-slate-100 pb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-brand text-white shadow-glow-brand mb-3">
            <Dumbbell className="w-7 h-7" strokeWidth={2.25} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight uppercase leading-tight font-display">
            {gym.name}
          </h1>
          <p className="text-xs font-bold font-mono text-slate-500 uppercase tracking-widest mt-1 flex items-center justify-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            {gym.city} · Self Registration
          </p>
        </div>

        {/* Big QR Code Frame */}
        <div className="relative bg-gradient-to-br from-brand-50/50 to-accent-500/5 p-6 rounded-2xl border border-brand-200/60 shadow-md inline-block my-2">
          <QRCodeCanvas
            id="qr-canvas"
            value={publicUrl}
            size={220}
            level="H"
            includeMargin={true}
          />
          <div className="mt-3 text-[11px] font-mono text-slate-500 font-bold truncate max-w-[220px] mx-auto print:block [font-variant-numeric:tabular-nums]">
            {publicUrl}
          </div>
          <div className="hidden print:flex items-center justify-center gap-1.5 mt-2 font-bold text-slate-900 text-lg uppercase tracking-widest">
            <QrCode className="w-5 h-5" />
            Scan to Join
          </div>
        </div>

        {/* Clear Step-by-Step Instructions */}
        <div className="relative mt-6 space-y-3 text-left bg-gradient-to-br from-slate-50 to-brand-50/30 border border-slate-200/70 text-slate-900 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-[0.12em] mb-3">
            <span className="inline-block w-6 h-px bg-brand-500" />
            3 Simple Steps
          </div>

          <div className="flex items-start gap-3 text-xs">
            <div className="w-6 h-6 rounded-full bg-gradient-brand text-white font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
              1
            </div>
            <div>
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                Scan QR Code <Smartphone className="w-3.5 h-3.5 text-brand-500" />
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5">Open your phone camera & point at the QR code above.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs">
            <div className="w-6 h-6 rounded-full bg-gradient-brand text-white font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
              2
            </div>
            <div>
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                Enter Name & Mobile <UserCheck className="w-3.5 h-3.5 text-brand-500" />
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5">Fill 2 fields & verify OTP code via SMS instantly.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs">
            <div className="w-6 h-6 rounded-full bg-gradient-brand text-white font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
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
        <div className="relative mt-6 flex flex-col sm:flex-row gap-3 print:hidden">
          <button
            onClick={handleDownload}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-700 transition-all hover:-translate-y-0.5"
          >
            <Download className="w-4 h-4" />
            Download PNG
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 btn-brand !min-h-[44px] !min-w-0 text-sm hidden sm:inline-flex"
          >
            <Printer className="w-4 h-4" />
            Print QR
          </button>
        </div>

        <p className="relative mt-3 text-[10px] text-slate-400 text-center print:hidden font-medium">
          Print this QR and place it at your gym reception.
        </p>

      </div>
    </div>
  );
};
