import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Calendar, Clock, CheckCircle2, User, Phone, Check, Sliders, MapPin, ShieldCheck, HelpCircle, Star, Mail } from 'lucide-react';
import { TemplateItem } from '../../types';
import {
  useThemeCustomizer,
  DemoControlBar,
  DemoCustomizerDrawer,
  FloatingCustomizeButton,
  ThemeCustomizerState
} from './DemoThemeCustomizer';

interface BookingSystemDemoProps {
  template: TemplateItem;
  onBack: () => void;
  onUseDesign: (template: TemplateItem, customData?: ThemeCustomizerState) => void;
}

type BookingTab = 'calendar' | 'specialists' | 'locations' | 'faq';

export const BookingSystemDemo: React.FC<BookingSystemDemoProps> = ({
  template,
  onBack,
  onUseDesign
}) => {
  const [activeTab, setActiveTab] = useState<BookingTab>('calendar');
  const [selectedDate, setSelectedDate] = useState(15);
  const [selectedSlot, setSelectedSlot] = useState('11:30 AM');
  const [selectedSpecialist, setSelectedSpecialist] = useState<string>('Dr. Rajesh Sharma');
  const [booked, setBooked] = useState(false);

  const {
    customization,
    drawerOpen,
    setDrawerOpen,
    applyPalette,
    randomizeTopography,
    updateField,
    resetToDefault,
    getRadiusClass,
    getFontFamilyClass,
    getFontSizeScaleClass,
    getCardClasses,
    getCardStyle,
    getPrimaryButtonStyle,
    getBadgeStyle,
    calculateEstimate
  } = useThemeCustomizer(template, {
    brandName: template.name.includes('Booking') || template.name.includes('Appointment') ? template.name : 'Schedulr Clinic & Consultation'
  });

  const bookingsList = [
    { time: '09:00 AM', customer: 'John Smith', service: 'Initial Strategy Consultation', status: 'Confirmed' },
    { time: '11:30 AM', customer: 'Priya Mehta', service: 'Full Service Design Review', status: 'In Progress' },
    { time: '02:00 PM', customer: 'Rahul Verma', service: 'Product Demo & Architecture', status: 'Upcoming' },
    { time: '04:30 PM', customer: 'Sneha Patel', service: 'Sprint Progress Follow Up', status: 'Upcoming' }
  ];

  const specialists = [
    { name: 'Dr. Rajesh Sharma', title: 'Senior Medical Director', rating: 4.9, exp: '16+ Years Experience', slots: '3 slots today', img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80' },
    { name: 'Dr. Ananya Iyer', title: 'Lead Pediatric Consultant', rating: 4.9, exp: '12+ Years Experience', slots: '5 slots today', img: 'https://images.unsplash.com/photo-1594824813511-13c545362145?w=400&auto=format&fit=crop&q=80' },
    { name: 'Dr. Marcus Vance', title: 'Orthopedic Surgeon', rating: 4.8, exp: '14+ Years Experience', slots: '2 slots today', img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80' },
    { name: 'Dr. Neha Kapoor', title: 'Chief Dermatologist', rating: 5.0, exp: '10+ Years Experience', slots: 'Available Now', img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80' }
  ];

  return (
    <div className={`min-h-screen bg-slate-900 text-slate-100 flex flex-col ${getFontFamilyClass()}`}>
      
      {/* Top Banner */}
      {customization.showPromoBanner && (
        <div
          className="text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2 transition-colors sticky top-0 z-40"
          style={{ backgroundColor: customization.primaryColor }}
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>
            Live Booking System Demo: <strong>{customization.brandName}</strong> • Real-time calendar & slot booking engine.
          </span>
        </div>
      )}

      {/* Control Bar */}
      <DemoControlBar
        template={template}
        customization={customization}
        onBack={onBack}
        onOpenCustomizer={() => setDrawerOpen(true)}
        onApplyPalette={applyPalette}
        onUpdateField={updateField}
        onUseDesign={onUseDesign}
      />

      {/* Slide-over Theme Customizer Drawer */}
      <DemoCustomizerDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        template={template}
        customization={customization}
        onApplyPalette={applyPalette}
        onRandomize={randomizeTopography}
        onUpdateField={updateField}
        onReset={resetToDefault}
        onUseDesign={onUseDesign}
      />

      {/* Floating Customize Button */}
      <FloatingCustomizeButton
        onOpen={() => setDrawerOpen(true)}
        primaryColor={customization.primaryColor}
      />

      {/* Navigation Sub-Tabs Bar */}
      <div className="border-b border-slate-800 bg-slate-950/70 px-6 py-2.5 flex items-center justify-between overflow-x-auto text-xs">
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400">
            Booking Pages:
          </span>
          <div className="flex items-center gap-1">
            {[
              { id: 'calendar' as BookingTab, label: '📅 Slot Calendar' },
              { id: 'specialists' as BookingTab, label: '🩺 Specialists' },
              { id: 'locations' as BookingTab, label: '🏥 Clinic Hubs' },
              { id: 'faq' as BookingTab, label: '📋 Policy & FAQ' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-md font-bold text-xs transition-all ${
                  activeTab === tab.id ? 'text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                style={{
                  backgroundColor: activeTab === tab.id ? customization.primaryColor : undefined
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="hidden sm:flex items-center gap-1 font-bold text-[11px] hover:underline shrink-0"
          style={{ color: customization.primaryColor }}
        >
          <Sliders className="w-3 h-3" />
          <span>Customize Theme</span>
        </button>
      </div>

      {/* VIEW 1: CALENDAR & LIVE QUEUE */}
      {activeTab === 'calendar' && (
        <div className="flex-1 max-w-6xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
          
          {/* Left: Calendar & Time Slots */}
          <div className={`lg:col-span-7 bg-slate-950 p-6 border border-slate-800 space-y-6 ${getRadiusClass('card')}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Calendar className="w-5 h-5" style={{ color: customization.primaryColor }} />
                <span>{customization.brandName} - January 2026 Calendar</span>
              </h3>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  color: customization.primaryColor,
                  backgroundColor: `${customization.primaryColor}20`
                }}
              >
                Online Appointment
              </span>
            </div>

            {/* Specialist selector */}
            <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400">Selected Specialist:</span>
              <strong className="text-white font-bold">{selectedSpecialist}</strong>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <span key={d} className="text-slate-500 font-bold py-1">{d}</span>
              ))}
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                const isSelected = selectedDate === day;
                return (
                  <button
                    key={day}
                    onClick={() => {
                      setSelectedDate(day);
                      setBooked(false);
                    }}
                    className={`py-2 font-bold transition-all ${getRadiusClass('input')} ${
                      isSelected
                        ? 'text-white shadow-md scale-105'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                    }`}
                    style={{
                      backgroundColor: isSelected ? customization.primaryColor : undefined
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Available Slots */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase">
                Available Slots for Jan {selectedDate}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'].map((slot) => {
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setBooked(false);
                      }}
                      className={`py-2 px-3 text-xs font-semibold transition-colors ${getRadiusClass('input')} ${
                        isSelected
                          ? 'text-white shadow-xs'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                      }`}
                      style={{
                        backgroundColor: isSelected ? customization.primaryColor : undefined
                      }}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setBooked(true)}
                  className={`w-full text-white font-bold py-3 text-xs transition-transform hover:scale-[1.01] active:scale-95 shadow-lg ${getRadiusClass('btn')}`}
                  style={{ backgroundColor: customization.primaryColor }}
                >
                  {booked
                    ? '✓ Appointment Booked & SMS Confirmed!'
                    : `Confirm Booking for Jan ${selectedDate} at ${selectedSlot}`}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Today's Queue */}
          <div className={`lg:col-span-5 bg-slate-950 p-6 border border-slate-800 space-y-4 flex flex-col justify-between ${getRadiusClass('card')}`}>
            <div>
              <h3 className="font-bold text-white text-base mb-4">Live Scheduling Queue</h3>
              <div className="space-y-3">
                {bookingsList.map((b, i) => (
                  <div
                    key={i}
                    className={`p-3 bg-slate-900 border border-slate-800 flex items-center justify-between text-xs ${getRadiusClass('input')}`}
                  >
                    <div>
                      <div className="font-bold text-white">{b.customer}</div>
                      <div className="text-[11px] text-slate-400">{b.service}</div>
                      <div className="font-mono mt-1 font-bold" style={{ color: customization.primaryColor }}>
                        {b.time}
                      </div>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                      style={{
                        color: customization.primaryColor,
                        borderColor: `${customization.primaryColor}50`,
                        backgroundColor: `${customization.primaryColor}15`
                      }}
                    >
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button
                onClick={() => onUseDesign(template, customization)}
                className={`w-full text-white py-3 font-bold text-xs shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-1.5 ${getRadiusClass('btn')}`}
                style={{ backgroundColor: customization.primaryColor }}
              >
                <span>Build This Booking Platform for {customization.brandName}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: SPECIALISTS ROSTER */}
      {activeTab === 'specialists' && (
        <div className="flex-1 max-w-6xl mx-auto w-full p-6 space-y-6 animate-in fade-in duration-200">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-black text-white">Our Certified Specialists</h2>
            <p className="text-xs text-slate-400">Select your preferred consultant to book your consultation.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {specialists.map((doc, idx) => (
              <div
                key={idx}
                className={getCardClasses('p-5 space-y-4 text-center')}
                style={getCardStyle()}
              >
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-slate-700">
                  <img src={doc.img} alt={doc.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{doc.name}</h4>
                  <p className="text-[11px] font-semibold mt-0.5" style={{ color: customization.primaryColor }}>
                    {doc.title}
                  </p>
                  <div className="flex items-center justify-center gap-1 text-amber-400 text-xs mt-1">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span className="font-bold text-white text-[11px]">{doc.rating}</span>
                    <span className="text-slate-400 text-[10px]">({doc.exp})</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedSpecialist(doc.name);
                    setActiveTab('calendar');
                  }}
                  className={`w-full py-2 text-xs font-bold text-white rounded-lg shadow-sm ${getRadiusClass('btn')}`}
                  style={{ backgroundColor: customization.primaryColor }}
                >
                  Book with {doc.name.split(' ')[1]}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: CLINIC HUBS */}
      {activeTab === 'locations' && (
        <div className="flex-1 max-w-5xl mx-auto w-full p-6 space-y-6 animate-in fade-in duration-200">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-black text-white">Clinic Hubs & Operating Hours</h2>
            <p className="text-xs text-slate-400">Physical consultation centers with walk-in triage & valet parking.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { city: 'Downtown Health Hub', address: '450 Lexington Ave, Suite 1200, New York, NY', hours: 'Mon - Fri: 8:00 AM - 7:00 PM', phone: '+1 (212) 555-0199', urgentCare: '24/7 On-Call Triage' },
              { city: 'Westside Wellness Center', address: '1200 Wilshire Blvd, Floor 4, Los Angeles, CA', hours: 'Mon - Sat: 9:00 AM - 6:00 PM', phone: '+1 (310) 555-0144', urgentCare: 'Same-day appointments' }
            ].map((loc, i) => (
              <div
                key={i}
                className={getCardClasses('p-6 space-y-4')}
                style={getCardStyle()}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" style={{ color: customization.primaryColor }} />
                  <h3 className="font-bold text-base text-white">{loc.city}</h3>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <p>{loc.address}</p>
                  <p className="text-slate-400">Hours: {loc.hours}</p>
                  <p className="text-slate-400">Direct Desk: {loc.phone}</p>
                  <span
                    className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-sm mt-2"
                    style={{ backgroundColor: `${customization.primaryColor}20`, color: customization.primaryColor }}
                  >
                    {loc.urgentCare}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: POLICY & FAQ */}
      {activeTab === 'faq' && (
        <div className="flex-1 max-w-4xl mx-auto w-full p-6 space-y-6 animate-in fade-in duration-200">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-black text-white">Patient Policies & Information</h2>
            <p className="text-xs text-slate-400">Helpful details regarding cancellations, insurance, and prep.</p>
          </div>

          <div className="space-y-3">
            {[
              { q: 'How early should I arrive before my scheduled slot?', a: 'Please arrive 10 minutes prior for digital check-in or complete the pre-visit form on your mobile device.' },
              { q: 'Can I reschedule or cancel my appointment?', a: 'Yes, slots can be rescheduled with 1 tap up to 2 hours before the start time with zero cancellation fee.' },
              { q: 'Are telehealth video consultations available?', a: 'Yes, select any slot marked with the video icon to receive a secure HIPAA-compliant video link.' }
            ].map((faq, idx) => (
              <div
                key={idx}
                className={getCardClasses('p-5 space-y-2')}
                style={getCardStyle()}
              >
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 shrink-0" style={{ color: customization.primaryColor }} />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs text-slate-400 pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
