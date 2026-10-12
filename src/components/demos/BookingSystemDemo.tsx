import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Calendar, Clock, CheckCircle2, User, Phone, Check } from 'lucide-react';
import { TemplateItem } from '../../types';

interface BookingSystemDemoProps {
  template: TemplateItem;
  onBack: () => void;
  onUseDesign: (template: TemplateItem) => void;
}

export const BookingSystemDemo: React.FC<BookingSystemDemoProps> = ({
  template,
  onBack,
  onUseDesign
}) => {
  const [selectedDate, setSelectedDate] = useState(15);
  const [selectedSlot, setSelectedSlot] = useState('11:30 AM');
  const [booked, setBooked] = useState(false);

  const bookingsList = [
    { time: '09:00 AM', customer: 'John Smith', service: 'Initial Strategy Consultation', status: 'Confirmed' },
    { time: '11:30 AM', customer: 'Priya Mehta', service: 'Full Service Design Review', status: 'In Progress' },
    { time: '02:00 PM', customer: 'Rahul Verma', service: 'Product Demo & Architecture', status: 'Upcoming' },
    { time: '04:30 PM', customer: 'Sneha Patel', service: 'Sprint Progress Follow Up', status: 'Upcoming' }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <div className="bg-cyan-600 text-white text-xs font-semibold py-2 px-4 text-center">
        Live Booking Management System: Interactive appointment slots, calendar picker, and scheduling queue.
      </div>

      <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Templates</span>
        </button>
        <span className="font-bold text-white text-sm">{template.name} ({template.templateCode})</span>
        <button
          onClick={() => onUseDesign(template)}
          className="bg-[#F95700] hover:bg-[#EA4D00] text-white px-5 py-2 rounded-full font-bold text-xs"
        >
          Use This Concept &rarr;
        </button>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Calendar & Time Slots */}
        <div className="lg:col-span-7 bg-slate-950 rounded-2xl p-6 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <span>January 2026 - Appointments Calendar</span>
            </h3>
            <span className="text-xs text-cyan-400 font-semibold">Surat (IST)</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <span key={d} className="text-slate-500 font-bold py-1">{d}</span>
            ))}
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDate(day)}
                className={`py-2 rounded-xl font-bold transition-all ${
                  selectedDate === day
                    ? 'bg-cyan-500 text-slate-950 shadow-md scale-105'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Available Slots */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase">Available Time Slots for Jan {selectedDate}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'].map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                    selectedSlot === slot
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setBooked(true)}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                {booked ? 'Appointment Booked Successfully!' : `Confirm Booking for Jan ${selectedDate} at ${selectedSlot}`}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Today's Queue */}
        <div className="lg:col-span-5 bg-slate-950 rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-base">Today's Bookings Queue</h3>
          <div className="space-y-3">
            {bookingsList.map((b, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">{b.customer}</div>
                  <div className="text-[11px] text-slate-400">{b.service}</div>
                  <div className="font-mono text-cyan-400 mt-1">{b.time}</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {b.status}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => onUseDesign(template)}
              className="w-full bg-[#F95700] hover:bg-[#EA4D00] text-white py-3 rounded-full font-bold text-xs"
            >
              Build This Booking Platform &rarr;
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
