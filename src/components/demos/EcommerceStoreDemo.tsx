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
    updateField,
    resetToDefault,
    getRadiusClass,
    getFontFamilyClass,
    calculateEstimate
  } = useThemeCustomizer(template, {
    brandName: 'StyleHub Luxe',
    primaryColor: '#F95700',
    accentColor: '#FB923C',
    paletteId: 'orange'
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
            className={`hidden md:flex items-center space-x-6 text-xs font-semibold ${
              customization.themeMode === 'light' ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            <button
              onClick={() => setActiveCategory('all')}
              style={{ color: activeCategory === 'all' ? customization.primaryColor : undefined }}
              className="font-bold"
            >
              Home
            </button>
            <button
              onClick={() => setActiveCategory('men')}
              style={{ color: activeCategory === 'men' ? customization.primaryColor : undefined }}
              className="hover:opacity-75"
            >
              Men
            </button>
            <button
              onClick={() => setActiveCategory('women')}
              style={{ color: activeCategory === 'women' ? customization.primaryColor : undefined }}
              className="hover:opacity-75"
            >
              Women
            </button>
            <button
              onClick={() => setActiveCategory('accessories')}
              style={{ color: activeCategory === 'accessories' ? customization.primaryColor : undefined }}
              className="hover:opacity-75"
            >
              Accessories
            </button>
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
                className="font-extrabold text-xs tracking-wider uppercase px-2.5 py-0.5 rounded-full inline-block"
                style={{
                  color: customization.primaryColor,
                  backgroundColor: `${customization.primaryColor}15`
                }}
              >
                New Season &bull; 2026 Collection
              </span>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight">
                {customization.brandName} <br />
                <span style={{ color: customization.primaryColor }}>Signature Edit</span>
              </h1>
              <p className="text-slate-500 text-sm max-w-md leading-relaxed">
                {customization.tagline}
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`text-white px-7 py-3 text-xs font-bold shadow-md flex items-center gap-2 transition-transform hover:scale-105 ${getRadiusClass('btn')}`}
                  style={{ backgroundColor: customization.primaryColor }}
                >
                  <span>{customization.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDrawerOpen(true)}
                  className={`px-4 py-3 text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${getRadiusClass('btn')}`}
                >
                  Customize Colors
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
                className={`group border hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between ${getRadiusClass('card')} ${
                  customization.themeMode === 'light'
                    ? 'bg-white border-slate-100 hover:border-slate-300'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="relative aspect-4/5 overflow-hidden bg-slate-100">
                    <img
                      src={prod.img}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span
                      className="absolute top-3 left-3 bg-white/95 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs"
                      style={{ color: customization.primaryColor }}
                    >
                      {prod.badge}
                    </span>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <div className="flex items-center gap-1 text-amber-500 text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">{prod.rating}</span>
                    </div>
                    <h4 className="font-bold text-sm">
                      {prod.name}
                    </h4>
                    <div className="font-mono font-bold text-base">
                      ₹{prod.price.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => addToCart(prod)}
                    className={`w-full text-white py-2.5 font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 ${getRadiusClass('btn')}`}
                    style={{ backgroundColor: customization.primaryColor }}
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
