import React, { useState } from 'react';
import { Send, Check, Copy, ArrowRight, Home, Sparkles, Phone, Mail } from 'lucide-react';
import { EnquirySubmission, PageView } from '../types';

interface SuccessViewProps {
  enquiry: EnquirySubmission;
  onGoHome: () => void;
  onViewMoreDesigns: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({
  enquiry,
  onGoHome,
  onViewMoreDesigns
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`#${enquiry.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-12 text-center space-y-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Celebration Visual (Flying paper plane with confetti as in screenshot 3) */}
        <div className="relative mx-auto w-24 h-24 rounded-full bg-gradient-to-tr from-orange-100 via-amber-100 to-rose-100 flex items-center justify-center shadow-lg shadow-orange-500/20">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#EA580C] to-[#F97316] text-white flex items-center justify-center transform -rotate-12">
            <Send className="w-8 h-8 translate-x-0.5 -translate-y-0.5" />
          </div>
          <span className="absolute -top-1 -right-1 text-xl animate-bounce">🎉</span>
          <span className="absolute -bottom-1 -left-1 text-base">✨</span>
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
            Thank You! <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#F59E0B]">
              Your Project Enquiry Has Been Submitted
            </span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            We have received your requirements and our team will review them carefully. We will get back to you soon with the next steps.
          </p>
        </div>

        {/* Enquiry Reference Number Box (matching Image 3 Step 6) */}
        <div className="bg-orange-50/80 border border-orange-200/90 rounded-2xl p-6 max-w-md mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Enquiry Reference Number
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl sm:text-3xl font-mono font-black text-slate-900 tracking-wider">
              #{enquiry.id}
            </span>
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl bg-white border border-orange-200 text-slate-600 hover:text-orange-600 shadow-xs hover:shadow-sm transition-all"
              title="Copy Reference Code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          {copied && (
            <span className="text-[11px] font-semibold text-emerald-600 block">
              Reference code copied to clipboard!
            </span>
          )}
        </div>

        {/* Submitted Overview Summary */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-left text-xs text-slate-700 space-y-2 max-w-md mx-auto">
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-400">Business:</span>
            <span className="font-bold text-slate-900">{enquiry.businessName}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-400">Selected Template:</span>
            <span className="font-bold text-orange-600">{enquiry.templateName} ({enquiry.templateId})</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-400">Budget & Timeline:</span>
            <span className="font-bold text-slate-900">{enquiry.budget} &bull; {enquiry.timeline}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Contact Email:</span>
            <span className="font-bold text-slate-900">{enquiry.contactEmail}</span>
          </div>
        </div>

        {/* Actions (matching Image 3 Step 6) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={onGoHome}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#F95700] hover:bg-[#EA4D00] text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Go to Home</span>
          </button>

          <button
            onClick={onViewMoreDesigns}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <span>View More Designs</span>
            <ArrowRight className="w-4 h-4 text-orange-600" />
          </button>
        </div>

        {/* Support Contact Line */}
        <div className="pt-6 border-t border-slate-100 text-xs text-slate-500 flex flex-wrap items-center justify-center gap-2">
          <span>You can also reach us directly at</span>
          <a href="mailto:hello@codemaniacstudio.com" className="font-bold text-orange-600 hover:underline">
            hello@codemaniacstudio.com
          </a>
          <span>or</span>
          <a href="tel:+919876543210" className="font-bold text-orange-600 hover:underline">
            +91 98765 43210
          </a>
        </div>

      </div>
    </div>
  );
};
