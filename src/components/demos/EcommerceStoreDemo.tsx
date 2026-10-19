import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  ShoppingCart,
  Search,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Headphones,
  Plus,
  Minus,
  Trash2,
  X,
  Star,
  Check,
  Sliders,
  Sparkles
} from 'lucide-react';
import { TemplateItem } from '../../types';
import {
  useThemeCustomizer,
  DemoControlBar,
  DemoCustomizerDrawer,
  FloatingCustomizeButton,
  ThemeCustomizerState
} from './DemoThemeCustomizer';

interface EcommerceStoreDemoProps {
  template: TemplateItem;
  onBack: () => void;
  onUseDesign: (template: TemplateItem, customData?: ThemeCustomizerState) => void;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  img: string;
  category: string;
}

export const EcommerceStoreDemo: React.FC<EcommerceStoreDemoProps> = ({
  template,
  onBack,
  onUseDesign
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'men' | 'women' | 'accessories' | 'footwear'>('all');
  const [activeStorePage, setActiveStorePage] = useState<'shop' | 'story' | 'reviews' | 'support'>('shop');
  const [trackingId, setTrackingId] = useState('VC-84920');
  const [trackedOrder, setTrackedOrder] = useState<any | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 'prod-1',
      name: 'Casual Street Jacket',
      price: 2499,
      qty: 1,
      category: 'Men',
      img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=80'
    }
  ]);

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
    getTopographySummary,
    calculateEstimate
  } = useThemeCustomizer(template, {
    brandName: template.name.includes('Store') || template.name.includes('Luxe') ? template.name : 'Velvet & Co. Luxury Edit'
  });

  const products = [
    {
      id: 'prod-1',
      name: 'Casual Street Jacket',
      price: 2499,
      rating: 4.8,
      category: 'men',
      img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=80',
      badge: 'Best Seller'
    },
    {
      id: 'prod-2',
      name: 'Elegance Evening Dress',
      price: 1899,
      rating: 4.9,
      category: 'women',
      img: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500&auto=format&fit=crop&q=80',
      badge: 'Trending'
    },
    {
      id: 'prod-3',
      name: 'Classic Minimalist Watch',
      price: 3099,
      rating: 4.7,
      category: 'accessories',
      img: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&auto=format&fit=crop&q=80',
      badge: 'Premium'
    },
    {
      id: 'prod-4',
      name: 'Urban Lifestyle Sneakers',
      price: 2299,
      rating: 4.6,
      category: 'footwear',
      img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80',
      badge: 'Hot Deal'
    },
    {
      id: 'prod-5',
      name: 'Artisan Leather Tote',
      price: 3499,
      rating: 4.9,
      category: 'accessories',
      img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=80',
      badge: 'New Arrival'
    },
    {
      id: 'prod-6',
      name: 'Tailored Linen Blazer',
      price: 2899,
      rating: 4.8,
      category: 'women',
      img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=80',
      badge: 'Summer Edit'
    }
  ];

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category === activeCategory);

  const addToCart = (product: any) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          qty: 1,
          category: product.category,
          img: product.img
        }
      ];
    });
    setCartOpen(true);
  };

  const updateQty = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const totalAmount = cartItems.reduce((acc, curr) => acc + curr.price * curr.qty, 0);
  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.qty, 0);

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
            Live E-Commerce Demo: {customization.brandName} Storefront with real cart calculations & instant color switching!
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

      {/* Main E-commerce Store Layout */}
      <div
        className={`flex-1 transition-colors ${
          customization.themeMode === 'dark'
            ? 'bg-slate-950 text-slate-100'
            : customization.themeMode === 'dim'
            ? 'bg-slate-900 text-slate-100'
            : 'bg-white text-slate-800'
        }`}
      >
        
        {/* Navigation */}
        <header
          className={`border-b px-6 py-4 flex items-center justify-between sticky top-12 z-20 backdrop-blur-md ${
            customization.themeMode === 'light'
              ? 'bg-white/95 border-slate-100 text-slate-900'
              : 'bg-slate-950/95 border-slate-800 text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight">
              {customization.brandName}
            </span>
          </div>

          <nav
            className={`hidden md:flex items-center space-x-2 text-xs font-semibold`}
          >
            {[
              { id: 'shop' as const, label: 'Storefront & Products' },
              { id: 'story' as const, label: 'Brand Heritage' },
              { id: 'reviews' as const, label: 'Customer Reviews' },
              { id: 'support' as const, label: 'Track Order & FAQ' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveStorePage(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeStorePage === tab.id
                    ? 'text-white shadow-xs'
                    : customization.themeMode === 'light'
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                style={{
                  backgroundColor: activeStorePage === tab.id ? customization.primaryColor : undefined
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-xs"
                  style={{ backgroundColor: customization.primaryColor }}
                >
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Storefront Pages Quick Switcher */}
        <div
          className={`border-b px-6 py-2 flex items-center justify-between text-xs overflow-x-auto ${
            customization.themeMode === 'light'
              ? 'bg-slate-50 border-slate-200 text-slate-600'
              : 'bg-slate-900/60 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400">
              E-Commerce Pages:
            </span>
            <div className="flex items-center gap-1">
              {[
                { id: 'shop' as const, label: '🛍️ Storefront' },
                { id: 'story' as const, label: '📜 Brand Story' },
                { id: 'reviews' as const, label: '⭐ Reviews (4.9)' },
                { id: 'support' as const, label: '📦 Track Order' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActiveStorePage(p.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    activeStorePage === p.id ? 'text-white shadow-xs' : 'hover:text-slate-200'
                  }`}
                  style={{
                    backgroundColor: activeStorePage === p.id ? customization.primaryColor : undefined
                  }}
                >
                  {p.label}
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
            <span>Customize Storefront Topography</span>
          </button>
        </div>

        {/* VIEW 1: STOREFRONT & PRODUCTS */}
        {activeStorePage === 'shop' && (
          <div className="animate-in fade-in duration-200">
            {/* Hero Section */}
            <section
              className={`relative py-16 px-6 overflow-hidden ${
                customization.themeMode === 'light'
                  ? 'bg-gradient-to-r from-orange-50/50 via-amber-50/40 to-rose-50/40'
                  : 'bg-slate-900/60'
              }`}
            >
              <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span
                    className={`font-extrabold tracking-wider uppercase inline-block ${getRadiusClass('badge')} ${getFontSizeScaleClass('badge')}`}
                    style={getBadgeStyle()}
                  >
                    New Season &bull; 2026 Collection
                  </span>
                  <h1 className={`${getFontSizeScaleClass('hero-title')} leading-tight`}>
                    {customization.brandName} <br />
                    <span style={{ color: customization.primaryColor }}>Signature Edit</span>
                  </h1>
                  <p className={`text-slate-500 max-w-md ${getFontSizeScaleClass('body')}`}>
                    {customization.tagline}
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveCategory('all')}
                      className={`flex items-center gap-2 transition-transform hover:scale-105 ${getRadiusClass('btn')} ${getFontSizeScaleClass('btn')}`}
                      style={getPrimaryButtonStyle()}
                    >
                      <span>{customization.ctaText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDrawerOpen(true)}
                      className={`font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${getRadiusClass('btn')} ${getFontSizeScaleClass('btn')}`}
                    >
                      Customize Topography
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <div className={`overflow-hidden shadow-xl aspect-4/3 max-w-md mx-auto ${getRadiusClass('card')}`}>
                    <img
                      src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80"
                      alt="Fashion model"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 4 Trust Highlights */}
            {customization.showBadges && (
              <section
                className={`border-y py-6 px-6 ${
                  customization.themeMode === 'light'
                    ? 'border-slate-100 bg-white'
                    : 'border-slate-800 bg-slate-900/40'
                }`}
              >
                <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="flex items-center gap-3">
                    <Truck className="w-6 h-6 shrink-0" style={{ color: customization.primaryColor }} />
                    <div>
                      <h5 className="font-bold text-xs">Free Shipping</h5>
                      <p className="text-[11px] text-slate-500">On all prepaid orders</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <RotateCcw className="w-6 h-6 shrink-0" style={{ color: customization.primaryColor }} />
                    <div>
                      <h5 className="font-bold text-xs">Easy Returns</h5>
                      <p className="text-[11px] text-slate-500">7-day hassle-free policy</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 shrink-0" style={{ color: customization.primaryColor }} />
                    <div>
                      <h5 className="font-bold text-xs">Secure Payment</h5>
                      <p className="text-[11px] text-slate-500">256-bit encrypted checkout</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Headphones className="w-6 h-6 shrink-0" style={{ color: customization.primaryColor }} />
                    <div>
                      <h5 className="font-bold text-xs">24/7 Support</h5>
                      <p className="text-[11px] text-slate-500">Always here to assist</p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Shop by Category Tabs */}
            <section className="py-12 px-6 max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-black">Shop by Category</h2>
                  <p className="text-xs text-slate-500 mt-1">Curated selections for every aesthetic.</p>
                </div>

                <div className="flex items-center gap-2">
                  {(['all', 'men', 'women', 'accessories', 'footwear'] as const).map((cat) => {
                    const isActive = activeCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-full capitalize transition-colors ${
                          isActive
                            ? 'text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:opacity-80'
                        }`}
                        style={{ backgroundColor: isActive ? customization.primaryColor : undefined }}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className={getCardClasses('group hover:scale-[1.01] transition-all duration-300 overflow-hidden flex flex-col justify-between')}
                    style={getCardStyle()}
                  >
                    <div>
                      <div className="relative aspect-4/5 overflow-hidden bg-slate-100">
                        <img
                          src={prod.img}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span
                          className={`absolute top-3 left-3 shadow-xs font-bold ${getRadiusClass('badge')} ${getFontSizeScaleClass('badge')}`}
                          style={getBadgeStyle()}
                        >
                          {prod.badge}
                        </span>
                      </div>

                      <div className="p-4 space-y-1.5">
                        <div className="flex items-center gap-1 text-amber-500 text-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">{prod.rating}</span>
                        </div>
                        <h4 className={`font-bold ${getFontSizeScaleClass('heading-md')}`}>
                          {prod.name}
                        </h4>
                        <div className="font-mono font-bold text-base" style={{ color: customization.primaryColor }}>
                          ₹{prod.price.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <button
                        onClick={() => addToCart(prod)}
                        className={`w-full font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 ${getRadiusClass('btn')} ${getFontSizeScaleClass('btn')}`}
                        style={getPrimaryButtonStyle()}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: BRAND STORY */}
        {activeStorePage === 'story' && (
          <div className="animate-in fade-in duration-200 max-w-5xl mx-auto px-6 py-16 space-y-12">
            <div className="text-center max-w-xl mx-auto space-y-3">
              <span
                className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border inline-block"
                style={{
                  color: customization.primaryColor,
                  borderColor: `${customization.primaryColor}30`,
                  backgroundColor: `${customization.primaryColor}10`
                }}
              >
                Our Heritage
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Crafted with Intention & Elegance
              </h1>
              <p className="text-xs text-slate-400">
                Discover the artisanal journey and sustainable ethos of {customization.brandName}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <h3 className="text-xl font-bold text-white">The Pursuit of Flawless Aesthetics</h3>
                <p>
                  Every piece in the <strong>{customization.brandName}</strong> catalog is produced with ethically-sourced materials, fine organic fabrics, and precision hand-finished hardware.
                </p>
                <p>
                  We collaborate with heritage workshops across Milan, Kyoto, and London to bring you wardrobe essentials that outlive ephemeral fashion seasons.
                </p>
                <div className="pt-2 flex items-center gap-4 text-xs font-bold text-white">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    100% Carbon-Neutral Shipping
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Zero Toxic Dyes
                  </span>
                </div>
              </div>

              <div className="aspect-4/3 rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
                <img
                  src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80"
                  alt="Workshop crafting"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: CUSTOMER REVIEWS */}
        {activeStorePage === 'reviews' && (
          <div className="animate-in fade-in duration-200 max-w-5xl mx-auto px-6 py-16 space-y-12">
            <div className="text-center max-w-xl mx-auto space-y-3">
              <span
                className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border inline-block"
                style={{
                  color: customization.primaryColor,
                  borderColor: `${customization.primaryColor}30`,
                  backgroundColor: `${customization.primaryColor}10`
                }}
              >
                Customer Love
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight">
                4.9 / 5.0 from 1,420+ Buyers
              </h1>
              <p className="text-xs text-slate-400">
                Verified reviews from verified shoppers of {customization.brandName}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Aarav Singhania', role: 'Verified Buyer', rating: 5, date: 'Yesterday', review: 'The material feel and stitching precision of the jacket surpassed my expectations. Arrived in 2 days in luxurious recyclable packaging.' },
                { name: 'Sophie Laurent', role: 'Verified Buyer', rating: 5, date: '3 days ago', review: 'The minimalist watch has an incredible weight and clean face. I get compliments on it every single day at work.' },
                { name: 'Kavita Menon', role: 'Verified Buyer', rating: 5, date: '1 week ago', review: 'Evening dress fit was exact to size. Color accuracy matched the online preview 100%. Highly recommended!' }
              ].map((rev, i) => (
                <div
                  key={i}
                  className={getCardClasses('p-6 space-y-3')}
                  style={getCardStyle()}
                >
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed italic">"{rev.review}"</p>
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-white">{rev.name}</span>
                    <span className="text-emerald-400 font-semibold">{rev.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 4: ORDER TRACKING & SUPPORT */}
        {activeStorePage === 'support' && (
          <div className="animate-in fade-in duration-200 max-w-4xl mx-auto px-6 py-16 space-y-12">
            <div className="text-center max-w-xl mx-auto space-y-3">
              <span
                className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border inline-block"
                style={{
                  color: customization.primaryColor,
                  borderColor: `${customization.primaryColor}30`,
                  backgroundColor: `${customization.primaryColor}10`
                }}
              >
                Order Support
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Live Order Dispatch Tracking
              </h1>
              <p className="text-xs text-slate-400">
                Track your package status or contact the {customization.brandName} concierge.
              </p>
            </div>

            {/* Interactive Order Tracker */}
            <div
              className={getCardClasses('p-8 space-y-6 max-w-xl mx-auto')}
              style={getCardStyle()}
            >
              <h3 className="font-bold text-sm text-white">Enter Tracking or Order Number</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 text-white text-xs rounded-lg uppercase"
                />
                <button
                  onClick={() => setTrackedOrder({
                    id: trackingId,
                    status: 'Out for Delivery via Express Courier',
                    eta: 'Today by 5:00 PM',
                    carrier: 'BlueDart / FedEx Priority',
                    location: 'Local Sorting Facility - In Transit'
                  })}
                  className="px-5 py-2 font-bold text-xs text-white rounded-lg shadow-md"
                  style={{ backgroundColor: customization.primaryColor }}
                >
                  Track Package
                </button>
              </div>

              {trackedOrder && (
                <div
                  className="p-4 rounded-xl border space-y-2 animate-in zoom-in-95"
                  style={{
                    backgroundColor: `${customization.primaryColor}12`,
                    borderColor: `${customization.primaryColor}35`
                  }}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Package #{trackedOrder.id}</span>
                    <span className="text-emerald-400 font-bold">{trackedOrder.status}</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    Carrier: <strong>{trackedOrder.carrier}</strong> &bull; ETA: <strong>{trackedOrder.eta}</strong>
                  </div>
                  <p className="text-[11px] text-slate-400">{trackedOrder.location}</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Slide-over Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white text-slate-900 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" style={{ color: customization.primaryColor }} />
                <h3 className="font-bold text-base text-slate-900">Your Shopping Bag ({totalCartCount})</h3>
              </div>
              <button onClick={() => setCartOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-16 text-slate-400 space-y-2">
                  <ShoppingCart className="w-12 h-12 mx-auto text-slate-200" />
                  <p className="text-sm font-medium">Your cart is empty.</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                    <img src={item.img} alt={item.name} className="w-16 h-20 object-cover rounded-lg shrink-0" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                        <span className="text-[11px] text-slate-400">{item.category}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-slate-900">
                          ₹{(item.price * item.qty).toLocaleString('en-IN')}
                        </span>
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-0.5">
                          <button
                            onClick={() => updateQty(item.id, -1)}
                            className="p-1 text-slate-500 hover:text-orange-600"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold font-mono px-1">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.id, 1)}
                            className="p-1 text-slate-500 hover:text-orange-600"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-3">
                <div className="flex justify-between text-sm font-bold text-slate-900">
                  <span>Subtotal:</span>
                  <span className="font-mono font-extrabold" style={{ color: customization.primaryColor }}>
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Shipping and taxes calculated at checkout.</p>
                <button
                  onClick={() => {
                    setCartOpen(false);
                    onUseDesign(template, customization);
                  }}
                  className={`w-full text-white py-3 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${getRadiusClass('btn')}`}
                  style={{ backgroundColor: customization.primaryColor }}
                >
                  <span>Build This E-commerce Store for {customization.brandName}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Sticky Bottom Bar */}
      <div className="sticky bottom-0 z-30 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: customization.primaryColor }} />
          <div>
            <h4 className="font-extrabold text-white text-sm">{customization.brandName} ({template.templateCode})</h4>
            <p className="text-xs text-slate-400">Ready-made e-commerce design with active theme customizer</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-orange-400" />
            <span>Customize Store</span>
          </button>
          <button
            onClick={() => onUseDesign(template, customization)}
            className={`text-white px-6 py-2 font-bold text-xs shadow-lg transition-transform hover:scale-105 ${getRadiusClass('btn')}`}
            style={{ backgroundColor: customization.primaryColor }}
          >
            Use This Design &rarr;
          </button>
        </div>
      </div>

    </div>
  );
};
