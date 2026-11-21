import React, { useState } from 'react';
import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  X,
  BedDouble,
  Bath,
  Maximize2,
  Phone,
  Stethoscope,
  Video,
  Building2,
  ShieldCheck,
  Calculator
} from 'lucide-react';
import { TemplateItem } from '../../../types';

export interface SignatureDemoProps {
  template: TemplateItem;
  onRequestQuote: (template: TemplateItem) => void;
}

/* ============================================================================
   1. OSTERIA BRASA — Michelin Fine Dining & Wood-Fired Kitchen (BIZ-004)
   Theme: Warm Linen Parchment (#F7F3EC) · Espresso (#1C1714) · Ember (#B44B27)
   Typography: Playfair Display + Plus Jakarta Sans
   ============================================================================ */
export const OsteriaBrasaDemo: React.FC<SignatureDemoProps> = ({ template, onRequestQuote }) => {
  const [activeCourse, setActiveCourse] = useState<'tasting' | 'hearth' | 'cellar' | 'desserts'>('tasting');
  const [dietary, setDietary] = useState<'all' | 'veg' | 'gf'>('all');
  const [guests, setGuests] = useState('2 Guests');
  const [date, setDate] = useState('2026-11-28');
  const [timeSlot, setTimeSlot] = useState('8:00 PM');
  const [seating, setSeating] = useState('Main Dining Room');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [reservationCode, setReservationCode] = useState<string | null>(null);

  const menuItems = {
    tasting: [
      { name: 'Charred Hokkaido Scallop', desc: 'Smoked brown butter emulsion, Meyer lemon oil, crispy shallots', price: '$28', veg: false, gf: true },
      { name: 'Heirloom Beetroot Tartare', desc: 'Aged goat curd, toasted pistachio praline, wild sorrel', price: '$22', veg: true, gf: true },
      { name: 'Hand-Cut Tagliolini', desc: 'Black Umbrian truffle, 36-month Parmigiano Reggiano, cultured butter', price: '$34', veg: true, gf: false },
      { name: 'Bluefin Crudo', desc: 'Blood orange ponzu, green chili, cold-pressed Sicilian olive oil', price: '$26', veg: false, gf: true }
    ],
    hearth: [
      { name: 'Dry-Aged Ribeye over White Oak', desc: '45-day Prime cut, bone marrow jus, charred cipollini onions', price: '$68', veg: false, gf: true },
      { name: 'Wood-Roasted Turbot', desc: 'Fennel pollen, saffron fumet, braised baby leeks', price: '$54', veg: false, gf: true },
      { name: 'Ember-Baked Maitake Mushroom', desc: 'Black garlic glaze, smoked polenta, thyme oil', price: '$36', veg: true, gf: true },
      { name: 'Heritage Duck Breast', desc: 'Spiced plum reduction, roasted parsnip purée, crispy skin', price: '$49', veg: false, gf: true }
    ],
    cellar: [
      { name: 'Barolo Riserva 2017, Piedmont', desc: 'Notes of dried rose, wild cherry, cedar, and fine-grained tannin', price: '$24 / $115', veg: true, gf: true },
      { name: 'Chablis Premier Cru 2020', desc: 'Flinty minerality, crisp green apple, white blossom finish', price: '$21 / $98', veg: true, gf: true },
      { name: 'Smoked Negroni Classico', desc: 'Botanical gin, sweet vermouth, bitter aperitivo, rosemary smoke', price: '$19', veg: true, gf: true },
      { name: 'Yuzu & Fig Zero-Proof Tonic', desc: 'Cold-pressed yuzu, roasted fig shrub, botanical sparkling infusion', price: '$14', veg: true, gf: true }
    ],
    desserts: [
      { name: 'Burnt Basque Cheesecake', desc: 'Fig leaf ice cream, warm wildflower honey drizzle', price: '$17', veg: true, gf: true },
      { name: '70% Valrhona Chocolate Tart', desc: 'Espresso caramel, flaky sea salt, toasted hazelnut gelato', price: '$18', veg: true, gf: false },
      { name: 'Poached Comice Pear', desc: 'Cardamom sabayon, almond tuile, late-harvest Riesling syrup', price: '$16', veg: true, gf: true }
    ]
  };

  const visibleDishes = menuItems[activeCourse].filter((item) => {
    if (dietary === 'veg') return item.veg;
    if (dietary === 'gf') return item.gf;
    return true;
  });

  const handleReserve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    setReservationCode(`BRASA-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  return (
    <div className="bg-[#F7F3EC] text-[#1C1714] min-h-screen font-sans selection:bg-[#B44B27] selection:text-white">
      {/* Top Bar Contract: 3 zones */}
      <header className="sticky top-0 z-30 bg-[#F7F3EC]/95 backdrop-blur-md border-b border-[#1C1714]/10">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
          <a
            href="#brasa-top"
            onClick={(e) => e.preventDefault()}
            className="font-serif text-2xl font-semibold tracking-tight text-[#1C1714] whitespace-nowrap shrink-0"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Osteria Brasa
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#544A43]">
            <a href="#brasa-story" className="hover:text-[#1C1714] transition-colors whitespace-nowrap shrink-0">Philosophy</a>
            <a href="#brasa-menu" className="hover:text-[#1C1714] transition-colors whitespace-nowrap shrink-0">Seasonal Menu</a>
            <a href="#brasa-private" className="hover:text-[#1C1714] transition-colors whitespace-nowrap shrink-0">Private Dining</a>
            <a href="#brasa-reserve" className="hover:text-[#1C1714] transition-colors whitespace-nowrap shrink-0">Hours & Location</a>
          </nav>

          <div className="shrink-0">
            <a
              href="#brasa-reserve"
              className="inline-flex items-center gap-2 bg-[#B44B27] hover:bg-[#963C1D] text-white px-5 py-2.5 text-sm font-medium rounded-sm transition-colors whitespace-nowrap shrink-0"
            >
              Reserve a Table
            </a>
          </div>
        </div>
      </header>

      {/* Full-Bleed Candlelit Hero */}
      <section id="brasa-top" className="relative h-[560px] sm:h-[640px] flex items-end overflow-hidden bg-[#1C1714]">
        <img
          src="/src/assets/images/hero_fine_dining_1795231129012.jpg"
          alt="Osteria Brasa dining room and open wood-fired hearth"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1714]/90 via-[#1C1714]/45 to-[#1C1714]/20" />

        <div className="relative max-w-6xl mx-auto w-full px-6 pb-16 pt-24">
          <div className="max-w-2xl space-y-5">
            <p className="text-xs tracking-[0.2em] uppercase text-[#E5C6A8] font-medium">
              Wood-Fired Hearth · Milan &amp; Mumbai · Dinner Service from 6:00 PM
            </p>
            <h1
              className="text-4xl sm:text-6xl font-normal text-[#FAF6F0] leading-[1.08] tracking-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", textWrap: 'balance' }}
            >
              Fire, seasonal harvest, and the quiet ritual of the table.
            </h1>
            <p className="text-[#E6DDD3] text-base sm:text-lg leading-relaxed max-w-xl">
              An intimate 42-seat dining room built around a live white-oak hearth, small-batch cellar vintages, and daily coastal provenance.
            </p>
            <div className="flex flex-wrap items-center gap-5 pt-2">
              <a
                href="#brasa-reserve"
                className="inline-flex items-center gap-2 bg-[#B44B27] hover:bg-[#9A3E1F] text-white px-7 py-3.5 text-sm font-medium rounded-sm transition-colors"
              >
                Book Your Evening
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#brasa-menu"
                className="text-sm font-medium text-[#FAF6F0] underline underline-offset-8 decoration-[#E5C6A8]/60 hover:decoration-[#FAF6F0] transition-colors"
              >
                Explore Autumn Menu
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Press & Craft Proof Band */}
      <section id="brasa-story" className="border-b border-[#1C1714]/10 bg-[#F2ECE2]">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <p className="font-serif text-2xl text-[#1C1714] tabular-nums" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              2 Stars
            </p>
            <p className="text-xs text-[#6B5F56] mt-1">Culinary Guide Distinction 2026</p>
          </div>
          <div>
            <p className="font-serif text-2xl text-[#1C1714] tabular-nums" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              42 Seats
            </p>
            <p className="text-xs text-[#6B5F56] mt-1">Main Dining &amp; 8-Seat Chef Counter</p>
          </div>
          <div>
            <p className="font-serif text-2xl text-[#1C1714] tabular-nums" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              340+
            </p>
            <p className="text-xs text-[#6B5F56] mt-1">Biodynamic Old-World Cellar Labels</p>
          </div>
          <div>
            <p className="font-serif text-2xl text-[#1C1714] tabular-nums" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              100% Wood
            </p>
            <p className="text-xs text-[#6B5F56] mt-1">Seasoned White Oak &amp; Almond Ember</p>
          </div>
        </div>
      </section>

      {/* Interactive Seasonal Menu */}
      <section id="brasa-menu" className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-[#1C1714]/15">
          <div>
            <p className="text-xs text-[#B44B27] font-semibold tracking-widest uppercase">
              Autumn Service
            </p>
            <h2
              className="text-3xl sm:text-4xl text-[#1C1714] mt-2"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              The Evening Menu
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Course Switcher */}
            <div className="inline-flex bg-[#ECE5D9] p-1 rounded-sm">
              {(
                [
                  { id: 'tasting', label: 'First Courses' },
                  { id: 'hearth', label: 'From the Hearth' },
                  { id: 'cellar', label: 'Cellar & Bar' },
                  { id: 'desserts', label: 'Dolci' }
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCourse(tab.id)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-sm transition-colors whitespace-nowrap ${
                    activeCourse === tab.id
                      ? 'bg-[#1C1714] text-[#FAF6F0]'
                      : 'text-[#5A5048] hover:text-[#1C1714]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Dietary Filter */}
            <div className="inline-flex items-center gap-2 text-xs text-[#5A5048]">
              {(['all', 'veg', 'gf'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDietary(d)}
                  className={`px-2.5 py-1.5 rounded-sm border transition-colors whitespace-nowrap ${
                    dietary === d
                      ? 'border-[#B44B27] text-[#B44B27] bg-[#B44B27]/5 font-semibold'
                      : 'border-[#1C1714]/15 hover:border-[#1C1714]/40'
                  }`}
                >
                  {d === 'all' ? 'All Dishes' : d === 'veg' ? 'Vegetarian' : 'Gluten-Free'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-8 pt-10">
          {visibleDishes.map((dish) => (
            <div
              key={dish.name}
              className="pb-6 border-b border-[#1C1714]/10 flex items-start justify-between gap-6"
            >
              <div className="space-y-1.5">
                <h3
                  className="text-xl text-[#1C1714]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {dish.name}
                </h3>
                <p className="text-sm text-[#61564E] leading-relaxed">{dish.desc}</p>
                <p className="text-xs text-[#8A7C72]">
                  {dish.veg ? 'Vegetarian' : 'Chef Signature'}
                  {dish.gf ? ' · Gluten-Free' : ''}
                </p>
              </div>
              <span className="text-base font-medium text-[#1C1714] tabular-nums shrink-0 pt-0.5">
                {dish.price}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Private Dining & Live Reservation Section */}
      <section id="brasa-reserve" className="bg-[#1C1714] text-[#F7F3EC] py-20">
        <div id="brasa-private" className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-14 items-start">
          <div className="lg:col-span-5 space-y-6">
            <p className="text-xs tracking-[0.2em] uppercase text-[#D8906A] font-medium">
              Reservations &amp; Private Cellar
            </p>
            <h2
              className="text-3xl sm:text-4xl text-[#FAF6F0] leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Reserve your table or host an intimate cellar evening.
            </h2>
            <p className="text-sm text-[#BFB5AA] leading-relaxed">
              We release dining room tables 30 days in advance. For parties of 7 to 16 guests, our vaulted wine cellar offers a bespoke 7-course tasting menu curated with our Head Sommelier.
            </p>

            <div className="pt-4 space-y-4 border-t border-white/10 text-sm text-[#D8CFC5]">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#D8906A] mt-1 shrink-0" />
                <span>142 Mercer Courtyard, Heritage Quarter · Valet from 5:30 PM</span>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#D8906A] mt-1 shrink-0" />
                <span>Tuesday – Sunday, 6:00 PM – 11:30 PM · Closed Mondays</span>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#D8906A] mt-1 shrink-0" />
                <span className="tabular-nums">+1 (212) 555-0194 · concierge@osteriabrasa.com</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#251F1B] border border-white/10 p-6 sm:p-10 rounded-sm">
            {reservationCode ? (
              <div className="py-8 space-y-5 text-center">
                <CheckCircle2 className="w-12 h-12 text-[#D8906A] mx-auto" />
                <h3
                  className="text-2xl text-[#FAF6F0]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Table Confirmed — {reservationCode}
                </h3>
                <p className="text-sm text-[#C8BEB3] max-w-md mx-auto">
                  We look forward to welcoming <strong>{guestName}</strong> ({guests}) on{' '}
                  <strong>{date}</strong> at <strong>{timeSlot}</strong> in the <strong>{seating}</strong>.
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
                  <button
                    onClick={() => setReservationCode(null)}
                    className="px-5 py-2.5 text-xs font-medium border border-white/25 text-[#FAF6F0] hover:bg-white/10 rounded-sm transition-colors"
                  >
                    Modify Reservation
                  </button>
                  <button
                    onClick={() => onRequestQuote(template)}
                    className="px-5 py-2.5 text-xs font-medium bg-[#B44B27] hover:bg-[#9A3E1F] text-white rounded-sm transition-colors"
                  >
                    Build a Restaurant Website Like This
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReserve} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-[#BFB5AA] mb-1.5">Party Size</label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="w-full bg-[#1C1714] border border-white/15 px-3 py-2.5 text-sm text-[#FAF6F0] rounded-sm focus:outline-none focus:border-[#D8906A]"
                    >
                      <option>2 Guests</option>
                      <option>4 Guests</option>
                      <option>6 Guests</option>
                      <option>8 Guests (Cellar)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#BFB5AA] mb-1.5">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-[#1C1714] border border-white/15 px-3 py-2.5 text-sm text-[#FAF6F0] rounded-sm focus:outline-none focus:border-[#D8906A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#BFB5AA] mb-1.5">Seating Area</label>
                    <select
                      value={seating}
                      onChange={(e) => setSeating(e.target.value)}
                      className="w-full bg-[#1C1714] border border-white/15 px-3 py-2.5 text-sm text-[#FAF6F0] rounded-sm focus:outline-none focus:border-[#D8906A]"
                    >
                      <option>Main Dining Room</option>
                      <option>Chef&apos;s Hearth Counter</option>
                      <option>Courtyard Terrace</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#BFB5AA] mb-2">Available Evening Seatings</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {['6:30 PM', '7:15 PM', '8:00 PM', '8:45 PM', '9:30 PM'].map((slot) => (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setTimeSlot(slot)}
                        className={`py-2 text-xs font-medium rounded-sm border tabular-nums transition-colors ${
                          timeSlot === slot
                            ? 'bg-[#B44B27] border-[#B44B27] text-white'
                            : 'bg-[#1C1714] border-white/15 text-[#D8CFC5] hover:border-white/40'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#BFB5AA] mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Elena Rostova"
                      className="w-full bg-[#1C1714] border border-white/15 px-3.5 py-2.5 text-sm text-[#FAF6F0] placeholder-[#786D64] rounded-sm focus:outline-none focus:border-[#D8906A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#BFB5AA] mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+1 (555) 234-5678"
                      className="w-full bg-[#1C1714] border border-white/15 px-3.5 py-2.5 text-sm text-[#FAF6F0] placeholder-[#786D64] rounded-sm focus:outline-none focus:border-[#D8906A]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#B44B27] hover:bg-[#9A3E1F] text-white py-3.5 text-sm font-medium rounded-sm transition-colors"
                >
                  Confirm Table Reservation
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="bg-[#15110E] text-[#9A8F86] py-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <span>Osteria Brasa Hospitality Group · All Rights Reserved</span>
          <button
            onClick={() => onRequestQuote(template)}
            className="text-[#E5C6A8] hover:text-white underline underline-offset-4 transition-colors"
          >
            Want a bespoke hospitality website like Osteria Brasa? Request Quote
          </button>
        </div>
      </footer>
    </div>
  );
};

/* ============================================================================
   2. VALLON ESTATES — Architectural Luxury Real Estate (BIZ-005)
   Theme: Cool Concrete Alabaster (#F4F5F6) · Obsidian (#0D131A) · Spruce (#1F4E46)
   Typography: Outfit + JetBrains Mono (tabular specs)
   ============================================================================ */
interface PropertyListing {
  id: string;
  name: string;
  location: string;
  category: 'Villa' | 'Penthouse' | 'Estate';
  price: number;
  priceLabel: string;
  beds: number;
  baths: number;
  sqft: string;
  architect: string;
  summary: string;
  image: string;
  highlights: string[];
}

export const VallonEstatesDemo: React.FC<SignatureDemoProps> = ({ template, onRequestQuote }) => {
  const [filter, setFilter] = useState<'All' | 'Villa' | 'Penthouse' | 'Estate'>('All');
  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);
  const [propertyPrice, setPropertyPrice] = useState(4850000);
  const [downPaymentPct, setDownPaymentPct] = useState(25);
  const [termYears, setTermYears] = useState(30);
  const [viewingSubmitted, setViewingSubmitted] = useState(false);
  const [viewerName, setViewerName] = useState('');
  const [viewerEmail, setViewerEmail] = useState('');

  const properties: PropertyListing[] = [
    {
      id: 'VAL-01',
      name: 'Villa Solis Cantilever',
      location: 'Carmel Highlands, California',
      category: 'Villa',
      price: 6450000,
      priceLabel: '$6,450,000',
      beds: 5,
      baths: 6,
      sqft: '6,840 sq ft',
      architect: 'Kengo & Associates',
      summary: 'Board-formed concrete and Burmese teak cantilever villa overlooking a 75-foot infinity reflecting pool and private coastal oak ridge.',
      image: '/src/assets/images/hero_luxury_estate_1795231129293.jpg',
      highlights: ['75-ft Heated Infinity Pool', 'Private Geothermal Wine Cellar', 'Lutron Architectural Lighting', '4-Car Subterranean Gallery']
    },
    {
      id: 'VAL-02',
      name: 'The Limestone Pavilion',
      location: 'Alibaug Coast, Maharashtra',
      category: 'Estate',
      price: 4200000,
      priceLabel: '$4,200,000',
      beds: 6,
      baths: 7,
      sqft: '9,120 sq ft',
      architect: 'Studio Koma',
      summary: 'Monumental limestone residence arranged around a sunlit sculpture courtyard with private jetty access and acoustic screening room.',
      image: '/src/assets/images/hero_architecture_studio_1795231129202.jpg',
      highlights: ['2.4 Acres Landscaped Grounds', 'Double-Height Limestone Gallery', 'Private Helipad Clearance', 'Dedicated Wellness Hammam']
    },
    {
      id: 'VAL-03',
      name: 'Skyline Residence 54A',
      location: 'Tribeca North, New York',
      category: 'Penthouse',
      price: 8900000,
      priceLabel: '$8,900,000',
      beds: 4,
      baths: 5,
      sqft: '5,350 sq ft',
      architect: 'Atelier Mercer',
      summary: 'Full-floor glass penthouse with 13-foot ceilings, honed travertine hearth, private elevator landing, and 360-degree river views.',
      image: '/src/assets/images/hero_advisory_firm_1795231128545.jpg',
      highlights: ['Direct Private Keyed Elevator', '1,400 sq ft Wrap-Around Terrace', 'Boffi Travertine Chef Kitchen', '24/7 White-Glove Concierge']
    }
  ];

  const filtered = filter === 'All' ? properties : properties.filter((p) => p.category === filter);

  // Real monthly mortgage calculation (6.1% annual rate)
  const principal = propertyPrice * (1 - downPaymentPct / 100);
  const monthlyRate = 0.061 / 12;
  const totalPayments = termYears * 12;
  const monthlyPayment = Math.round(
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments))) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1)
  );

  return (
    <div className="bg-[#F4F5F6] text-[#0D131A] min-h-screen font-sans selection:bg-[#1F4E46] selection:text-white">
      {/* Clean 3-zone Top Bar */}
      <header className="sticky top-0 z-30 bg-[#F4F5F6]/95 backdrop-blur-md border-b border-[#0D131A]/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
          <a
            href="#vallon-top"
            onClick={(e) => e.preventDefault()}
            className="text-xl font-bold tracking-[0.14em] uppercase text-[#0D131A] whitespace-nowrap shrink-0"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            VALLON
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#475467]">
            <a href="#vallon-portfolio" className="hover:text-[#0D131A] transition-colors whitespace-nowrap shrink-0">Residences</a>
            <a href="#vallon-calculator" className="hover:text-[#0D131A] transition-colors whitespace-nowrap shrink-0">Acquisition Desk</a>
            <a href="#vallon-viewing" className="hover:text-[#0D131A] transition-colors whitespace-nowrap shrink-0">Private Viewings</a>
          </nav>

          <div className="shrink-0">
            <a
              href="#vallon-viewing"
              className="inline-flex items-center gap-2 bg-[#0D131A] hover:bg-[#1F4E46] text-white px-5 py-2.5 text-xs font-semibold tracking-wider uppercase transition-colors whitespace-nowrap shrink-0"
            >
              Schedule Viewing
            </a>
          </div>
        </div>
      </header>

      {/* Split Architectural Hero */}
      <section id="vallon-top" className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-5 flex flex-col justify-between bg-white border border-[#0D131A]/10 p-8 sm:p-10">
            <div className="space-y-6">
              <p className="text-xs font-mono tracking-widest uppercase text-[#1F4E46]">
                Architectural Private Brokerage
              </p>
              <h1
                className="text-4xl sm:text-5xl font-semibold text-[#0D131A] leading-[1.08] tracking-tight"
                style={{ fontFamily: "'Outfit', sans-serif", textWrap: 'balance' }}
              >
                Residences of architectural permanence.
              </h1>
              <p className="text-sm sm:text-base text-[#4A5568] leading-relaxed">
                Vallon represents architect-designed estates, coastal villas, and full-floor penthouses across California, New York, and India&apos;s premier enclaves.
              </p>
            </div>

            <div className="pt-8 mt-8 border-t border-[#0D131A]/10 flex flex-wrap items-center gap-4">
              <a
                href="#vallon-portfolio"
                className="inline-flex items-center gap-2 bg-[#1F4E46] hover:bg-[#163A34] text-white px-6 py-3 text-sm font-medium transition-colors"
              >
                Browse Residences
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#vallon-calculator"
                className="text-sm font-medium text-[#0D131A] hover:text-[#1F4E46] transition-colors"
              >
                Financing Estimator
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 relative min-h-[380px] overflow-hidden bg-[#0D131A]">
            <img
              src="/src/assets/images/hero_luxury_estate_1795231129293.jpg"
              alt="Villa Solis Cantilever architectural residence at dusk"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D131A]/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4 text-white">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-white/75">Featured Mandate · VAL-01</p>
                <p className="text-2xl font-semibold mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Villa Solis Cantilever
                </p>
              </div>
              <p className="text-xl font-mono tabular-nums">$6,450,000</p>
            </div>
          </div>
        </div>

        {/* Full-Width Key Brokerage Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#0D131A]/10 border border-[#0D131A]/10 mt-8">
          {[
            { value: '$1.9B+', label: 'Closed Architectural Volume' },
            { value: '48 Days', label: 'Median Time to Private Closing' },
            { value: '62%', label: 'Off-Market Private Placements' },
            { value: '4 Offices', label: 'Carmel · New York · Mumbai · Geneva' }
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-6">
              <p className="text-2xl font-semibold text-[#0D131A] font-mono tabular-nums">{stat.value}</p>
              <p className="text-xs text-[#5A6577] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Filterable Residences Portfolio */}
      <section id="vallon-portfolio" className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#1F4E46]">Curated Inventory</p>
            <h2 className="text-3xl font-semibold text-[#0D131A] mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Available Residences
            </h2>
          </div>

          <div className="inline-flex bg-white border border-[#0D131A]/10 p-1">
            {(['All', 'Villa', 'Penthouse', 'Estate'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                  filter === cat ? 'bg-[#0D131A] text-white' : 'text-[#475467] hover:text-[#0D131A]'
                }`}
              >
                {cat === 'All' ? 'All Mandates' : `${cat}s`}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filtered.map((prop) => (
            <article
              key={prop.id}
              className="bg-white border border-[#0D131A]/10 flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-16/10 overflow-hidden bg-[#0D131A]">
                  <img
                    src={prop.image}
                    alt={prop.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#5A6577] font-mono">
                    <span>{prop.location}</span>
                    <span>{prop.id}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-[#0D131A]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {prop.name}
                  </h3>
                  <p className="text-lg font-mono font-semibold text-[#1F4E46] tabular-nums">{prop.priceLabel}</p>
                  <p className="text-xs text-[#4A5568] leading-relaxed">{prop.summary}</p>
                  <div className="pt-3 border-t border-[#0D131A]/10 flex items-center gap-5 text-xs text-[#4A5568] font-mono tabular-nums">
                    <span className="flex items-center gap-1.5"><BedDouble className="w-3.5 h-3.5" /> {prop.beds} Bed</span>
                    <span className="flex items-center gap-1.5"><Bath className="w-3.5 h-3.5" /> {prop.baths} Bath</span>
                    <span className="flex items-center gap-1.5"><Maximize2 className="w-3.5 h-3.5" /> {prop.sqft}</span>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6">
                <button
                  onClick={() => {
                    setSelectedProperty(prop);
                    setPropertyPrice(prop.price);
                  }}
                  className="w-full py-2.5 border border-[#0D131A] text-[#0D131A] hover:bg-[#0D131A] hover:text-white text-xs font-semibold tracking-wider uppercase transition-colors"
                >
                  Inspect Residence Dossier
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Interactive Acquisition Calculator + Private Viewing */}
      <section id="vallon-calculator" className="bg-[#0D131A] text-white py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Mortgage Estimator */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#7CC4B5]">
              <Calculator className="w-4 h-4" />
              <span>Private Acquisition Calculator</span>
            </div>
            <h2 className="text-3xl font-semibold" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Estimate monthly financing structure
            </h2>

            <div className="space-y-5 bg-white/5 border border-white/10 p-6 sm:p-8">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-300">Acquisition Price</span>
                  <span className="font-mono font-semibold text-white tabular-nums">${propertyPrice.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={1500000}
                  max={12000000}
                  step={250000}
                  value={propertyPrice}
                  onChange={(e) => setPropertyPrice(Number(e.target.value))}
                  className="w-full accent-[#2A8A78]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-300">Down Payment ({downPaymentPct}%)</span>
                  <span className="font-mono font-semibold text-white tabular-nums">
                    ${Math.round(propertyPrice * (downPaymentPct / 100)).toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={60}
                  step={5}
                  value={downPaymentPct}
                  onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                  className="w-full accent-[#2A8A78]"
                />
              </div>

              <div className="flex items-center gap-2">
                {[15, 20, 30].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setTermYears(yr)}
                    className={`flex-1 py-2 text-xs font-mono border transition-colors ${
                      termYears === yr
                        ? 'bg-[#1F4E46] border-[#7CC4B5] text-white'
                        : 'border-white/15 text-slate-300 hover:border-white/40'
                    }`}
                  >
                    {yr} Years
                  </button>
                ))}
              </div>

              <div className="pt-5 border-t border-white/10 flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-wider text-slate-400">Est. Monthly Principal &amp; Interest (6.1%)</span>
                <span className="text-3xl font-mono font-bold text-[#7CC4B5] tabular-nums">
                  ${monthlyPayment.toLocaleString()}/mo
                </span>
              </div>
            </div>
          </div>

          {/* Private Viewing Booking */}
          <div id="vallon-viewing" className="lg:col-span-6 bg-white text-[#0D131A] p-8 sm:p-10">
            {viewingSubmitted ? (
              <div className="py-10 space-y-4 text-center">
                <CheckCircle2 className="w-11 h-11 text-[#1F4E46] mx-auto" />
                <h3 className="text-2xl font-semibold" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Private Viewing Requested
                </h3>
                <p className="text-sm text-[#4A5568]">
                  Our Senior Managing Partner will contact <strong>{viewerName}</strong> within 2 hours to confirm your private chauffeur arrival and dossier access.
                </p>
                <button
                  onClick={() => onRequestQuote(template)}
                  className="mt-2 inline-flex items-center gap-2 bg-[#1F4E46] text-white px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                >
                  Build a Real Estate Site Like This
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (viewerName.trim()) setViewingSubmitted(true);
                }}
                className="space-y-4"
              >
                <p className="text-xs font-mono uppercase tracking-widest text-[#1F4E46]">Direct Partner Desk</p>
                <h3 className="text-2xl font-semibold" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Arrange a Private Viewing
                </h3>
                <p className="text-xs text-[#5A6577]">
                  In-person tours and live 4K architectural walkthroughs available by appointment.
                </p>
                <div className="space-y-3 pt-2">
                  <input
                    type="text"
                    required
                    value={viewerName}
                    onChange={(e) => setViewerName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full border border-[#0D131A]/20 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#1F4E46]"
                  />
                  <input
                    type="email"
                    required
                    value={viewerEmail}
                    onChange={(e) => setViewerEmail(e.target.value)}
                    placeholder="Direct Email"
                    className="w-full border border-[#0D131A]/20 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#1F4E46]"
                  />
                  <select className="w-full border border-[#0D131A]/20 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#1F4E46]">
                    {properties.map((p) => (
                      <option key={p.id}>{p.name} ({p.priceLabel})</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#0D131A] hover:bg-[#1F4E46] text-white py-3.5 text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Request Private Appointment
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Property Dossier Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#0D131A]/15 shadow-2xl">
            <div className="relative h-64">
              <img
                src={selectedProperty.image}
                alt={selectedProperty.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedProperty(null)}
                aria-label="Close property dossier"
                className="absolute top-4 right-4 w-9 h-9 bg-[#0D131A]/85 text-white flex items-center justify-center hover:bg-[#0D131A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 sm:p-8 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-mono text-[#1F4E46] uppercase">{selectedProperty.location} · Architect: {selectedProperty.architect}</p>
                  <h3 className="text-2xl font-semibold text-[#0D131A] mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {selectedProperty.name}
                  </h3>
                </div>
                <p className="text-xl font-mono font-bold text-[#0D131A] tabular-nums">{selectedProperty.priceLabel}</p>
              </div>
              <p className="text-sm text-[#4A5568] leading-relaxed">{selectedProperty.summary}</p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                {selectedProperty.highlights.map((h) => (
                  <div key={h} className="text-xs text-[#1F4E46] bg-[#F4F5F6] px-3 py-2 font-medium">
                    {h}
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#0D131A]/10">
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#4A5568] hover:text-[#0D131A]"
                >
                  Close
                </button>
                <a
                  href="#vallon-viewing"
                  onClick={() => setSelectedProperty(null)}
                  className="px-5 py-2.5 bg-[#1F4E46] text-white text-xs font-semibold uppercase tracking-wider"
                >
                  Book Private Tour
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   3. ARCADIA HEALTH — Nordic Private Medical & Preventive Clinic (BIZ-006)
   Theme: Sunlit Ivory (#FBFBF8) · Botanical Deep Forest (#1B4332) · Soft Sage (#EEF4F0)
   Typography: Plus Jakarta Sans + Playfair Display
   ============================================================================ */
export const ArcadiaHealthDemo: React.FC<SignatureDemoProps> = ({ template, onRequestQuote }) => {
  const [department, setDepartment] = useState<'All' | 'Cardiology' | 'Preventive' | 'Dermatology'>('All');
  const [visitMode, setVisitMode] = useState<'in-clinic' | 'video'>('in-clinic');
  const [selectedDoctor, setSelectedDoctor] = useState('Dr. Linnea Lindholm');
  const [selectedSlot, setSelectedSlot] = useState('10:30 AM');
  const [patientName, setPatientName] = useState('');
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  const specialists = [
    {
      name: 'Dr. Linnea Lindholm',
      role: 'Chief of Preventive Medicine',
      dept: 'Preventive' as const,
      experience: '16 yrs · Karolinska Institute',
      slots: ['09:30 AM', '10:30 AM', '02:00 PM', '04:15 PM']
    },
    {
      name: 'Dr. Rohan Deshmukh',
      role: 'Senior Interventional Cardiologist',
      dept: 'Cardiology' as const,
      experience: '19 yrs · Johns Hopkins Fellow',
      slots: ['10:00 AM', '11:30 AM', '03:00 PM']
    },
    {
      name: 'Dr. Clara Vermeer',
      role: 'Clinical & Laser Dermatology',
      dept: 'Dermatology' as const,
      experience: '12 yrs · Zurich University Hospital',
      slots: ['09:00 AM', '01:15 PM', '03:45 PM', '05:00 PM']
    }
  ];

  const visibleDoctors = department === 'All' ? specialists : specialists.filter((d) => d.dept === department);

  return (
    <div className="bg-[#FBFBF8] text-[#162921] min-h-screen font-sans selection:bg-[#1B4332] selection:text-white">
      {/* Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-[#FBFBF8]/95 backdrop-blur-md border-b border-[#1B4332]/10">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
          <a
            href="#arcadia-top"
            onClick={(e) => e.preventDefault()}
            className="text-xl font-semibold tracking-tight text-[#1B4332] whitespace-nowrap shrink-0"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Arcadia Health
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#476054]">
            <a href="#arcadia-specialists" className="hover:text-[#1B4332] transition-colors whitespace-nowrap shrink-0">Specialists</a>
            <a href="#arcadia-diagnostics" className="hover:text-[#1B4332] transition-colors whitespace-nowrap shrink-0">Diagnostics</a>
            <a href="#arcadia-book" className="hover:text-[#1B4332] transition-colors whitespace-nowrap shrink-0">Book Visit</a>
          </nav>

          <div className="shrink-0">
            <a
              href="#arcadia-book"
              className="inline-flex items-center gap-2 bg-[#1B4332] hover:bg-[#133124] text-white px-5 py-2.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              Book Appointment
            </a>
          </div>
        </div>
      </header>

      {/* Sunlit Nordic Clinic Hero */}
      <section id="arcadia-top" className="max-w-6xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#2D6A4F]">
              Private Medical &amp; Longevity Center
            </p>
            <h1
              className="text-4xl sm:text-5xl font-semibold text-[#162921] leading-[1.1] tracking-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", textWrap: 'balance' }}
            >
              Unhurried, evidence-based care in a calm setting.
            </h1>
            <p className="text-base text-[#4A6156] leading-relaxed max-w-lg">
              Same-day specialist consultations, comprehensive 90-biomarker preventive panels, and unhurried 45-minute appointments designed around lasting health.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#arcadia-book"
                className="inline-flex items-center gap-2 bg-[#1B4332] hover:bg-[#133124] text-white px-6 py-3 rounded-full text-sm font-semibold transition-colors"
              >
                Schedule Today&apos;s Visit
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#arcadia-specialists"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#1B4332] px-4 py-3 hover:underline underline-offset-4"
              >
                Meet Our Physicians
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 rounded-2xl overflow-hidden bg-[#EEF4F0] min-h-[360px]">
            <img
              src="/src/assets/images/hero_medical_clinic_1795231128255.jpg"
              alt="Arcadia Health sunlit Scandinavian clinic atrium"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Full-Width Clinical Trust Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12 pt-8 border-t border-[#1B4332]/10">
          {[
            { metric: '45 min', label: 'Standard Physician Consultation' },
            { metric: '< 10 min', label: 'Average Clinic Wait Time' },
            { metric: '24 hrs', label: 'Digital Lab Result Turnaround' },
            { metric: '4.9 / 5', label: 'Verified Patient Care Score' }
          ].map((item) => (
            <div key={item.label}>
              <p className="text-2xl font-bold text-[#1B4332] tabular-nums">{item.metric}</p>
              <p className="text-xs text-[#546B60] mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Specialist Directory with Live Slot Selection */}
      <section id="arcadia-specialists" className="bg-[#EEF4F0] py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#2D6A4F]">Clinical Faculty</p>
              <h2 className="text-3xl font-semibold text-[#162921] mt-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Choose Your Specialist
              </h2>
            </div>

            <div className="inline-flex bg-white p-1 rounded-full border border-[#1B4332]/10">
              {(['All', 'Preventive', 'Cardiology', 'Dermatology'] as const).map((dept) => (
                <button
                  key={dept}
                  onClick={() => setDepartment(dept)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                    department === dept ? 'bg-[#1B4332] text-white' : 'text-[#4A6156] hover:text-[#162921]'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleDoctors.map((doc) => {
              const isChosen = selectedDoctor === doc.name;
              return (
                <div
                  key={doc.name}
                  className={`bg-white rounded-2xl p-6 border transition-all flex flex-col justify-between ${
                    isChosen ? 'border-[#1B4332] ring-1 ring-[#1B4332]' : 'border-[#1B4332]/10'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#2D6A4F] font-semibold">
                      <span>{doc.dept}</span>
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <h3 className="text-lg font-bold text-[#162921]">{doc.name}</h3>
                    <p className="text-xs text-[#4A6156]">{doc.role}</p>
                    <p className="text-xs text-[#6B8176]">{doc.experience}</p>

                    <div className="pt-3 border-t border-[#1B4332]/10">
                      <p className="text-[11px] font-semibold text-[#546B60] mb-2">Next Available Slots Today</p>
                      <div className="flex flex-wrap gap-1.5">
                        {doc.slots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => {
                              setSelectedDoctor(doc.name);
                              setSelectedSlot(slot);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium tabular-nums transition-colors ${
                              isChosen && selectedSlot === slot
                                ? 'bg-[#1B4332] text-white'
                                : 'bg-[#EEF4F0] text-[#1B4332] hover:bg-[#DCE9E1]'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Diagnostics Packages + Live Appointment Form */}
      <section id="arcadia-diagnostics" className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-6 space-y-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#2D6A4F]">Preventive Screening</p>
          <h2 className="text-3xl font-semibold text-[#162921]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Transparent Diagnostic Panels
          </h2>
          <div className="divide-y divide-[#1B4332]/10 border-y border-[#1B4332]/10">
            {[
              { name: 'Executive Baseline Panel', detail: '68 blood biomarkers · ECG · 45-min physician review', price: '$320' },
              { name: 'Comprehensive Cardiac & Metabolic', detail: 'Coronary calcium screen · ApoB & Lp(a) · Stress echo', price: '$680' },
              { name: 'Full-Body Longevity Assessment', detail: '90+ biomarkers · DEXA composition · Continuous glucose review', price: '$1,150' }
            ].map((pkg) => (
              <div key={pkg.name} className="py-5 flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-bold text-[#162921] text-sm">{pkg.name}</h4>
                  <p className="text-xs text-[#546B60] mt-1">{pkg.detail}</p>
                </div>
                <span className="font-bold text-[#1B4332] text-sm tabular-nums shrink-0">{pkg.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Appointment Booking Card */}
        <div id="arcadia-book" className="lg:col-span-6 bg-white border border-[#1B4332]/15 rounded-2xl p-6 sm:p-8 shadow-xs">
          {bookingRef ? (
            <div className="py-8 text-center space-y-4">
              <ShieldCheck className="w-12 h-12 text-[#1B4332] mx-auto" />
              <h3 className="text-2xl font-semibold text-[#162921]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Appointment Confirmed
              </h3>
              <p className="text-sm text-[#4A6156]">
                Reference <strong className="font-mono text-[#1B4332]">{bookingRef}</strong> · <strong>{patientName}</strong> is scheduled with{' '}
                <strong>{selectedDoctor}</strong> at <strong>{selectedSlot}</strong> ({visitMode === 'in-clinic' ? 'In-Clinic Visit' : 'Encrypted Video Consult'}).
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  onClick={() => setBookingRef(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#1B4332] border border-[#1B4332]/25 rounded-full"
                >
                  Book Another Visit
                </button>
                <button
                  onClick={() => onRequestQuote(template)}
                  className="px-5 py-2 text-xs font-semibold bg-[#1B4332] text-white rounded-full"
                >
                  Build a Healthcare Website Like This
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!patientName.trim()) return;
                setBookingRef(`ARC-${Math.floor(10000 + Math.random() * 90000)}`);
              }}
              className="space-y-4"
            >
              <h3 className="text-xl font-bold text-[#162921]">Instant Appointment Booking</h3>
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#EEF4F0] rounded-xl">
                <button
                  type="button"
                  onClick={() => setVisitMode('in-clinic')}
                  className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    visitMode === 'in-clinic' ? 'bg-white text-[#1B4332] shadow-xs' : 'text-[#4A6156]'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" /> In-Clinic Visit
                </button>
                <button
                  type="button"
                  onClick={() => setVisitMode('video')}
                  className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    visitMode === 'video' ? 'bg-white text-[#1B4332] shadow-xs' : 'text-[#4A6156]'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" /> Video Consult
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FBFBF8] border border-[#1B4332]/10 text-xs text-[#4A6156] flex items-center justify-between">
                <span>Selected: <strong className="text-[#162921]">{selectedDoctor}</strong></span>
                <span className="font-mono font-semibold text-[#1B4332]">{selectedSlot}</span>
              </div>

              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Patient Full Name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#1B4332]/20 text-sm focus:outline-none focus:border-[#1B4332]"
              />
              <input
                type="tel"
                required
                placeholder="Mobile Number for SMS Confirmation"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#1B4332]/20 text-sm focus:outline-none focus:border-[#1B4332]"
              />
              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#1B4332] hover:bg-[#133124] text-white text-sm font-semibold transition-colors"
              >
                Confirm Appointment Slot
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
