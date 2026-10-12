import React, { useState } from 'react';
import { X, RefreshCw, CheckCircle2, Clock, Copy, Check, FileText, Database } from 'lucide-react';
import { EnquirySubmission } from '../types';

interface EnquiriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  enquiries: EnquirySubmission[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const EnquiriesModal: React.FC<EnquiriesModalProps> = ({
  isOpen,
  onClose,
  enquiries,
  isLoading,
  onRefresh
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(`#${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Database Enquiries Log
              </h3>
              <p className="text-xs text-slate-500">
                Persistent storage connected ({enquiries.length} enquiries recorded)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 text-slate-500 hover:text-orange-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Refresh from backend"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-orange-600' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List of Enquiries */}
        <div className="overflow-y-auto p-6 space-y-4 flex-1">
          {enquiries.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <FileText className="w-12 h-12 mx-auto text-slate-300" />
              <p className="text-sm font-medium">No project enquiries submitted yet.</p>
              <p className="text-xs text-slate-400">
                Fill out the project enquiry form to test real persistent database submission!
              </p>
            </div>
          ) : (
            enquiries.map((enquiry) => (
              <div
                key={enquiry.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-orange-200 transition-all space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md border border-orange-200">
                      #{enquiry.id}
                    </span>
                    <button
                      onClick={() => handleCopy(enquiry.id)}
                      className="text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1"
                      title="Copy reference code"
                    >
                      {copiedId === enquiry.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-[10px] text-emerald-600 font-semibold">Copied</span>
                        </>
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 text-[11px]">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{enquiry.status || 'Received'}</span>
                    </span>
                    <span className="text-slate-400">
                      {new Date(enquiry.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Business:</span>
                    <span className="font-semibold text-slate-800">{enquiry.businessName}</span>
                    <span className="text-[11px] text-slate-500 block">({enquiry.businessCategory})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Template / Service:</span>
                    <span className="font-semibold text-slate-800">{enquiry.templateName}</span>
                    <span className="text-[11px] font-mono text-orange-600 block">{enquiry.templateId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Budget & Timeline:</span>
                    <span className="font-semibold text-slate-800">{enquiry.budget}</span>
                    <span className="text-[11px] text-slate-500 block">{enquiry.timeline}</span>
                  </div>
                </div>

                {enquiry.projectDetails && (
                  <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 border border-slate-100">
                    <span className="font-semibold text-slate-700 block mb-1">Project Details:</span>
                    <p className="line-clamp-2">{enquiry.projectDetails}</p>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
                  <div>
                    <span className="font-medium text-slate-700">{enquiry.contactName}</span> &bull; {enquiry.contactEmail} &bull; {enquiry.contactPhone}
                  </div>
                  {enquiry.features && enquiry.features.length > 0 && (
                    <div className="text-slate-400">
                      {enquiry.features.length} features requested
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Synced with Express REST Backend (`/api/enquiries`)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-semibold text-slate-700 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
