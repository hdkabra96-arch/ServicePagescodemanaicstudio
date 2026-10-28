import React, { useState, useMemo } from 'react';
import { Search, X, ArrowRight, Layers, Layout, Globe, Smartphone, ShoppingCart, Settings } from 'lucide-react';
import { ALL_TEMPLATES, CORE_SERVICES, MORE_SERVICES } from '../data/servicesData';
import { TemplateItem, PageView } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TemplateItem) => void;
  onSelectService: (view: PageView) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  onSelectService
}) => {
  const [query, setQuery] = useState('');

  const filteredTemplates = useMemo(() => {
    if (!query.trim()) return ALL_TEMPLATES.slice(0, 6);
    const q = query.toLowerCase();
    return ALL_TEMPLATES.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.templateCode.toLowerCase().includes(q) ||
        t.serviceCategory.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [query]);

  const filteredServices = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return [...CORE_SERVICES, ...MORE_SERVICES].filter(
      (s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
    );
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-orange-600 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search templates (e.g., 'Business Pro', 'Admin', 'Food', 'Store')..."
            className="w-full text-slate-800 placeholder-slate-400 text-sm focus:outline-hidden"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium px-1"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results List */}
        <div className="overflow-y-auto p-4 space-y-6">
          
          {/* Quick Categories */}
          {!query && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Browse Services
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => { onClose(); onSelectService('website-development'); }}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50/50 text-left text-xs font-semibold text-slate-700"
                >
                  <Globe className="w-4 h-4 text-orange-600" />
                  <span>Websites</span>
                </button>
                <button
                  onClick={() => { onClose(); onSelectService('web-application'); }}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 text-left text-xs font-semibold text-slate-700"
                >
                  <Layout className="w-4 h-4 text-blue-600" />
                  <span>Web Apps</span>
                </button>
                <button
                  onClick={() => { onClose(); onSelectService('app-development'); }}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 text-left text-xs font-semibold text-slate-700"
                >
                  <Smartphone className="w-4 h-4 text-indigo-600" />
                  <span>Mobile Apps</span>
                </button>
                <button
                  onClick={() => { onClose(); onSelectService('ecommerce'); }}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 text-left text-xs font-semibold text-slate-700"
                >
                  <ShoppingCart className="w-4 h-4 text-emerald-600" />
                  <span>E-commerce</span>
                </button>
                <button
                  onClick={() => { onClose(); onSelectService('custom-websites'); }}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 hover:border-pink-200 hover:bg-pink-50/50 text-left text-xs font-semibold text-slate-700"
                >
                  <Settings className="w-4 h-4 text-pink-600" />
                  <span>Custom Websites</span>
                </button>
              </div>
            </div>
          )}

          {/* Matched Services */}
          {filteredServices.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Matching Services
              </div>
              <div className="space-y-1.5">
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => {
                      onClose();
                      onSelectService(service.path as PageView);
                    }}
                    className="p-3 rounded-xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50/50 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-800">{service.title}</div>
                      <div className="text-xs text-slate-500 line-clamp-1">{service.description}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-orange-600 shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Templates */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              {query ? `Templates Found (${filteredTemplates.length})` : 'Popular Templates'}
            </div>
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400">
                No templates found matching "{query}". Try searching "Corporate", "App", "Store", etc.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => {
                      onClose();
                      onSelectTemplate(template);
                    }}
                    className="p-3 rounded-xl border border-slate-100 hover:border-orange-300 hover:bg-slate-50 cursor-pointer transition-all flex items-start gap-3 group"
                  >
                    <div className="w-14 h-14 rounded-lg bg-slate-200 overflow-hidden shrink-0">
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                          {template.templateCode}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-orange-600">
                          {template.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {template.serviceCategory}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-orange-600">
                        <span>Preview Demo</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
