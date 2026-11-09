import React, { useState, useEffect } from 'react';
import {
  X, Globe, Sparkles, Check, AlertCircle, RefreshCw, ExternalLink,
  Layers, ShoppingCart, Tag, Image, Eye, EyeOff
} from 'lucide-react';

interface AddWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (siteData: any) => Promise<void>;
  editingSite?: any | null;
}

export const AddWebsiteModal: React.FC<AddWebsiteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSite
}) => {
  const [name, setName] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [serviceCategory, setServiceCategory] = useState('E-commerce Website');
  const [industryTag, setIndustryTag] = useState('Fashion & Retail');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [tags, setTags] = useState('');
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80');
  const [tier, setTier] = useState('premium');
  const [tierLabel, setTierLabel] = useState('Live Production');
  const [platformHost, setPlatformHost] = useState('Vercel');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLiveTest, setShowLiveTest] = useState(false);

  useEffect(() => {
    if (editingSite) {
      setName(editingSite.name || '');
      setExternalUrl(editingSite.externalUrl || '');
      setServiceCategory(editingSite.serviceCategory || 'E-commerce Website');
      setIndustryTag(editingSite.industryTag || 'Fashion & Retail');
      setDescription(editingSite.description || '');
      setFeatures(Array.isArray(editingSite.features) ? editingSite.features.join(', ') : '');
      setTags(Array.isArray(editingSite.tags) ? editingSite.tags.join(', ') : '');
      setThumbnail(editingSite.thumbnail || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80');
      setTier(editingSite.tier || 'premium');
      setTierLabel(editingSite.tierLabel || 'Live Production');
      setPlatformHost(editingSite.platformHost || 'Vercel');
    } else {
      // Default initial values for new entry
      setName('Alpha E-Commerce Store');
      setExternalUrl('https://ecommercewebsite1-alpha.vercel.app/');
      setServiceCategory('E-commerce Website');
      setIndustryTag('Fashion & Retail');
      setDescription('High-performing modern online store deployed live on Vercel with dynamic product catalogs, interactive cart, responsive layout, and seamless checkout flow.');
      setFeatures('Live Vercel Production Deployment, Dynamic Product Catalog & Filtering, Interactive Shopping Cart Management, Mobile-First Responsive Interface, Instant Edge Delivery & Fast Checkout');
      setTags('Vercel, E-commerce, Live Store, Fashion, Next.js');
      setThumbnail('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80');
      setTier('premium');
      setTierLabel('Live Production');
      setPlatformHost('Vercel');
    }
    setError(null);
  }, [editingSite, isOpen]);

  if (!isOpen) return null;

  // Auto-detect host from URL
  const handleUrlChange = (url: string) => {
    setExternalUrl(url);
    if (url.includes('vercel.app')) {
      setPlatformHost('Vercel');
      setTierLabel('Vercel Live');
    } else if (url.includes('netlify.app')) {
      setPlatformHost('Netlify');
      setTierLabel('Netlify Live');
    } else if (url.includes('github.io')) {
      setPlatformHost('GitHub Pages');
      setTierLabel('GitHub Live');
    }
  };

  const handleApplyPreset = (type: string) => {
    switch (type) {
      case 'ecommerce':
        setThumbnail('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80');
        setServiceCategory('E-commerce Website');
        setIndustryTag('Fashion & Retail');
        break;
      case 'tech':
        setThumbnail('https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80');
        setServiceCategory('Web Application');
        setIndustryTag('Technology');
        break;
      case 'corporate':
        setThumbnail('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80');
        setServiceCategory('Business Website');
        setIndustryTag('Corporate');
        break;
      case 'portfolio':
        setThumbnail('https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80');
        setServiceCategory('Custom Website');
        setIndustryTag('Creative Studio');
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a Website / Project Name.');
      return;
    }
    if (!externalUrl.trim()) {
      setError('Please provide the live deployed URL.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const splitFeatures = features
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean);

      const splitTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await onSave({
        name: name.trim(),
        externalUrl: externalUrl.trim(),
        serviceCategory,
        industryTag,
        description: description.trim(),
        features: splitFeatures,
        tags: splitTags,
        thumbnail: thumbnail.trim(),
        tier,
        tierLabel,
        platformHost
      });

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save website. Please verify your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {editingSite ? 'Edit Website / Deployment' : 'Add New Website / Vercel Showcase'}
              </h2>
              <p className="text-xs text-slate-400">
                Publish a live external site to Codemaniac Studio with full interactive preview
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-200">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick presets helper */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-400 text-[11px] font-medium">Quick Category Presets:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleApplyPreset('ecommerce')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-900/40 text-emerald-300 text-[10px] font-semibold transition-colors"
              >
                🛍️ E-commerce
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('tech')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-blue-900/40 text-blue-300 text-[10px] font-semibold transition-colors"
              >
                💻 Tech/SaaS
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('corporate')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-amber-900/40 text-amber-300 text-[10px] font-semibold transition-colors"
              >
                🏢 Corporate
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('portfolio')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-purple-900/40 text-purple-300 text-[10px] font-semibold transition-colors"
              >
                🎨 Creative
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Website Name */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Website / Project Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alpha E-Commerce Store"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Live URL */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Live URL (Vercel / Netlify / Domain) *</label>
              <div className="relative">
                <input
                  type="url"
                  required
                  value={externalUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://ecommercewebsite1-alpha.vercel.app/"
                  className="w-full pl-3 pr-8 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                />
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400"
                  title="Test link in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Service Category</label>
              <select
                value={serviceCategory}
                onChange={(e) => setServiceCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="E-commerce Website">E-commerce Website</option>
                <option value="Business Website">Business Website</option>
                <option value="Web Application">Web Application</option>
                <option value="Mobile App">Mobile App</option>
                <option value="Custom Website">Custom Website</option>
                <option value="Landing Page">Landing Page</option>
              </select>
            </div>

            {/* Industry Tag */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Industry / Niche</label>
              <input
                type="text"
                value={industryTag}
                onChange={(e) => setIndustryTag(e.target.value)}
                placeholder="e.g. Fashion & Retail"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Platform Host */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Host Badge</label>
              <input
                type="text"
                value={platformHost}
                onChange={(e) => setPlatformHost(e.target.value)}
                placeholder="Vercel, Netlify, Custom"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Project Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of the website features, conversion goals, and user experience..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Features */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Key Features (comma-separated)</label>
            <input
              type="text"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="e.g. Live Vercel Deployment, Dynamic Cart, Product Filtering, Mobile Responsive"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Tech Stack */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Tech Stack Tags (comma-separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. Vercel, Next.js, React, Tailwind CSS"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Thumbnail URL */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Thumbnail Image URL</label>
              <input
                type="url"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Inline Live Preview Tester Accordion */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
            <button
              type="button"
              onClick={() => setShowLiveTest(!showLiveTest)}
              className="w-full p-3 flex items-center justify-between text-xs text-slate-300 hover:text-white font-medium"
            >
              <span className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Test Live URL in Embedded Frame</span>
              </span>
              <span className="text-[11px] text-emerald-400">
                {showLiveTest ? 'Hide Frame ▲' : 'Show Frame ▼'}
              </span>
            </button>

            {showLiveTest && (
              <div className="p-3 border-t border-slate-800 bg-slate-950">
                {externalUrl ? (
                  <iframe
                    src={externalUrl}
                    title="Live Test Frame"
                    className="w-full h-56 rounded-lg bg-white border border-slate-800"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  />
                ) : (
                  <p className="text-center py-6 text-slate-500 text-xs">Enter a valid URL above to preview.</p>
                )}
              </div>
            )}
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingSite ? 'Save Changes' : 'Publish to Website & Preview'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
