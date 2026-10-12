import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, Menu, X, FileText, Sparkles, PhoneCall } from 'lucide-react';
import { PageView } from '../types';

interface HeaderProps {
  currentView: PageView;
  onNavigate: (view: PageView, data?: any) => void;
  onOpenSearch: () => void;
  onOpenEnquiries: () => void;
  enquiriesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenSearch,
  onOpenEnquiries,
  enquiriesCount
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', view: 'services' as PageView, active: currentView === 'services' },
    { label: 'Product', view: 'services' as PageView, active: false },
    { label: 'Service', view: 'services' as PageView, active: true }, // Main section highlighted as in screenshot
    { label: 'Education Hub', view: 'services' as PageView, active: false },
    { label: 'About Us', view: 'services' as PageView, active: false },
    { label: 'Blog', view: 'services' as PageView, active: false },
    { label: 'Contact Us', view: 'enquiry-form' as PageView, active: currentView === 'enquiry-form' },
    { label: 'Privacy Policy', view: 'services' as PageView, active: false },
  ];

  return (
    <header className={`sticky top-0 z-40 transition-all duration-200 bg-white/95 backdrop-blur-md border-b border-slate-100 ${isScrolled ? 'shadow-xs' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo - Codemaniac Studio */}
          <button
            onClick={() => onNavigate('services')}
            className="flex items-center gap-3 text-left group focus:outline-hidden"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#EA580C] via-[#F97316] to-[#FB923C] flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform duration-200">
              <span className="font-extrabold text-white text-lg tracking-wider font-sans">CM</span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-slate-900 text-lg leading-tight tracking-tight uppercase">
                Codemaniac
              </span>
              <span className="text-[10px] font-bold text-orange-600 tracking-widest uppercase">
                Studio
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium text-slate-700">
            {navLinks.map((item) => (
              <button
                key={item.label}
                onClick={() => onNavigate(item.view)}
                className={`relative py-1 transition-colors hover:text-orange-600 ${
                  item.active ? 'text-slate-900 font-semibold' : 'text-slate-600'
                }`}
              >
                {item.label}
                {item.active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Actions: Search, Saved Enquiries & Let's Talk CTA */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={onOpenSearch}
              className="p-2.5 text-slate-600 hover:text-orange-600 hover:bg-orange-50/60 rounded-full transition-colors border border-transparent hover:border-orange-100"
              title="Search services & templates"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Saved Enquiries Tracker button */}
            <button
              onClick={onOpenEnquiries}
              className="relative flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-orange-600 bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 rounded-lg transition-colors"
              title="View your database-saved enquiries"
            >
              <FileText className="w-4 h-4 text-orange-600" />
              <span>Enquiries</span>
              {enquiriesCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-orange-600 text-white rounded-full text-[10px] font-bold">
                  {enquiriesCount}
                </span>
              )}
            </button>

            {/* Let's Talk CTA Button */}
            <button
              onClick={() => onNavigate('enquiry-form')}
              className="flex items-center gap-2 bg-[#F95700] hover:bg-[#EA4D00] text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-md shadow-orange-500/20 hover:shadow-orange-500/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Let's Talk</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile menu hamburger button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={onOpenSearch}
              className="p-2 text-slate-600 hover:text-orange-600 rounded-lg"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-orange-600 rounded-lg focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-1">
            {navLinks.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  onNavigate(item.view);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  item.active ? 'bg-orange-50 text-orange-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            <button
              onClick={() => {
                onOpenEnquiries();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between px-3 py-2.5 bg-slate-50 text-slate-800 rounded-lg text-sm font-semibold border border-slate-200"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-600" />
                <span>My Enquiries in Database</span>
              </div>
              <span className="px-2 py-0.5 bg-orange-600 text-white rounded-full text-xs font-bold">
                {enquiriesCount}
              </span>
            </button>

            <button
              onClick={() => {
                onNavigate('enquiry-form');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#F95700] hover:bg-[#EA4D00] text-white py-3 rounded-full font-semibold text-sm shadow-md"
            >
              <span>Let's Talk</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
