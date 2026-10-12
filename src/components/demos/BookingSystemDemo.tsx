import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Calendar, Clock, CheckCircle2, User, Phone, Check, Sliders } from 'lucide-react';
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

export const BookingSystemDemo: React.FC<BookingSystemDemoProps> = ({
  template,
  onBack,
  onUseDesign
}) => {
  const [selectedDate, setSelectedDate] = useState(15);
  const [selectedSlot, setSelectedSlot] = useState('11:30 AM');
  const [booked, setBooked] = useState(false);

  const {
    customization,
    drawerOpen,
    setDrawerOpen,
    applyPalette,
    updateField,
    resetToDefault,
    getRadiusClass,
    getFontFamilyClass,
    calculateEstimate
  } = useThemeCustomizer(template, {
    brandName: 'Schedulr Pro',
    primaryColor: '#0D9488',
    accentColor: '#2DD4BF',
    paletteId: 'teal'
  });

  const bookingsList = [
    { time: '09:00 AM', customer: 'John Smith', service: 'Initial Strategy Consultation', status: 'Confirmed' },
    { time: '11:30 AM', customer: 'Priya Mehta', service: 'Full Service Design Review', status: 'In Progress' },
    { time: '02:00 PM', customer: 'Rahul Verma', service: 'Product Demo & Architecture', status: 'Upcoming' },
    { time: '04:30 PM', customer: 'Sneha Patel', service: 'Sprint Progress Follow Up', status: 'Upcoming' }
  ];

  return (
    <div className={`min-h-screen bg-slate-900 text-slate-100 flex flex-col ${getFontFamilyClass()}`}>
      
      {/* Top Banner */}
      {customization.showPromoBanner && (
        <div
          className="text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2 transition-colors"
          style={{ backgroundColor: customization.primaryColor }}
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>
            Live Booking System Demo: {customization.brandName} - Interactive calendar & customizable theme colors.
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
        onUseDesign={onUseDesign}
      />

      {/* Slide-over Theme Customizer Drawer */}
      <DemoCustomizerDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        template={template}
        customization={customization}
        onApplyPalette={applyPalette}
        onUpdateField={updateField}
        onReset={resetToDefault}
        onUseDesign={onUseDesign}
      />

      {/* Floating Customize Button */}
      <FloatingCustomizeButton
        onOpen={() => setDrawerOpen(true)}
        primaryColor={customization.primaryColor}
      />

      <div className="flex-1 max-w-6xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
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
              Surat (IST)
            </span>
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
                  onClick={() => setSelectedDate(day)}
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
                    onClick={() => setSelectedSlot(slot)}
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
                  ? '✓ Appointment Booked Successfully!'
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
    </div>
  );
};
