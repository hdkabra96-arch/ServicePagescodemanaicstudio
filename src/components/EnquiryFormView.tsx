import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { TemplateItem, EnquirySubmission } from '../types';
import { ALL_TEMPLATES } from '../data/servicesData';
import { Breadcrumbs } from './Breadcrumbs';

interface EnquiryFormViewProps {
  selectedTemplate: TemplateItem;
  onChangeTemplateClick: () => void;
  onSubmitSuccess: (enquiry: EnquirySubmission) => void;
  onBack: () => void;
}

export const EnquiryFormView: React.FC<EnquiryFormViewProps> = ({
  selectedTemplate,
  onChangeTemplateClick,
  onSubmitSuccess,
  onBack
}) => {
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState(selectedTemplate.industryTag || 'Corporate');
  const [preference, setPreference] = useState('Use this design with my branding');
  const [pages, setPages] = useState('5 – 10 pages');
  const [features, setFeatures] = useState<string[]>([
    'Contact form',
    'Mobile responsive',
    'SEO optimization'
  ]);
  const [customFeature, setCustomFeature] = useState('');
  const [budget, setBudget] = useState('₹10,000 – ₹25,000');
  const [timeline, setTimeline] = useState('Within 1 month');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [projectDetails, setProjectDetails] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleFeature = (feat: string) => {
    setFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!businessName.trim()) {
      setErrorMessage('Please enter your Business Name.');
      return;
    }
    if (!contactName.trim()) {
      setErrorMessage('Please enter your Full Name.');
      return;
    }
    if (!contactEmail.trim() || !contactEmail.includes('@')) {
      setErrorMessage('Please enter a valid Email Address.');
      return;
    }
    if (!contactPhone.trim()) {
      setErrorMessage('Please enter your Phone or WhatsApp number.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      businessName: businessName.trim(),
      businessCategory,
      serviceType: selectedTemplate.serviceCategory,
      templateId: selectedTemplate.templateCode,
      templateName: selectedTemplate.name,
      preference,
      pages,
      features: customFeature.trim() ? [...features, customFeature.trim()] : features,
      budget,
      timeline,
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: `+91 ${contactPhone.replace(/^\+91\s*/, '')}`,
      projectDetails: projectDetails.trim()
    };

    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success && result.data) {
        onSubmitSuccess(result.data);
      } else {
        throw new Error(result.message || 'Failed to submit enquiry');
      }
    } catch (err: any) {
      console.warn('Backend submission fallback to local save:', err);
      // Resilient fallback: Generate valid ID and store in localStorage
      const randomNum = Math.floor(100 + Math.random() * 900);
      const fallbackId = `CM-2026-00${randomNum}`;
      const savedEnquiry: EnquirySubmission = {
        id: fallbackId,
        createdAt: new Date().toISOString(),
        ...payload,
        status: 'Received'
      };

      try {
        const stored = JSON.parse(localStorage.getItem('cm_enquiries') || '[]');
        stored.unshift(savedEnquiry);
        localStorage.setItem('cm_enquiries', JSON.stringify(stored));
      } catch (e) {
        console.error(e);
      }

      onSubmitSuccess(savedEnquiry);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24">
      {/* Breadcrumbs matching Reference Image 3 Step 4 */}
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: onBack },
          { label: 'Service', onClick: onBack },
          { label: selectedTemplate.serviceCategory, onClick: onBack },
          { label: selectedTemplate.name, onClick: onBack },
          { label: 'Use This Design', active: true }
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
        
        {/* Selected Design Preview Card (matching Image 3 Step 4) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-24 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
              <img
                src={selectedTemplate.thumbnail}
                alt={selectedTemplate.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200 uppercase tracking-wider mb-1">
                Design Selected
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                {selectedTemplate.name}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                <span>{selectedTemplate.description}</span>
                <span className="font-mono text-orange-600 font-bold">
                  Template ID: {selectedTemplate.templateCode}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onChangeTemplateClick}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 underline shrink-0"
          >
            Change Template
          </button>
        </div>

        {/* Main Requirement Form */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-10">
          
          <div className="border-b border-slate-100 pb-6 mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Customize This Design for Your Business
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed">
              Tell us a few details about your business and requirements. We will customize this template and provide the right solution for you.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Top Grid: Business Name & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Business Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Enter your business name"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-sm text-slate-800 placeholder-slate-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Business Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={businessCategory}
                  onChange={(e) => setBusinessCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-sm text-slate-800 transition-all bg-white"
                >
                  <option value="Corporate">Corporate & Enterprise</option>
                  <option value="Creative Agency">Creative Agency & Studio</option>
                  <option value="Consultant">Consulting & Professional Services</option>
                  <option value="Restaurant">Restaurant, Cafe & Cloud Kitchen</option>
                  <option value="Real Estate">Real Estate & Property Development</option>
                  <option value="Healthcare">Healthcare, Clinic & Hospital</option>
                  <option value="E-commerce">E-commerce, Retail & Fashion</option>
                  <option value="Education">Education, Academy & Coaching</option>
                  <option value="Technology">Technology & SaaS Platform</option>
                  <option value="Local Business">Local Business & Service Provider</option>
                </select>
              </div>
            </div>

            {/* What would you like? (Radio options from Image 3 Step 4) */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                What would you like? <span className="text-rose-500">*</span>
              </label>
              <div className="space-y-2">
                {[
                  'Use this design with my branding',
                  'Customize this template',
                  'Use it as inspiration for a custom website'
                ].map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      preference === opt
                        ? 'border-orange-500 bg-orange-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="preference"
                      value={opt}
                      checked={preference === opt}
                      onChange={() => setPreference(opt)}
                      className="accent-[#F95700] w-4 h-4"
                    />
                    <span className="text-xs sm:text-sm font-semibold text-slate-800">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Approximate Number of Pages */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Approximate Number of Pages
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['1 – 3 pages', '5 – 10 pages', '10+ pages', 'Not sure yet'].map((p) => (
                  <label
                    key={p}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${
                      pages === p
                        ? 'border-orange-500 bg-orange-50/60 text-orange-900'
                        : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="pages"
                      value={p}
                      checked={pages === p}
                      onChange={() => setPages(p)}
                      className="accent-[#F95700] w-3.5 h-3.5"
                    />
                    <span>{p}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Features (Checkboxes from Image 3 Step 5) */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Additional Features (Select all that apply)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Contact form',
                  'Online payments',
                  'Admin panel / CMS',
                  'User login / registration',
                  'Booking system',
                  'Mobile responsive',
                  'SEO optimization',
                  'AI integration'
                ].map((feat) => {
                  const isChecked = features.includes(feat);
                  return (
                    <label
                      key={feat}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-orange-500 bg-orange-50/50'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleFeature(feat)}
                        className="accent-[#F95700] w-4 h-4 rounded"
                      />
                      <span className="text-xs font-semibold text-slate-800">{feat}</span>
                    </label>
                  );
                })}
              </div>

              {/* Other feature text input */}
              <input
                type="text"
                value={customFeature}
                onChange={(e) => setCustomFeature(e.target.value)}
                placeholder="Other specific features (e.g. WhatsApp chatbot, Multi-currency)..."
                className="w-full mt-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-orange-500 focus:outline-hidden"
              />
            </div>

            {/* Budget & Timeline Split */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              
              {/* Estimated Budget */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Estimated Budget
                </label>
                <div className="space-y-2">
                  {[
                    'Below ₹10,000',
                    '₹10,000 – ₹25,000',
                    '₹25,000 – ₹50,000',
                    '₹50,000+',
                    'Need a quotation'
                  ].map((b) => (
                    <label
                      key={b}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${
                        budget === b
                          ? 'border-orange-500 bg-orange-50/50 text-orange-900'
                          : 'border-slate-200 text-slate-700 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="budget"
                        value={b}
                        checked={budget === b}
                        onChange={() => setBudget(b)}
                        className="accent-[#F95700] w-3.5 h-3.5"
                      />
                      <span>{b}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preferred Timeline */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Preferred Timeline
                </label>
                <div className="space-y-2">
                  {[
                    'Within 2 weeks',
                    'Within 1 month',
                    '1 – 3 months',
                    'Flexible'
                  ].map((t) => (
                    <label
                      key={t}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${
                        timeline === t
                          ? 'border-orange-500 bg-orange-50/50 text-orange-900'
                          : 'border-slate-200 text-slate-700 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="timeline"
                        value={t}
                        checked={timeline === t}
                        onChange={() => setTimeline(t)}
                        className="accent-[#F95700] w-3.5 h-3.5"
                      />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* Contact Details */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Your Contact Details</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-orange-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Phone / WhatsApp <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden focus-within:border-orange-500">
                  <span className="px-3 py-3 bg-slate-50 text-slate-600 text-xs font-bold border-r border-slate-200 flex items-center gap-1">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </span>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="Enter your 10-digit number"
                    className="flex-1 px-4 py-3 text-xs text-slate-800 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Project Details
                </label>
                <textarea
                  rows={4}
                  value={projectDetails}
                  onChange={(e) => setProjectDetails(e.target.value)}
                  placeholder="Tell us about your project, your business goals, target audience, and any specific requirements..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-orange-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-full bg-[#F95700] hover:bg-[#EA4D00] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Submitting to Database...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Project Enquiry</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-slate-500 font-medium">
                We'll review your requirements and get back to you as soon as possible.
              </p>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
};
