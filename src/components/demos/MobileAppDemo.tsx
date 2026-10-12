import React, { useState, useEffect } from 'react';
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
  BarChart3,
  UtensilsCrossed,
  Plus,
  Minus,
  Phone,
  Shield,
  Check,
  Flame,
  Bike,
  Heart,
  Activity,
  Compass,
  Layers,
  ChevronLeft
} from 'lucide-react';
import { TemplateItem } from '../../types';

interface MobileAppDemoProps {
  template: TemplateItem;
  onBack: () => void;
  onUseDesign: (template: TemplateItem) => void;
}

type IosAppMode = 'food' | 'business' | 'fitness' | 'ecommerce';
type AndroidAppMode = 'business' | 'ecommerce' | 'food' | 'healthcare';

export const MobileAppDemo: React.FC<MobileAppDemoProps> = ({
  template,
  onBack,
  onUseDesign
}) => {
  const [platform, setPlatform] = useState<'android' | 'ios'>(
    template.platform || (template.name.toLowerCase().includes('ios') ? 'ios' : 'android')
  );

  // Determine initial app type from template tags/name
  const detectIosAppType = (t: TemplateItem): IosAppMode => {
    const text = (t.name + ' ' + t.industryTag + ' ' + (t.tags || []).join(' ')).toLowerCase();
    if (text.includes('fit') || text.includes('life') || text.includes('health')) return 'fitness';
    if (text.includes('e-com') || text.includes('shop') || text.includes('retail')) return 'ecommerce';
    if (text.includes('food') || text.includes('delivery') || text.includes('restaurant')) return 'food';
    if (text.includes('biz') || text.includes('business') || text.includes('corp')) return 'business';
    return 'food';
  };

  const detectAndroidAppType = (t: TemplateItem): AndroidAppMode => {
    const text = (t.name + ' ' + t.industryTag + ' ' + (t.tags || []).join(' ')).toLowerCase();
    if (text.includes('e-com') || text.includes('shop')) return 'ecommerce';
    if (text.includes('food') || text.includes('delivery')) return 'food';
    if (text.includes('health') || text.includes('medic')) return 'healthcare';
    return 'business';
  };

  const [iosAppMode, setIosAppMode] = useState<IosAppMode>(detectIosAppType(template));
  const [androidAppMode, setAndroidAppMode] = useState<AndroidAppMode>(detectAndroidAppType(template));

  // Active screen state inside the active app
  const [activeScreen, setActiveScreen] = useState<string>('home');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Sync if template prop changes
  useEffect(() => {
    if (template.platform) {
      setPlatform(template.platform);
    }
    if (template.platform === 'ios') {
      setIosAppMode(detectIosAppType(template));
    } else {
      setAndroidAppMode(detectAndroidAppType(template));
    }
    setActiveScreen('home');
  }, [template]);

  // Platform switcher
  const handlePlatformChange = (newPlatform: 'android' | 'ios') => {
    setPlatform(newPlatform);
    setActiveScreen('home');
  };

  const handleIosAppModeChange = (mode: IosAppMode) => {
    setIosAppMode(mode);
    setActiveScreen('home');
  };

  // iOS Food details sample state
  const [selectedPizzaSize, setSelectedPizzaSize] = useState<'Regular' | 'Medium' | 'Large'>('Medium');
  const [extraCheese, setExtraCheese] = useState(true);
  const [pizzaQty, setPizzaQty] = useState(1);
  const pizzaPrice = selectedPizzaSize === 'Regular' ? 199 : selectedPizzaSize === 'Medium' ? 299 : 449;
  const totalPrice = (pizzaPrice + (extraCheese ? 49 : 0)) * pizzaQty + 120 + 29 - 50;

  // iOS Fitness sample state
  const [dailyWater, setDailyWater] = useState(5);
  const [workoutStarted, setWorkoutStarted] = useState(false);

  // iOS Ecommerce state
  const [selectedShoeSize, setSelectedShoeSize] = useState<number>(9);
  const [bagItemCount, setBagItemCount] = useState<number>(2);

  const showNotification = (msg: string) => {
    setCopiedNotification(msg);
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  // Screen Lists definition for the right sidebar explorer
  const getScreensList = () => {
    if (platform === 'ios') {
      switch (iosAppMode) {
        case 'food':
          return [
            { id: 'home', label: 'Feed & Discover', desc: 'Hero promo, food categories & top restaurants' },
            { id: 'restaurants', label: 'Restaurant List', desc: 'Curated restaurants with ratings & delivery times' },
            { id: 'food-details', label: 'Dish Customizer', desc: 'Crust picker, extra cheese toggle & Add to Bag' },
            { id: 'cart', label: 'Bag & Checkout', desc: 'Order breakdown & 1-tap Apple Pay button' },
            { id: 'tracking', label: 'Live Rider GPS Tracking', desc: 'Interactive timeline & rider delivery status' },
            { id: 'profile', label: 'Profile & Face ID', desc: 'Cupertino account settings & delivery addresses' }
          ];
        case 'business':
          return [
            { id: 'home', label: 'Executive Dashboard', desc: 'Revenue KPIs, client volume & financial overview' },
            { id: 'pipeline', label: 'Project Pipeline', desc: 'Sprint progress, live deliverables & team status' },
            { id: 'invoicing', label: 'Apple Card & Billing', desc: 'Instant PDF invoices & Corporate Apple Card' },
            { id: 'clients', label: 'Client Directory', desc: 'Client roster & direct project contacts' },
            { id: 'profile', label: 'Security & FaceID', desc: 'Biometric login & iCloud Keychain sync' }
          ];
        case 'fitness':
          return [
            { id: 'home', label: 'Activity Rings', desc: 'Move (620 kcal), Exercise (38 min), Stand (11 hrs)' },
            { id: 'workouts', label: 'Workout Guides', desc: 'HIIT Cardio, Core Strength & Yoga sessions' },
            { id: 'vitals', label: 'Heart Rate & Vitals', desc: 'Apple Watch sync, resting 64 bpm, blood oxygen' },
            { id: 'nutrition', label: 'Water & Macro Tracker', desc: 'Daily hydration & protein intake counters' },
            { id: 'profile', label: 'HealthKit Profile', desc: 'Member stats & Apple Health connection' }
          ];
        case 'ecommerce':
          return [
            { id: 'home', label: 'Curated Drops', desc: 'New luxury drops, 20% Apple Pay coupon' },
            { id: 'catalog', label: 'Product Catalog', desc: 'Sneakers, apparel, audio & smart accessories' },
            { id: 'product-details', label: 'Product Detail', desc: 'Air Max Pulse, size selector & 3D AR view' },
            { id: 'cart', label: 'Apple Pay Bag', desc: 'One-tap checkout with Apple Wallet' },
            { id: 'profile', label: 'Wishlist & iCloud', desc: 'Saved favorites synced across Apple devices' }
          ];
      }
    } else {
      // Android screens
      return [
        { id: 'home', label: 'Home Screen', desc: 'Dashboard overview, stats & greeting' },
        { id: 'features', label: 'Features Screen', desc: 'App modules & core capabilities' },
        { id: 'services', label: 'Service Details', desc: 'Detailed business offerings & tiers' },
        { id: 'billing', label: 'Payment & Billing', desc: 'Instant UPI, invoices & payment history' },
        { id: 'profile', label: 'User Profile', desc: 'Company settings & preferences' },
        { id: 'notifications', label: 'Push Notifications', desc: 'System alerts & deployment logs' }
      ];
    }
  };

  const screensList = getScreensList();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Demo Banner */}
      <div
        className={`text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2 ${
          platform === 'ios' ? 'bg-indigo-600' : 'bg-emerald-600'
        }`}
      >
        <Smartphone className="w-4 h-4" />
        <span>
          {platform === 'ios'
            ? `iOS Interactive Demo Preview: Authentic iPhone Frame (${iosAppMode.toUpperCase()} App Prototype). Click screens on the right or tap inside the phone!`
            : `Android Interactive Demo Preview: Google Material Frame (${androidAppMode.toUpperCase()} App Prototype). Click screens on the right or tap inside the phone!`}
        </span>
      </div>

      {/* Control Bar */}
      <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Templates</span>
          </button>
          <div>
            <span className="font-bold text-white text-sm">
              {platform === 'ios'
                ? `${iosAppMode === 'food' ? 'Food Delivery' : iosAppMode === 'business' ? 'Business Pro' : iosAppMode === 'fitness' ? 'Fitness & Health' : 'E-Commerce'} App`
                : `${androidAppMode.toUpperCase()} App`}
            </span>
            <span className="text-slate-400 text-xs ml-2 font-mono">
              ({platform === 'ios' ? 'Apple iOS / Swift' : 'Google Android / Kotlin'})
            </span>
          </div>
        </div>

        {/* Platform & Sample App Switchers */}
        <div className="flex items-center gap-2">
          {/* Platform Toggle */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => handlePlatformChange('android')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                platform === 'android'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🤖 Android</span>
            </button>
            <button
              onClick={() => handlePlatformChange('ios')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                platform === 'ios'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🍏 iOS</span>
            </button>
          </div>

          {/* iOS Sample App Mode Switcher */}
          {platform === 'ios' && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs">
              <button
                onClick={() => handleIosAppModeChange('food')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  iosAppMode === 'food'
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Food Delivery
              </button>
              <button
                onClick={() => handleIosAppModeChange('business')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  iosAppMode === 'business'
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Business
              </button>
              <button
                onClick={() => handleIosAppModeChange('fitness')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  iosAppMode === 'fitness'
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Fitness
              </button>
              <button
                onClick={() => handleIosAppModeChange('ecommerce')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  iosAppMode === 'ecommerce'
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                E-Commerce
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() =>
            onUseDesign({
              ...template,
              platform,
              name: `${template.name} (${platform.toUpperCase()})`
            })
          }
          className="flex items-center gap-2 bg-[#F95700] hover:bg-[#EA4D00] text-white px-5 py-2 rounded-full font-bold text-xs shadow-lg shadow-orange-500/30 transition-all hover:scale-105"
        >
          <span>Use This Design</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Optional Notification Toast */}
      {copiedNotification && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* Smartphone Stage & Screen Explorer Split */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start justify-center">
        {/* Left: Interactive Phone Mockup */}
        <div className="lg:col-span-7 flex justify-center py-2 sticky top-20">
          <div
            className={`relative w-[320px] sm:w-[360px] h-[720px] bg-black shadow-2xl p-3 ring-1 transition-all duration-300 ${
              platform === 'ios'
                ? 'rounded-[54px] border-[7px] border-slate-700 ring-slate-800'
                : 'rounded-[46px] border-[6px] border-slate-700 ring-slate-800'
            }`}
          >
            {/* Dynamic Island Pill (iOS) or Hole Punch (Android) */}
            {platform === 'ios' ? (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full flex items-center justify-between px-3 z-30 shadow-md">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
                <div className="w-2 h-2 rounded-full bg-blue-950" />
              </div>
            ) : (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full border border-slate-800 z-30 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-950" />
              </div>
            )}

            {/* Screen Inner Viewport */}
            <div
              className={`w-full h-full bg-slate-50 text-slate-800 overflow-hidden flex flex-col justify-between relative shadow-inner ${
                platform === 'ios' ? 'rounded-[44px]' : 'rounded-[36px]'
              }`}
            >
              {/* Status Bar */}
              <div className="px-6 pt-3 pb-1 flex items-center justify-between text-[11px] font-bold text-slate-800 select-none bg-white border-b border-slate-100">
                <span className={platform === 'ios' ? 'font-semibold tracking-tight' : 'font-mono'}>
                  9:41
                </span>
                <div className="flex items-center gap-1.5 text-slate-800">
                  {platform === 'ios' ? (
                    <>
                      <span className="text-[10px] font-semibold">5G</span>
                      <div className="w-4 h-2 rounded-xs border border-slate-800 p-0.5 flex items-center">
                        <div className="w-full h-full bg-slate-800 rounded-xs" />
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] font-mono">LTE</span>
                      <div className="w-3.5 h-2 rounded-xs bg-slate-800" />
                    </>
                  )}
                </div>
              </div>

              {/* Dynamic Screen Contents */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 no-scrollbar">
                {/* ======================================================== */}
                {/* ==================== iOS SCREENS ====================== */}
                {/* ======================================================== */}
                {platform === 'ios' && (
                  <>
                    {/* ===== IOS APP 1: FOOD DELIVERY ===== */}
                    {iosAppMode === 'food' && (
                      <>
                        {/* iOS Food Home Screen */}
                        {activeScreen === 'home' && (
                          <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <MapPin className="w-3.5 h-3.5 text-orange-600" />
                                <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                                  VIP Road, Surat
                                </span>
                                <span className="text-[10px] text-orange-600 font-bold">&#9662;</span>
                              </div>
                              <div
                                onClick={() => setActiveScreen('profile')}
                                className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 cursor-pointer"
                              >
                                <img
                                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                                  alt="Avatar"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>

                            {/* iOS Hero Banner */}
                            <div className="p-4 rounded-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 text-white space-y-1.5 shadow-md">
                              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-100">
                                Fast Delivery &bull; 20 Mins
                              </span>
                              <h4 className="text-xl font-black leading-tight">
                                Good Food <br />Good Mood
                              </h4>
                              <p className="text-[11px] text-orange-100">
                                Fresh meals delivered straight to your door.
                              </p>
                            </div>

                            {/* Search Input */}
                            <div className="flex items-center gap-2 bg-white px-3.5 py-2.5 rounded-2xl border border-slate-200 shadow-xs">
                              <Search className="w-4 h-4 text-slate-400" />
                              <input
                                type="text"
                                placeholder="Search restaurants, pizzas..."
                                className="bg-transparent text-xs w-full focus:outline-hidden text-slate-700"
                                readOnly
                              />
                            </div>

                            {/* Food Category Pills */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
                              {['All', 'Pizza', 'Burger', 'Drinks', 'Asian'].map((cat, i) => (
                                <button
                                  key={cat}
                                  onClick={() => setActiveScreen('restaurants')}
                                  className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                                    i === 1
                                      ? 'bg-orange-600 text-white shadow-xs'
                                      : 'bg-white border border-slate-200 text-slate-700 hover:border-orange-200'
                                  }`}
                                >
                                  {cat}
                                </button>
                              ))}
                            </div>

                            {/* Popular Spots List */}
                            <div className="space-y-2.5 pt-1">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-extrabold text-slate-900">Popular Near You</span>
                                <button
                                  onClick={() => setActiveScreen('restaurants')}
                                  className="text-orange-600 font-bold text-[11px] hover:underline"
                                >
                                  See All &rarr;
                                </button>
                              </div>

                              {/* Domino's Pizza Card */}
                              <div
                                onClick={() => setActiveScreen('food-details')}
                                className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs hover:border-orange-300 cursor-pointer transition-all flex items-center gap-3"
                              >
                                <img
                                  src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=80"
                                  alt="Pizza"
                                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h5 className="font-bold text-xs text-slate-900 truncate">Domino's Pizza</h5>
                                    <span className="flex items-center gap-0.5 text-amber-500 font-bold text-[10px]">
                                      <Star className="w-3 h-3 fill-amber-500" />
                                      <span>4.8</span>
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 mt-0.5">Cheese Burst, Farmhouse</p>
                                  <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-700 mt-1">
                                    <span className="text-emerald-600 font-bold">20-30 min</span>
                                    <span>&bull;</span>
                                    <span className="font-mono text-slate-900">₹299 for two</span>
                                  </div>
                                </div>
                              </div>

                              {/* Burger King Card */}
                              <div
                                onClick={() => setActiveScreen('food-details')}
                                className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs hover:border-orange-300 cursor-pointer transition-all flex items-center gap-3"
                              >
                                <img
                                  src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80"
                                  alt="Burger"
                                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h5 className="font-bold text-xs text-slate-900 truncate">Burger King</h5>
                                    <span className="flex items-center gap-0.5 text-amber-500 font-bold text-[10px]">
                                      <Star className="w-3 h-3 fill-amber-500" />
                                      <span>4.6</span>
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 mt-0.5">Burgers & Fries</p>
                                  <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-700 mt-1">
                                    <span className="text-emerald-600 font-bold">25 min</span>
                                    <span>&bull;</span>
                                    <span className="font-mono text-slate-900">₹199 for two</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* iOS Restaurant List */}
                        {activeScreen === 'restaurants' && (
                          <div className="space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                              <button
                                onClick={() => setActiveScreen('home')}
                                className="flex items-center gap-1 text-xs font-bold text-orange-600"
                              >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Back</span>
                              </button>
                              <h4 className="font-extrabold text-sm text-slate-900">All Restaurants</h4>
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                28 Open
                              </span>
                            </div>

                            {[
                              {
                                name: "Domino's Pizza",
                                type: 'Italian, Pizza',
                                time: '20-30 min',
                                rating: '4.8',
                                img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=80'
                              },
                              {
                                name: 'Burger King',
                                type: 'American Burgers',
                                time: '25-35 min',
                                rating: '4.6',
                                img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80'
                              },
                              {
                                name: 'Subway Fresh',
                                type: 'Healthy Subs, Salads',
                                time: '15-25 min',
                                rating: '4.7',
                                img: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=200&auto=format&fit=crop&q=80'
                              },
                              {
                                name: 'Taco Bell',
                                type: 'Mexican Tacos, Burritos',
                                time: '30-40 min',
                                rating: '4.5',
                                img: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=200&auto=format&fit=crop&q=80'
                              }
                            ].map((rest, idx) => (
                              <div
                                key={idx}
                                onClick={() => setActiveScreen('food-details')}
                                className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs hover:border-orange-300 cursor-pointer transition-all flex items-center gap-3"
                              >
                                <img
                                  src={rest.img}
                                  alt={rest.name}
                                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h5 className="font-bold text-xs text-slate-900 truncate">{rest.name}</h5>
                                    <span className="text-amber-500 font-bold text-[10px]">★ {rest.rating}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 mt-0.5">{rest.type}</p>
                                  <span className="text-[10px] text-emerald-600 font-semibold">{rest.time}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* iOS Food Details */}
                        {activeScreen === 'food-details' && (
                          <div className="space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                              <button
                                onClick={() => setActiveScreen('home')}
                                className="flex items-center gap-1 text-xs font-bold text-orange-600"
                              >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Back to Feed</span>
                              </button>
                              <span className="text-xs font-bold text-slate-800">Dish Customizer</span>
                            </div>

                            <div className="rounded-2xl overflow-hidden aspect-16/10 bg-slate-100 relative shadow-sm">
                              <img
                                src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80"
                                alt="Pizza details"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 left-2 bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                Chef's Pick
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between">
                                <h4 className="font-extrabold text-sm text-slate-900">
                                  Cheese Burst Farmhouse Pizza
                                </h4>
                                <span className="font-mono font-bold text-orange-600 text-sm">
                                  ₹{pizzaPrice}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                                Hand-tossed crust overloaded with mozzarella, mushrooms, bell peppers and herbs.
                              </p>
                            </div>

                            {/* Size Picker */}
                            <div className="space-y-1.5 pt-1">
                              <span className="text-[10px] font-bold uppercase text-slate-500">
                                Select Crust Size
                              </span>
                              <div className="grid grid-cols-3 gap-2">
                                {(['Regular', 'Medium', 'Large'] as const).map((sz) => (
                                  <button
                                    key={sz}
                                    onClick={() => setSelectedPizzaSize(sz)}
                                    className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                                      selectedPizzaSize === sz
                                        ? 'bg-orange-600 text-white shadow-xs'
                                        : 'bg-white border border-slate-200 text-slate-700'
                                    }`}
                                  >
                                    {sz}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Add-on toggle */}
                            <label className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer">
                              <span className="text-xs font-medium text-slate-800">
                                Add Extra Melted Cheese (+₹49)
                              </span>
                              <input
                                type="checkbox"
                                checked={extraCheese}
                                onChange={(e) => setExtraCheese(e.target.checked)}
                                className="accent-orange-600 w-4 h-4 rounded"
                              />
                            </label>

                            {/* Add to Bag Button */}
                            <div className="flex items-center gap-2 pt-2">
                              <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1">
                                <button
                                  onClick={() => setPizzaQty(Math.max(1, pizzaQty - 1))}
                                  className="p-1 text-slate-600 hover:text-orange-600"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="px-2 font-bold font-mono text-xs text-slate-900">
                                  {pizzaQty}
                                </span>
                                <button
                                  onClick={() => setPizzaQty(pizzaQty + 1)}
                                  className="p-1 text-slate-600 hover:text-orange-600"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <button
                                onClick={() => setActiveScreen('cart')}
                                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>
                                  Add to Bag &bull; ₹
                                  {(pizzaPrice + (extraCheese ? 49 : 0)) * pizzaQty}
                                </span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* iOS Cart & Checkout */}
                        {activeScreen === 'cart' && (
                          <div className="space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                              <button
                                onClick={() => setActiveScreen('home')}
                                className="flex items-center gap-1 text-xs font-bold text-orange-600"
                              >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Back</span>
                              </button>
                              <h4 className="font-extrabold text-sm text-slate-900">Your Order Bag</h4>
                              <span className="text-[10px] font-bold text-slate-500">2 Items</span>
                            </div>

                            {/* Cart items */}
                            <div className="space-y-2">
                              <div className="p-2.5 bg-white rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                                <div>
                                  <div className="font-bold text-slate-900">
                                    Cheese Burst Pizza ({selectedPizzaSize})
                                  </div>
                                  <span className="text-[10px] text-slate-400">
                                    Qty: {pizzaQty} &bull; Extra Cheese
                                  </span>
                                </div>
                                <span className="font-mono font-bold text-slate-900">
                                  ₹{(pizzaPrice + (extraCheese ? 49 : 0)) * pizzaQty}
                                </span>
                              </div>

                              <div className="p-2.5 bg-white rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                                <div>
                                  <div className="font-bold text-slate-900">Garlic Breadsticks</div>
                                  <span className="text-[10px] text-slate-400">Qty: 1 with cheesy dip</span>
                                </div>
                                <span className="font-mono font-bold text-slate-900">₹120</span>
                              </div>
                            </div>

                            {/* Bill Breakdown */}
                            <div className="bg-white p-3 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                              <div className="flex justify-between text-slate-500 text-[11px]">
                                <span>Delivery Fee</span>
                                <span className="font-mono">₹29</span>
                              </div>
                              <div className="flex justify-between text-emerald-600 font-semibold text-[11px]">
                                <span>Coupon Discount (FEAST50)</span>
                                <span className="font-mono">-₹50</span>
                              </div>
                              <div className="flex justify-between font-extrabold text-slate-900 pt-1.5 border-t border-slate-100">
                                <span>To Pay</span>
                                <span className="font-mono text-orange-600">₹{totalPrice}</span>
                              </div>
                            </div>

                            {/* Apple Pay Button */}
                            <button
                              onClick={() => setActiveScreen('tracking')}
                              className="w-full bg-slate-950 hover:bg-black text-white py-3 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                            >
                              <span>Pay with Apple Pay</span>
                              <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
                            </button>
                          </div>
                        )}

                        {/* iOS Order Tracking */}
                        {activeScreen === 'tracking' && (
                          <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                              <button
                                onClick={() => setActiveScreen('home')}
                                className="flex items-center gap-1 text-xs font-bold text-orange-600"
                              >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Home</span>
                              </button>
                              <span className="text-xs font-bold text-slate-800">Order GPS Status</span>
                            </div>

                            <div className="p-4 rounded-3xl bg-slate-950 text-white space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-orange-400 font-bold uppercase text-[10px] tracking-wider">
                                  Live Order #FD-8942
                                </span>
                                <span className="text-emerald-400 font-bold font-mono">14 MINS AWAY</span>
                              </div>
                              <h4 className="text-lg font-black text-white leading-tight">
                                Food is on the way!
                              </h4>
                              <p className="text-[11px] text-slate-300">
                                Rider picked up order from Domino's.
                              </p>
                            </div>

                            {/* Interactive Step Timeline */}
                            <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3 text-xs">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                  <Check className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900">Order Confirmed</div>
                                  <span className="text-[10px] text-slate-400">9:38 PM</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                  <Check className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900">Freshly Baked & Packed</div>
                                  <span className="text-[10px] text-slate-400">9:45 PM</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center shrink-0 animate-bounce">
                                  <Bike className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                  <div className="font-bold text-orange-600">Rider Out for Delivery</div>
                                  <span className="text-[10px] text-slate-500 font-semibold">
                                    Arriving at 9:59 PM
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Rider Card */}
                            <div className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                                  RK
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900">Rajesh Kumar</div>
                                  <div className="text-[10px] text-slate-400">Delivery Partner &bull; 4.9 ★</div>
                                </div>
                              </div>
                              <button
                                onClick={() => showNotification('Calling Delivery Partner: +91 98765 43210')}
                                className="p-2 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                              >
                                <Phone className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* iOS Profile & Settings */}
                        {activeScreen === 'profile' && (
                          <div className="space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                              <button
                                onClick={() => setActiveScreen('home')}
                                className="flex items-center gap-1 text-xs font-bold text-orange-600"
                              >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Back</span>
                              </button>
                              <span className="text-xs font-bold text-slate-800">Apple ID Account</span>
                            </div>

                            <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 shrink-0">
                                <img
                                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                                  alt="Priya Avatar"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-sm text-slate-900">Priya Mehta</h4>
                                <p className="text-[11px] text-slate-500">priya.m@icloud.com</p>
                                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                                  iOS Gold Member
                                </span>
                              </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 text-xs">
                              <div
                                onClick={() => showNotification('Opening Apple Pay Cards')}
                                className="p-3 flex justify-between items-center text-slate-800 cursor-pointer hover:bg-slate-50"
                              >
                                <span>Apple Pay & Payment Cards</span>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              </div>
                              <div
                                onClick={() => setActiveScreen('tracking')}
                                className="p-3 flex justify-between items-center text-slate-800 cursor-pointer hover:bg-slate-50"
                              >
                                <span>Live & Past Food Orders</span>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              </div>
                              <div className="p-3 flex justify-between items-center text-slate-800">
                                <span>Face ID Quick Checkout</span>
                                <span className="text-emerald-600 font-bold text-[11px]">Enabled</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* ===== IOS APP 2: BUSINESS & FINANCE ===== */}
                    {iosAppMode === 'business' && (
                      <>
                        {activeScreen === 'home' && (
                          <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400">
                                  Enterprise Portfolio
                                </span>
                                <h4 className="text-base font-extrabold text-slate-900">
                                  Codemaniac Corp
                                </h4>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                                CM
                              </div>
                            </div>

                            {/* KPI Banner */}
                            <div className="p-4 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white space-y-2 shadow-lg">
                              <span className="text-[10px] text-slate-300 uppercase tracking-widest font-semibold">
                                Total Active Pipeline
                              </span>
                              <div className="text-2xl font-black font-mono tracking-tight">₹48,50,000</div>
                              <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold">
                                <span>▲ +18.4% this quarter</span>
                                <span>&bull;</span>
                                <span className="text-slate-300 font-normal">14 enterprise accounts</span>
                              </div>
                            </div>

                            {/* Fast Actions */}
                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                              <div
                                onClick={() => setActiveScreen('pipeline')}
                                className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-orange-300 cursor-pointer shadow-xs"
                              >
                                <Briefcase className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                                <span className="font-bold text-[10px] text-slate-800">Pipelines</span>
                              </div>
                              <div
                                onClick={() => setActiveScreen('invoicing')}
                                className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-orange-300 cursor-pointer shadow-xs"
                              >
                                <CreditCard className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                                <span className="font-bold text-[10px] text-slate-800">Invoices</span>
                              </div>
                              <div
                                onClick={() => setActiveScreen('clients')}
                                className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-orange-300 cursor-pointer shadow-xs"
                              >
                                <Users className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                                <span className="font-bold text-[10px] text-slate-800">Clients</span>
                              </div>
                            </div>

                            {/* Active Deliverables */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-extrabold text-slate-900">Active Deliverables</span>
                                <button
                                  onClick={() => setActiveScreen('pipeline')}
                                  className="text-orange-600 font-bold text-[11px]"
                                >
                                  View All
                                </button>
                              </div>

                              {[
                                { title: 'Mobile App Redesign', client: 'Nexus Retail', progress: 85, color: 'bg-emerald-600' },
                                { title: 'Cloud CRM Migration', client: 'Apex Health', progress: 60, color: 'bg-blue-600' },
                                { title: 'Payment Gateway Setup', client: 'Velocity Logistics', progress: 40, color: 'bg-orange-600' }
                              ].map((proj, idx) => (
                                <div key={idx} className="p-3 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-1.5">
                                  <div className="flex justify-between text-xs font-bold text-slate-900">
                                    <span>{proj.title}</span>
                                    <span className="font-mono text-[11px] text-slate-500">{proj.progress}%</span>
                                  </div>
                                  <div className="text-[10px] text-slate-400">{proj.client}</div>
                                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${proj.color} rounded-full`} style={{ width: `${proj.progress}%` }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {activeScreen === 'pipeline' && (
                          <div className="space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                              <button onClick={() => setActiveScreen('home')} className="flex items-center gap-1 text-xs font-bold text-orange-600">
                                <ChevronLeft className="w-4 h-4" />
                                <span>Dashboard</span>
                              </button>
                              <h4 className="font-extrabold text-sm text-slate-900">Project Pipeline</h4>
                              <span className="text-[10px] font-bold text-slate-500">6 Projects</span>
                            </div>

                            {[
                              { name: 'iOS Health Tracker', stage: 'Testing / QA', tag: 'Mobile', budget: '₹6.5L' },
                              { name: 'Multi-Tenant ERP Portal', stage: 'Architecture', tag: 'Web App', budget: '₹14L' },
                              { name: 'E-commerce Redesign', stage: 'Production Deploy', tag: 'Shop', budget: '₹4.2L' },
                              { name: 'Student Portal Sync', stage: 'Database Migration', tag: 'Backend', budget: '₹3.8L' }
                            ].map((p, i) => (
                              <div key={i} className="p-3 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-bold text-slate-900">{p.name}</span>
                                  <span className="font-mono font-bold text-emerald-600 text-[11px]">{p.budget}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-slate-500">
                                  <span>Phase: {p.stage}</span>
                                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold">{p.tag}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {activeScreen === 'invoicing' && (
                          <div className="space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                              <button onClick={() => setActiveScreen('home')} className="flex items-center gap-1 text-xs font-bold text-orange-600">
                                <ChevronLeft className="w-4 h-4" />
                                <span>Back</span>
                              </button>
                              <h4 className="font-extrabold text-sm text-slate-900">Invoices & Apple Card</h4>
                              <span className="text-[10px] font-bold text-emerald-600">Sync On</span>
                            </div>

                            <div className="p-4 rounded-2xl bg-gradient-to-tr from-slate-950 to-indigo-900 text-white space-y-2">
                              <div className="flex justify-between text-[10px] font-mono">
                                <span>Apple Corporate Card</span>
                                <span>•••• 8412</span>
                              </div>
                              <div className="text-xl font-bold font-mono">₹2,84,500</div>
                              <div className="text-[10px] text-slate-400">Available Limit: ₹15,00,000</div>
                            </div>

                            <button
                              onClick={() => showNotification('Generated Invoice #INV-2026-081')}
                              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-xs"
                            >
                              + Create New Client Invoice
                            </button>
                          </div>
                        )}

                        {activeScreen === 'clients' && (
                          <div className="space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                              <button onClick={() => setActiveScreen('home')} className="flex items-center gap-1 text-xs font-bold text-orange-600">
                                <ChevronLeft className="w-4 h-4" />
                                <span>Back</span>
                              </button>
                              <h4 className="font-extrabold text-sm text-slate-900">Client Directory</h4>
                              <span className="text-[10px] font-bold text-slate-400">14 Active</span>
                            </div>

                            {['Apex Global Corp', 'Nexus Retail India', 'Horizon Media Lab', 'FinEdge Technologies'].map((c, i) => (
                              <div key={i} className="p-3 rounded-2xl bg-white border border-slate-100 flex items-center justify-between text-xs">
                                <div>
                                  <div className="font-bold text-slate-900">{c}</div>
                                  <span className="text-[10px] text-slate-400">Dedicated Account Manager</span>
                                </div>
                                <span className="text-emerald-600 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded">Active</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {activeScreen === 'profile' && (
                          <div className="space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                              <button onClick={() => setActiveScreen('home')} className="flex items-center gap-1 text-xs font-bold text-orange-600">
                                <ChevronLeft className="w-4 h-4" />
                                <span>Back</span>
                              </button>
                              <span className="text-xs font-bold text-slate-800">Biometrics & Access</span>
                            </div>

                            <div className="p-3 bg-white rounded-2xl border border-slate-100 text-xs space-y-2">
                              <div className="flex justify-between items-center">
                                <span>FaceID Biometric Login</span>
                                <span className="text-emerald-600 font-bold">Enabled</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>iCloud Keychain Sync</span>
                                <span className="text-emerald-600 font-bold">Active</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* ===== IOS APP 3: FITNESS & HEALTH ===== */}
                    {iosAppMode === 'fitness' && (
                      <>
                        {activeScreen === 'home' && (
                          <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-[10px] text-slate-400 uppercase font-bold">Today's Summary</span>
                                <h4 className="text-base font-extrabold text-slate-900">Activity Rings</h4>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                                <Activity className="w-4 h-4" />
                              </div>
                            </div>

                            {/* 3 Rings Mockup */}
                            <div className="p-4 rounded-3xl bg-slate-950 text-white space-y-3 shadow-md">
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <div className="text-xs font-bold text-rose-400">MOVE: 620 / 700 KCAL</div>
                                  <div className="text-xs font-bold text-emerald-400">EXERCISE: 38 / 45 MIN</div>
                                  <div className="text-xs font-bold text-cyan-400">STAND: 11 / 12 HRS</div>
                                </div>
                                <div className="w-16 h-16 rounded-full border-4 border-rose-500 flex items-center justify-center border-t-emerald-400 border-l-cyan-400 animate-spin duration-1000">
                                  <span className="text-[10px] font-mono font-bold">88%</span>
                                </div>
                              </div>
                            </div>

                            {/* Workout Quick Launcher */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-extrabold text-slate-900">Featured Workouts</span>
                                <button onClick={() => setActiveScreen('workouts')} className="text-orange-600 font-bold text-[11px]">
                                  See All
                                </button>
                              </div>

                              <div
                                onClick={() => setActiveScreen('workouts')}
                                className="p-3 rounded-2xl bg-white border border-slate-100 flex items-center justify-between cursor-pointer hover:border-orange-300 shadow-xs"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                                    <Flame className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-xs text-slate-900">HIIT Fat Burner</div>
                                    <span className="text-[10px] text-slate-400">25 Mins &bull; 280 kcal</span>
                                  </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-orange-500" />
                              </div>

                              <div
                                onClick={() => setActiveScreen('vitals')}
                                className="p-3 rounded-2xl bg-white border border-slate-100 flex items-center justify-between cursor-pointer hover:border-orange-300 shadow-xs"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                                    <Heart className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-xs text-slate-900">Heart Rate Vitals</div>
                                    <span className="text-[10px] text-slate-400">Resting 64 bpm &bull; Apple Watch</span>
                                  </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-rose-500" />
                              </div>
                            </div>
                          </div>
                        )}

                        {activeScreen === 'workouts' && (
                          <div className="space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                              <button onClick={() => setActiveScreen('home')} className="flex items-center gap-1 text-xs font-bold text-orange-600">
                                <ChevronLeft className="w-4 h-4" />
                                <span>Rings</span>
                              </button>
                              <h4 className="font-extrabold text-sm text-slate-900">Workout Plans</h4>
                              <span className="text-[10px] font-bold text-emerald-600">Ready</span>
                            </div>

                            {[
                              { title: 'Core Strength Builder', time: '20 Min', cal: '190 kcal', diff: 'Intermediate' },
                              { title: 'Morning Vinyasa Yoga', time: '15 Min', cal: '95 kcal', diff: 'Beginner' },
                              { title: 'Outdoor Cycling Sprint', time: '40 Min', cal: '410 kcal', diff: 'Advanced' }
                            ].map((w, i) => (
                              <div key={i} className="p-3 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-1.5">
                                <div className="flex justify-between text-xs font-bold text-slate-900">
                                  <span>{w.title}</span>
                                  <span className="text-orange-600">{w.cal}</span>
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-500">
                                  <span>Duration: {w.time}</span>
                                  <span className="font-semibold text-slate-700">{w.diff}</span>
                                </div>
                                <button
                                  onClick={() => {
                                    setWorkoutStarted(!workoutStarted);
                                    showNotification(workoutStarted ? 'Workout Paused' : 'Started Workout Session!');
                                  }}
                                  className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    workoutStarted ? 'bg-rose-600 text-white' : 'bg-slate-950 text-white'
                                  }`}
                                >
                                  {workoutStarted ? 'Stop Workout' : 'Start Workout Session'}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {activeScreen === 'vitals' && (
                          <div className="space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                              <button onClick={() => setActiveScreen('home')} className="flex items-center gap-1 text-xs font-bold text-orange-600">
                                <ChevronLeft className="w-4 h-4" />
                                <span>Back</span>
                              </button>
                              <h4 className="font-extrabold text-sm text-slate-900">Apple Watch Vitals</h4>
                              <span className="text-[10px] font-bold text-emerald-600">Connected</span>
                            </div>

                            <div className="p-4 rounded-3xl bg-slate-950 text-white space-y-2">
                              <span className="text-[10px] text-slate-400 uppercase font-mono">Heart Rate Live</span>
                              <div className="text-3xl font-black font-mono text-rose-400">68 BPM</div>
                              <p className="text-[10px] text-slate-400">Resting rate consistent over last 7 days.</p>
                            </div>

                            <div className="p-3 rounded-2xl bg-white border border-slate-100 space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span>Blood Oxygen (SpO2)</span>
                                <span className="font-bold text-emerald-600 font-mono">99%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Respiratory Rate</span>
                                <span className="font-bold text-slate-800 font-mono">14 brpm</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeScreen === 'nutrition' && (
                          <div className="space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                              <button onClick={() => setActiveScreen('home')} className="flex items-center gap-1 text-xs font-bold text-orange-600">
                                <ChevronLeft className="w-4 h-4" />
                                <span>Back</span>
                              </button>
                              <h4 className="font-extrabold text-sm text-slate-900">Hydration Tracker</h4>
                              <span className="text-[10px] font-bold text-cyan-600 font-mono">{dailyWater} / 8 Glasses</span>
                            </div>

                            <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200 text-center space-y-2">
                              <div className="text-2xl font-black text-cyan-900">{dailyWater * 250} ml</div>
                              <div className="flex justify-center gap-3">
                                <button
                                  onClick={() => setDailyWater(Math.max(0, dailyWater - 1))}
                                  className="w-8 h-8 rounded-full bg-white border border-cyan-300 text-cyan-800 font-bold flex items-center justify-center"
                                >
                                  -
                                </button>
                                <button
                                  onClick={() => setDailyWater(dailyWater + 1)}
                                  className="w-8 h-8 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center shadow-xs"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeScreen === 'profile' && (
                          <div className="space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                              <button onClick={() => setActiveScreen('home')} className="flex items-center gap-1 text-xs font-bold text-orange-600">
                                <ChevronLeft className="w-4 h-4" />
                                <span>Back</span>
                              </button>
                              <span className="text-xs font-bold text-slate-800">Apple HealthKit</span>
                            </div>
                            <div className="p-3 bg-white rounded-2xl border border-slate-100 text-xs">
                              <div className="font-bold text-slate-900">Priya Mehta</div>
                              <span className="text-[10px] text-slate-500">Apple HealthKit Synced</span>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* ===== IOS APP 4: E-COMMERCE ===== */}
                    {iosAppMode === 'ecommerce' && (
                      <>
                        {activeScreen === 'home' && (
                          <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-[10px] text-slate-400 uppercase font-bold">Cupertino Drops</span>
                                <h4 className="text-base font-extrabold text-slate-900">Modern Streetwear</h4>
                              </div>
                              <div
                                onClick={() => setActiveScreen('cart')}
                                className="relative p-2 rounded-full bg-white border border-slate-200 cursor-pointer"
                              >
                                <ShoppingBag className="w-4 h-4 text-slate-800" />
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                                  {bagItemCount}
                                </span>
                              </div>
                            </div>

                            {/* Hero Drop Banner */}
                            <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-700 to-indigo-900 text-white space-y-1.5 shadow-md">
                              <span className="text-[10px] font-bold tracking-widest text-purple-200 uppercase">
                                Apple Pay Exclusive &bull; 20% Off
                              </span>
                              <h4 className="text-lg font-black leading-tight">Air Max Pulse Edition</h4>
                              <button
                                onClick={() => setActiveScreen('product-details')}
                                className="bg-white text-slate-950 font-bold text-[10px] px-3 py-1.5 rounded-full mt-1"
                              >
                                View Product Details &rarr;
                              </button>
                            </div>

                            {/* Catalog Preview */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-extrabold text-slate-900">Trending Now</span>
                                <button onClick={() => setActiveScreen('catalog')} className="text-orange-600 font-bold text-[11px]">
                                  Catalog &rarr;
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-2.5">
                                {[
                                  { name: 'Air Max Pulse', price: '₹9,999', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80' },
                                  { name: 'Minimal Audio Pods', price: '₹4,499', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80' }
                                ].map((item, i) => (
                                  <div
                                    key={i}
                                    onClick={() => setActiveScreen('product-details')}
                                    className="bg-white p-2.5 rounded-2xl border border-slate-100 shadow-xs cursor-pointer hover:border-orange-300"
                                  >
                                    <img src={item.img} alt={item.name} className="w-full h-24 object-cover rounded-xl mb-1.5" />
                                    <div className="font-bold text-xs text-slate-900 truncate">{item.name}</div>
                                    <span className="font-mono font-bold text-orange-600 text-xs">{item.price}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {activeScreen === 'catalog' && (
                          <div className="space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                              <button onClick={() => setActiveScreen('home')} className="flex items-center gap-1 text-xs font-bold text-orange-600">
                                <ChevronLeft className="w-4 h-4" />
                                <span>Drops</span>
                              </button>
                              <h4 className="font-extrabold text-sm text-slate-900">Full Catalog</h4>
                              <span className="text-[10px] font-bold text-slate-400">12 Items</span>
                            </div>

                            {[
                              { name: 'Air Max Pulse Edition', price: '₹9,999', tag: 'Sneakers' },
                              { name: 'Titanium Smart Watch Band', price: '₹2,499', tag: 'Accessories' },
                              { name: 'Minimal Noise Cancelling Pods', price: '₹4,499', tag: 'Audio' }
                            ].map((prod, i) => (
                              <div
                                key={i}
                                onClick={() => setActiveScreen('product-details')}
                                className="p-3 bg-white rounded-2xl border border-slate-100 flex items-center justify-between cursor-pointer hover:border-orange-300 text-xs"
                              >
                                <div>
                                  <div className="font-bold text-slate-900">{prod.name}</div>
                                  <span className="text-[10px] text-slate-400">{prod.tag}</span>
                                </div>
                                <span className="font-mono font-bold text-orange-600">{prod.price}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {activeScreen === 'product-details' && (
                          <div className="space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                              <button onClick={() => setActiveScreen('home')} className="flex items-center gap-1 text-xs font-bold text-orange-600">
                                <ChevronLeft className="w-4 h-4" />
                                <span>Back</span>
                              </button>
                              <span className="text-xs font-bold text-slate-800">Air Max Pulse</span>
                            </div>

                            <img
                              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80"
                              alt="Sneaker"
                              className="w-full aspect-16/10 object-cover rounded-2xl"
                            />

                            <div className="flex justify-between items-center">
                              <h4 className="font-extrabold text-sm text-slate-900">Nike Air Max Pulse</h4>
                              <span className="font-mono font-bold text-orange-600 text-sm">₹9,999</span>
                            </div>

                            {/* Size selector */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold uppercase text-slate-400">Select UK Size</span>
                              <div className="flex gap-2">
                                {[7, 8, 9, 10, 11].map((sz) => (
                                  <button
                                    key={sz}
                                    onClick={() => setSelectedShoeSize(sz)}
                                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                                      selectedShoeSize === sz
                                        ? 'bg-orange-600 text-white'
                                        : 'bg-white border border-slate-200 text-slate-700'
                                    }`}
                                  >
                                    {sz}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setBagItemCount(bagItemCount + 1);
                                setActiveScreen('cart');
                              }}
                              className="w-full bg-slate-950 text-white py-2.5 rounded-xl font-bold text-xs shadow-md mt-2 flex items-center justify-center gap-2"
                            >
                              <ShoppingBag className="w-4 h-4" />
                              <span>Add to Apple Bag &bull; ₹9,999</span>
                            </button>
                          </div>
                        )}

                        {activeScreen === 'cart' && (
                          <div className="space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                              <button onClick={() => setActiveScreen('home')} className="flex items-center gap-1 text-xs font-bold text-orange-600">
                                <ChevronLeft className="w-4 h-4" />
                                <span>Shop</span>
                              </button>
                              <h4 className="font-extrabold text-sm text-slate-900">Apple Pay Bag</h4>
                              <span className="text-[10px] font-bold text-slate-400">{bagItemCount} Items</span>
                            </div>

                            <div className="p-3 bg-white rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                              <div>
                                <div className="font-bold text-slate-900">Air Max Pulse (Size UK {selectedShoeSize})</div>
                                <span className="text-[10px] text-slate-400">Qty: 1 &bull; Red edition</span>
                              </div>
                              <span className="font-mono font-bold text-slate-900">₹9,999</span>
                            </div>

                            <button
                              onClick={() => showNotification('Apple Pay Payment Authorized: ₹9,999')}
                              className="w-full bg-black text-white py-3 rounded-2xl font-bold text-xs shadow-md flex items-center justify-center gap-2"
                            >
                              <span>Pay with Apple Pay</span>
                              <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
                            </button>
                          </div>
                        )}

                        {activeScreen === 'profile' && (
                          <div className="space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                              <button onClick={() => setActiveScreen('home')} className="flex items-center gap-1 text-xs font-bold text-orange-600">
                                <ChevronLeft className="w-4 h-4" />
                                <span>Back</span>
                              </button>
                              <span className="text-xs font-bold text-slate-800">Saved Wishlist</span>
                            </div>
                            <div className="p-3 bg-white rounded-2xl border border-slate-100 text-xs">
                              <span>3 items saved to iCloud Wishlist</span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                {/* ======================================================== */}
                {/* =================== ANDROID SCREENS ==================== */}
                {/* ======================================================== */}
                {platform === 'android' && (
                  <>
                    {activeScreen === 'home' && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs text-slate-500">Hello,</span>
                            <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                              John Smith
                            </h4>
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

                        {/* Android KPI Banner */}
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white space-y-1 shadow-md">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-100">
                            Active Operations
                          </span>
                          <div className="text-xl font-bold font-mono">1,420 Tasks</div>
                          <p className="text-[11px] text-emerald-100">All systems operational & synced.</p>
                        </div>

                        {/* Quick modules */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div
                            onClick={() => setActiveScreen('features')}
                            className="p-3 rounded-xl bg-white border border-slate-200 hover:border-orange-300 cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4 text-orange-600 mb-1" />
                            <div className="font-bold text-slate-900">Features</div>
                            <span className="text-[10px] text-slate-400">View modules</span>
                          </div>
                          <div
                            onClick={() => setActiveScreen('billing')}
                            className="p-3 rounded-xl bg-white border border-slate-200 hover:border-orange-300 cursor-pointer"
                          >
                            <CreditCard className="w-4 h-4 text-emerald-600 mb-1" />
                            <div className="font-bold text-slate-900">Billing</div>
                            <span className="text-[10px] text-slate-400">UPI Payments</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeScreen === 'features' && (
                      <div className="space-y-3 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                          <button onClick={() => setActiveScreen('home')} className="flex items-center gap-1 text-xs font-bold text-orange-600">
                            <ChevronLeft className="w-4 h-4" />
                            <span>Home</span>
                          </button>
                          <h4 className="font-extrabold text-sm text-slate-900">Features</h4>
                        </div>
                        {['Real-time Push Alerts', 'Automated UPI Invoicing', 'Role-based Permissions', 'Offline Data Cache'].map((feat, i) => (
                          <div key={i} className="p-3 bg-white rounded-xl border border-slate-100 text-xs flex items-center justify-between">
                            <span className="font-semibold text-slate-800">{feat}</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </div>
                        ))}
                      </div>
                    )}

                    {activeScreen === 'services' && (
                      <div className="space-y-3 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                          <button onClick={() => setActiveScreen('home')} className="flex items-center gap-1 text-xs font-bold text-orange-600">
                            <ChevronLeft className="w-4 h-4" />
                            <span>Back</span>
                          </button>
                          <h4 className="font-extrabold text-sm text-slate-900">Service Tiers</h4>
                        </div>
                        {['Starter Android Package', 'Enterprise Custom Build', 'Store Maintenance & Uploads'].map((s, i) => (
                          <div key={i} className="p-3 bg-white rounded-xl border border-slate-100 text-xs font-bold text-slate-800">
                            {s}
                          </div>
                        ))}
                      </div>
                    )}

                    {activeScreen === 'billing' && (
                      <div className="space-y-3 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                          <button onClick={() => setActiveScreen('home')} className="flex items-center gap-1 text-xs font-bold text-orange-600">
                            <ChevronLeft className="w-4 h-4" />
                            <span>Back</span>
                          </button>
                          <h4 className="font-extrabold text-sm text-slate-900">Instant UPI Billing</h4>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-slate-100 text-xs">
                          <div className="font-bold text-slate-900">UPI Id: codemaniac@upi</div>
                          <span className="text-[10px] text-slate-400">Zero transaction fees on Google Pay / PhonePe</span>
                        </div>
                      </div>
                    )}

                    {activeScreen === 'profile' && (
                      <div className="space-y-3 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                          <button onClick={() => setActiveScreen('home')} className="flex items-center gap-1 text-xs font-bold text-orange-600">
                            <ChevronLeft className="w-4 h-4" />
                            <span>Back</span>
                          </button>
                          <h4 className="font-extrabold text-sm text-slate-900">Profile Settings</h4>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-slate-100 text-xs">
                          <div className="font-bold text-slate-900">John Smith</div>
                          <span className="text-[10px] text-slate-400">john.smith@example.com</span>
                        </div>
                      </div>
                    )}

                    {activeScreen === 'notifications' && (
                      <div className="space-y-2 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                          <button onClick={() => setActiveScreen('home')} className="flex items-center gap-1 text-xs font-bold text-orange-600">
                            <ChevronLeft className="w-4 h-4" />
                            <span>Back</span>
                          </button>
                          <h4 className="font-extrabold text-sm text-slate-900">Notifications</h4>
                        </div>
                        <div className="p-2.5 bg-white rounded-xl border border-slate-100 text-xs">
                          <div className="font-bold text-slate-800">Deployment Succeeded</div>
                          <p className="text-[10px] text-slate-500">Build #482 deployed to Google Play Console.</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Bottom App Navigation Bar inside phone */}
              <div className="bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-around text-slate-400 select-none">
                {platform === 'ios' ? (
                  <>
                    <button
                      onClick={() => setActiveScreen('home')}
                      className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
                        activeScreen === 'home' ? 'text-orange-600' : 'hover:text-slate-700'
                      }`}
                    >
                      <Home className="w-4 h-4" />
                      <span>Feed</span>
                    </button>

                    <button
                      onClick={() => {
                        if (iosAppMode === 'food') setActiveScreen('restaurants');
                        else if (iosAppMode === 'business') setActiveScreen('pipeline');
                        else if (iosAppMode === 'fitness') setActiveScreen('workouts');
                        else setActiveScreen('catalog');
                      }}
                      className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
                        ['restaurants', 'pipeline', 'workouts', 'catalog'].includes(activeScreen)
                          ? 'text-orange-600'
                          : 'hover:text-slate-700'
                      }`}
                    >
                      <Compass className="w-4 h-4" />
                      <span>Explore</span>
                    </button>

                    <button
                      onClick={() => {
                        if (iosAppMode === 'food') setActiveScreen('cart');
                        else if (iosAppMode === 'business') setActiveScreen('invoicing');
                        else if (iosAppMode === 'fitness') setActiveScreen('nutrition');
                        else setActiveScreen('cart');
                      }}
                      className={`flex flex-col items-center gap-0.5 text-[10px] font-bold relative ${
                        ['cart', 'invoicing', 'nutrition'].includes(activeScreen)
                          ? 'text-orange-600'
                          : 'hover:text-slate-700'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Action</span>
                      <span className="absolute -top-1 right-2 w-3.5 h-3.5 bg-orange-600 text-white rounded-full text-[8px] flex items-center justify-center font-bold">
                        2
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveScreen('profile')}
                      className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
                        activeScreen === 'profile' ? 'text-orange-600' : 'hover:text-slate-700'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>Profile</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setActiveScreen('home')}
                      className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
                        activeScreen === 'home' ? 'text-emerald-600' : 'hover:text-slate-700'
                      }`}
                    >
                      <Home className="w-4 h-4" />
                      <span>Home</span>
                    </button>
                    <button
                      onClick={() => setActiveScreen('features')}
                      className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
                        activeScreen === 'features' ? 'text-emerald-600' : 'hover:text-slate-700'
                      }`}
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Features</span>
                    </button>
                    <button
                      onClick={() => setActiveScreen('billing')}
                      className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
                        activeScreen === 'billing' ? 'text-emerald-600' : 'hover:text-slate-700'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Billing</span>
                    </button>
                    <button
                      onClick={() => setActiveScreen('profile')}
                      className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
                        activeScreen === 'profile' ? 'text-emerald-600' : 'hover:text-slate-700'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>Profile</span>
                    </button>
                  </>
                )}
              </div>

              {/* iOS / Android Home Indicator Bar */}
              <div className="w-28 h-1 bg-slate-300 rounded-full mx-auto my-1.5" />
            </div>
          </div>
        </div>

        {/* Right: Screen Navigator Explorer */}
        <div className="lg:col-span-5 space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-orange-500 font-bold text-xs uppercase tracking-widest">
                Interactive Screen Navigator
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  platform === 'ios'
                    ? 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}
              >
                {platform === 'ios' ? `APPLE IOS (${iosAppMode.toUpperCase()})` : 'GOOGLE ANDROID'}
              </span>
            </div>

            <h3 className="text-2xl font-extrabold text-white mt-1">
              {platform === 'ios'
                ? `Test iOS Screens (${iosAppMode === 'food' ? 'Food Delivery' : iosAppMode === 'business' ? 'Business Pro' : iosAppMode === 'fitness' ? 'Fitness & Health' : 'E-Commerce'})`
                : 'Test Android Mobile Screens'}
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Click any screen below to instantly switch the mobile viewport layout. You can also tap and explore inside the device frame directly.
            </p>
          </div>

          {/* iOS App Samples Picker */}
          {platform === 'ios' && (
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-300">
                Choose iOS Application Prototype Sample:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => handleIosAppModeChange('food')}
                  className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                    iosAppMode === 'food'
                      ? 'bg-orange-600/20 border-orange-500 text-orange-400'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-sm">🍕 Food Delivery</div>
                  <div className="text-[10px] text-slate-400 font-normal">Menu, Cart & GPS</div>
                </button>

                <button
                  onClick={() => handleIosAppModeChange('business')}
                  className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                    iosAppMode === 'business'
                      ? 'bg-orange-600/20 border-orange-500 text-orange-400'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-sm">💼 Business & Finance</div>
                  <div className="text-[10px] text-slate-400 font-normal">Revenue & Pipelines</div>
                </button>

                <button
                  onClick={() => handleIosAppModeChange('fitness')}
                  className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                    iosAppMode === 'fitness'
                      ? 'bg-orange-600/20 border-orange-500 text-orange-400'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-sm">🏃 Fitness & Health</div>
                  <div className="text-[10px] text-slate-400 font-normal">Activity Rings & Vitals</div>
                </button>

                <button
                  onClick={() => handleIosAppModeChange('ecommerce')}
                  className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                    iosAppMode === 'ecommerce'
                      ? 'bg-orange-600/20 border-orange-500 text-orange-400'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-sm">🛍️ E-Commerce</div>
                  <div className="text-[10px] text-slate-400 font-normal">Apple Pay & Drops</div>
                </button>
              </div>
            </div>
          )}

          {/* Interactive Screens List */}
          <div className="space-y-2.5">
            {screensList.map((scr) => (
              <button
                key={scr.id}
                onClick={() => setActiveScreen(scr.id)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                  activeScreen === scr.id
                    ? 'bg-slate-800 border-orange-500 shadow-md ring-1 ring-orange-500'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <div>
                  <h4
                    className={`text-xs font-bold ${
                      activeScreen === scr.id ? 'text-orange-400' : 'text-slate-200'
                    }`}
                  >
                    {scr.label}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{scr.desc}</p>
                </div>
                <ChevronRight
                  className={`w-4 h-4 ${
                    activeScreen === scr.id ? 'text-orange-400' : 'text-slate-500'
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
            <button
              onClick={() =>
                onUseDesign({
                  ...template,
                  platform,
                  name: `${template.name} (${platform.toUpperCase()})`
                })
              }
              className="w-full flex items-center justify-center gap-2 bg-[#F95700] hover:bg-[#EA4D00] text-white py-3.5 rounded-full font-bold text-xs shadow-lg shadow-orange-500/25 transition-all hover:scale-105"
            >
              <span>Use This Design ({platform.toUpperCase()})</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onBack}
              className="w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
            >
              View More {platform.toUpperCase()} Templates &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
