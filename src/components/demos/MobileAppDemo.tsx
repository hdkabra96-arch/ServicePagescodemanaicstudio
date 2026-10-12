import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Search,
  Home,
  Briefcase,
  Users,
  MoreHorizontal,
  Bell,
  CreditCard,
  Settings,
  ChevronRight,
  CheckCircle2,
  Clock,
  Sparkles,
  ShoppingBag,
  MapPin,
  Star,
  BarChart3
} from 'lucide-react';
import { TemplateItem } from '../../types';

interface MobileAppDemoProps {
  template: TemplateItem;
  onBack: () => void;
  onUseDesign: (template: TemplateItem) => void;
}

export const MobileAppDemo: React.FC<MobileAppDemoProps> = ({
  template,
  onBack,
  onUseDesign
}) => {
  const [platform, setPlatform] = useState<'android' | 'ios'>(template.platform || 'android');
  const [activeScreen, setActiveScreen] = useState<
    'home' | 'features' | 'services' | 'profile' | 'billing' | 'notifications'
  >('home');

  const [activeBottomTab, setActiveBottomTab] = useState<'home' | 'projects' | 'clients' | 'more'>('home');

  const screensList = [
    { id: 'home', label: 'Home Screen', desc: 'Dashboard overview & quick stats' },
    { id: 'features', label: 'Features Screen', desc: 'App modules & core capabilities' },
    { id: 'services', label: 'Service Details', desc: 'Detailed business offerings' },
    { id: 'profile', label: 'User Profile', desc: 'Profile & company settings' },
    { id: 'billing', label: 'Payment & Billing', desc: 'Payment integration & invoices' },
    { id: 'notifications', label: 'Notifications', desc: 'Real-time push alerts' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      
      {/* Top Demo Banner */}
      <div className="bg-purple-600 text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2">
        <Smartphone className="w-4 h-4" />
        <span>Mobile Prototype Preview: Click screens on the right or tap inside the phone to interact with the mobile app.</span>
      </div>

      {/* Control Bar */}
      <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Templates</span>
          </button>
          <div>
            <span className="font-bold text-white text-sm">{template.name}</span>
            <span className="text-slate-400 text-xs ml-2">({platform.toUpperCase()})</span>
          </div>
        </div>

        {/* Platform Switcher */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setPlatform('android')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
              platform === 'android' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Android
          </button>
          <button
            onClick={() => setPlatform('ios')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
              platform === 'ios' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            iOS
          </button>
        </div>

        <button
          onClick={() => onUseDesign(template)}
          className="flex items-center gap-2 bg-[#F95700] hover:bg-[#EA4D00] text-white px-5 py-2 rounded-full font-bold text-xs shadow-lg shadow-orange-500/30 transition-all"
        >
          <span>Use This Design</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Smartphone Stage & Screen Explorer Split */}
      <div className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center justify-center">
        
        {/* Left: Interactive Phone Mockup */}
        <div className="lg:col-span-7 flex justify-center py-4">
          <div className="relative w-[320px] sm:w-[350px] h-[670px] bg-black rounded-[48px] p-3 shadow-2xl border-[6px] border-slate-700 ring-1 ring-slate-800/80">
            
            {/* Phone Speaker & Dynamic Island */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full flex items-center justify-center z-30">
              <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-800 mr-2" />
              <div className="w-2 h-2 rounded-full bg-blue-950" />
            </div>

            {/* Screen Inner Viewport */}
            <div className="w-full h-full bg-slate-50 text-slate-800 rounded-[38px] overflow-hidden flex flex-col justify-between relative shadow-inner">
              
              {/* Status Bar */}
              <div className="px-6 pt-3 pb-1 flex items-center justify-between text-[11px] font-bold text-slate-800 select-none bg-white">
                <span>9:41</span>
                <div className="flex items-center gap-1.5 text-slate-800">
                  <span className="text-[10px]">5G</span>
                  <div className="w-4 h-2 rounded-xs border border-slate-800 p-0.5 flex items-center">
                    <div className="w-full h-full bg-slate-800 rounded-xs" />
                  </div>
                </div>
              </div>

              {/* Dynamic Screen Contents */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                
                {activeScreen === 'home' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-500">Hello,</span>
                        <h4 className="text-base font-extrabold text-slate-900 leading-tight">John Smith</h4>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                        JS
                      </div>
                    </div>

                    {/* Search */}
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs">
                      <Search className="w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search anything..."
                        className="bg-transparent text-xs w-full focus:outline-hidden text-slate-700"
                        readOnly
                      />
                    </div>

                    {/* Promo Banner Card */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 text-white space-y-2 shadow-md">
                      <h5 className="font-bold text-sm leading-snug">Grow Your Business With Smart Tools</h5>
                      <p className="text-[11px] text-orange-100">All-in-one suite for mobile task management.</p>
                      <button
                        onClick={() => setActiveScreen('features')}
                        className="bg-white text-orange-600 px-3 py-1 rounded-lg text-[11px] font-bold shadow-xs mt-1"
                      >
                        Get Started &rarr;
                      </button>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-xs">
                        <Users className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                        <span className="text-[10px] font-bold text-slate-700 block">Clients</span>
                        <span className="text-[11px] font-mono font-bold text-slate-900">42</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-xs">
                        <Briefcase className="w-4 h-4 text-orange-600 mx-auto mb-1" />
                        <span className="text-[10px] font-bold text-slate-700 block">Projects</span>
                        <span className="text-[11px] font-mono font-bold text-slate-900">18</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-xs">
                        <CreditCard className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                        <span className="text-[10px] font-bold text-slate-700 block">Invoices</span>
                        <span className="text-[11px] font-mono font-bold text-slate-900">35</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-xs">
                        <BarChart3 className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                        <span className="text-[10px] font-bold text-slate-700 block">Reports</span>
                        <span className="text-[11px] font-mono font-bold text-slate-900">99%</span>
                      </div>
                    </div>

                    {/* Recent Projects */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-900">Recent Projects</span>
                        <span className="text-orange-600 font-bold text-[10px] cursor-pointer">See All</span>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs flex items-center justify-between">
                        <div>
                          <div className="font-bold text-xs text-slate-800">Website Redesign</div>
                          <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                            In Progress
                          </span>
                        </div>
                        <span className="font-mono font-bold text-xs text-slate-900">₹32,500</span>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs flex items-center justify-between">
                        <div>
                          <div className="font-bold text-xs text-slate-800">Mobile App API</div>
                          <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                            Completed
                          </span>
                        </div>
                        <span className="font-mono font-bold text-xs text-slate-900">₹45,000</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeScreen === 'features' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <h4 className="font-extrabold text-sm text-slate-900">Features Screen</h4>
                    <p className="text-[11px] text-slate-500">Full modular toolkit for high-performance apps.</p>
                    <div className="space-y-2">
                      {['Real-time Push Notifications', 'Secure Biometric Auth (FaceID / Fingerprint)', 'Integrated Payment Gateway (UPI / Cards)', 'Offline Cache & Sync Engine', 'Dark Mode & Custom Theming'].map((f, i) => (
                        <div key={i} className="p-2.5 bg-white rounded-xl border border-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeScreen === 'services' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <h4 className="font-extrabold text-sm text-slate-900">Service Details</h4>
                    <div className="space-y-2">
                      <div className="p-3 bg-white rounded-xl border border-slate-100 space-y-1">
                        <span className="text-xs font-bold text-slate-900">Custom Android Development</span>
                        <p className="text-[11px] text-slate-500">Native Kotlin & Compose apps with fluid 120Hz animations.</p>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-100 space-y-1">
                        <span className="text-xs font-bold text-slate-900">iOS Native Swift & SwiftUI</span>
                        <p className="text-[11px] text-slate-500">Optimized for iPhone, iPad, Dynamic Island, and widgets.</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeScreen === 'profile' && (
                  <div className="space-y-4 animate-in fade-in duration-200 text-center">
                    <div className="w-16 h-16 rounded-full bg-orange-600 text-white flex items-center justify-center font-extrabold text-lg mx-auto shadow-md">
                      JS
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">John Smith</h4>
                      <p className="text-xs text-slate-500">john.smith@enterprise.com</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-slate-100 text-left text-xs space-y-2">
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Role</span>
                        <span className="font-semibold text-slate-800">Managing Director</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Plan</span>
                        <span className="font-semibold text-orange-600">Enterprise VIP</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeScreen === 'billing' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <h4 className="font-extrabold text-sm text-slate-900">Payment & Billing</h4>
                    <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-800">Standard Retainer</div>
                        <span className="text-[10px] text-slate-400">Next invoice: 1st Nov 2026</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-600">₹24,999</span>
                    </div>
                  </div>
                )}

                {activeScreen === 'notifications' && (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    <h4 className="font-extrabold text-sm text-slate-900">Notifications</h4>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-100 text-xs">
                      <div className="font-bold text-slate-800">Deployment Succeeded</div>
                      <p className="text-[10px] text-slate-500">Build #482 deployed to Google Play Console testing track.</p>
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom App Navigation Bar */}
              <div className="bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-around text-slate-400 select-none">
                <button
                  onClick={() => { setActiveScreen('home'); setActiveBottomTab('home'); }}
                  className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
                    activeBottomTab === 'home' ? 'text-orange-600' : 'hover:text-slate-700'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </button>
                <button
                  onClick={() => { setActiveScreen('features'); setActiveBottomTab('projects'); }}
                  className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
                    activeBottomTab === 'projects' ? 'text-orange-600' : 'hover:text-slate-700'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Projects</span>
                </button>
                <button
                  onClick={() => { setActiveScreen('profile'); setActiveBottomTab('clients'); }}
                  className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
                    activeBottomTab === 'clients' ? 'text-orange-600' : 'hover:text-slate-700'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Clients</span>
                </button>
                <button
                  onClick={() => { setActiveScreen('notifications'); setActiveBottomTab('more'); }}
                  className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
                    activeBottomTab === 'more' ? 'text-orange-600' : 'hover:text-slate-700'
                  }`}
                >
                  <MoreHorizontal className="w-4 h-4" />
                  <span>More</span>
                </button>
              </div>

              {/* Home indicator bar */}
              <div className="w-28 h-1 bg-slate-300 rounded-full mx-auto my-1.5" />
            </div>
          </div>
        </div>

        {/* Right: Screen Navigator (matches Reference Image 8) */}
        <div className="lg:col-span-5 space-y-4">
          <div>
            <span className="text-orange-500 font-bold text-xs uppercase tracking-widest">
              Explore App Screens
            </span>
            <h3 className="text-2xl font-extrabold text-white mt-1">
              Test Every Mobile Screen
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Select any screen below to preview the mobile layout in the phone device frame.
            </p>
          </div>

          <div className="space-y-2.5">
            {screensList.map((scr) => (
              <button
                key={scr.id}
                onClick={() => setActiveScreen(scr.id as any)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                  activeScreen === scr.id
                    ? 'bg-slate-800 border-orange-500 shadow-md ring-1 ring-orange-500'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <div>
                  <h4 className={`text-xs font-bold ${activeScreen === scr.id ? 'text-orange-400' : 'text-slate-200'}`}>
                    {scr.label}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{scr.desc}</p>
                </div>
                <ChevronRight className={`w-4 h-4 ${activeScreen === scr.id ? 'text-orange-400' : 'text-slate-500'}`} />
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
            <button
              onClick={() => onUseDesign(template)}
              className="w-full flex items-center justify-center gap-2 bg-[#F95700] hover:bg-[#EA4D00] text-white py-3.5 rounded-full font-bold text-xs shadow-lg shadow-orange-500/25 transition-all"
            >
              <span>Use This Design</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onBack}
              className="w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
            >
              View More Mobile Templates &rarr;
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
