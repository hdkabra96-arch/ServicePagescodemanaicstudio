import React from 'react';
import {
  MapPin,
  Mail,
  Phone,
  MessageCircle,
  Youtube,
  Instagram,
  Linkedin,
  Twitter,
  ArrowUp
} from 'lucide-react';
import { PageView } from '../types';

interface FooterProps {
  onNavigate: (view: PageView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-12 text-slate-600 text-sm relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-slate-100">
          
          {/* Column 1: Brand & Socials */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#EA580C] via-[#F97316] to-[#FB923C] flex items-center justify-center shadow-md shadow-orange-500/20">
                <span className="font-extrabold text-white text-base tracking-wider font-sans">CM</span>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-slate-900 text-base leading-tight tracking-tight uppercase">
                  Codemaniac
                </span>
                <span className="text-[10px] font-bold text-orange-600 tracking-widest uppercase">
                  Studio
                </span>
              </div>
            </div>
            
            <p className="text-slate-500 text-xs font-medium leading-relaxed">
              Ideas. Innovation. Impact.
            </p>

            <div className="flex items-center gap-3 pt-2 text-slate-500">
              <a
                href="#youtube"
                onClick={(e) => { e.preventDefault(); alert('Codemaniac Studio YouTube Channel'); }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-orange-50 hover:text-orange-600 flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="#instagram"
                onClick={(e) => { e.preventDefault(); alert('Codemaniac Studio Instagram'); }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-orange-50 hover:text-orange-600 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#linkedin"
                onClick={(e) => { e.preventDefault(); alert('Codemaniac Studio LinkedIn'); }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-orange-50 hover:text-orange-600 flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="#twitter"
                onClick={(e) => { e.preventDefault(); alert('Codemaniac Studio X (Twitter)'); }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-orange-50 hover:text-orange-600 flex items-center justify-center transition-colors"
                aria-label="Twitter / X"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li><button onClick={() => onNavigate('services')} className="hover:text-orange-600 transition-colors">Home</button></li>
              <li><button onClick={() => onNavigate('services')} className="hover:text-orange-600 transition-colors">Product</button></li>
              <li><button onClick={() => onNavigate('services')} className="text-orange-600 font-semibold hover:text-orange-700 transition-colors">Service</button></li>
              <li><button onClick={() => onNavigate('services')} className="hover:text-orange-600 transition-colors">Education Hub</button></li>
              <li><button onClick={() => onNavigate('services')} className="hover:text-orange-600 transition-colors">About Us</button></li>
              <li><button onClick={() => onNavigate('services')} className="hover:text-orange-600 transition-colors">Blog</button></li>
              <li><button onClick={() => onNavigate('enquiry-form')} className="hover:text-orange-600 transition-colors">Contact Us</button></li>
              <li><button onClick={() => onNavigate('services')} className="hover:text-orange-600 transition-colors">Privacy Policy</button></li>
            </ul>
          </div>

          {/* Column 3: Our Products */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-4">Our Products</h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li><a href="#pdf-tools" onClick={(e) => { e.preventDefault(); alert('PDF Tools by Codemaniac'); }} className="hover:text-orange-600 transition-colors">PDF Tools</a></li>
              <li><a href="#image-tools" onClick={(e) => { e.preventDefault(); alert('Image Tools by Codemaniac'); }} className="hover:text-orange-600 transition-colors">Image Tools</a></li>
              <li><a href="#video-tools" onClick={(e) => { e.preventDefault(); alert('Video Tools by Codemaniac'); }} className="hover:text-orange-600 transition-colors">Video Tools</a></li>
              <li><a href="#audio-tools" onClick={(e) => { e.preventDefault(); alert('Audio Tools by Codemaniac'); }} className="hover:text-orange-600 transition-colors">Audio Tools</a></li>
              <li><a href="#utility-tools" onClick={(e) => { e.preventDefault(); alert('Utility Tools by Codemaniac'); }} className="hover:text-orange-600 transition-colors">Utility Tools</a></li>
              <li><a href="#all-products" onClick={(e) => { e.preventDefault(); alert('All Products Suite'); }} className="text-orange-600 font-semibold hover:text-orange-700 transition-colors">All Products</a></li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-4">Support</h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li><button onClick={() => onNavigate('enquiry-form')} className="hover:text-orange-600 transition-colors">FAQ</button></li>
              <li><button onClick={() => onNavigate('services')} className="hover:text-orange-600 transition-colors">User Guide</button></li>
              <li><button onClick={() => onNavigate('services')} className="hover:text-orange-600 transition-colors">Terms & Conditions</button></li>
              <li><button onClick={() => onNavigate('services')} className="hover:text-orange-600 transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => onNavigate('enquiry-form')} className="hover:text-orange-600 transition-colors">Support Desk</button></li>
              <li><button onClick={() => onNavigate('enquiry-form')} className="hover:text-orange-600 transition-colors">Contact Us</button></li>
            </ul>
          </div>

          {/* Column 5: Contact Info */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-4">Contact Info</h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <span>Surat, Gujarat, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-orange-600 shrink-0" />
                <a href="mailto:hello@codemaniacstudio.com" className="hover:text-orange-600 transition-colors truncate">
                  hello@codemaniacstudio.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-orange-600 shrink-0" />
                <a href="tel:+919876543210" className="hover:text-orange-600 transition-colors font-medium">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-orange-600 shrink-0" />
                <button
                  onClick={() => onNavigate('enquiry-form')}
                  className="text-orange-600 font-semibold hover:underline"
                >
                  Let's Chat
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            &copy; 2026 Codemaniac Studio. All rights reserved.
          </div>
          <div className="flex items-center space-x-6">
            <button onClick={() => onNavigate('services')} className="hover:text-slate-800 transition-colors">Terms & Conditions</button>
            <span className="text-slate-300">|</span>
            <button onClick={() => onNavigate('services')} className="hover:text-slate-800 transition-colors">Privacy Policy</button>
            <span className="text-slate-300">|</span>
            <button onClick={() => onNavigate('services')} className="hover:text-slate-800 transition-colors">Sitemap</button>
          </div>
        </div>
      </div>

      {/* Floating Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 w-11 h-11 bg-orange-600 hover:bg-orange-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-orange-500/40 transition-all z-30"
        title="Back to Top"
        aria-label="Back to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </footer>
  );
};
