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
  Check
} from 'lucide-react';
import { TemplateItem } from '../../types';

interface EcommerceStoreDemoProps {
  template: TemplateItem;
  onBack: () => void;
  onUseDesign: (template: TemplateItem) => void;
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
          img: product.img,
          category: product.category
        }
      ];
    });
    setCartOpen(true);
  };

  const updateQty = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const totalAmount = cartItems.reduce((acc, curr) => acc + curr.price * curr.qty, 0);
  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.qty, 0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      
      {/* Top Banner */}
      <div className="bg-emerald-600 text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2">
        <span>Interactive E-commerce Store: Add products to cart, change quantities, and test checkout user flow.</span>
      </div>

      {/* Sticky Bar */}
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
            <span className="text-slate-400 text-xs ml-2">({template.templateCode})</span>
          </div>
        </div>

        <button
          onClick={() => onUseDesign(template)}
          className="flex items-center gap-2 bg-[#F95700] hover:bg-[#EA4D00] text-white px-5 py-2 rounded-full font-bold text-xs shadow-lg shadow-orange-500/30 transition-all transform hover:scale-105"
        >
          <span>Use This Design</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main E-commerce Store Layout (Light Theme inside) */}
      <div className="flex-1 bg-white text-slate-800 font-sans">
        
        {/* StyleHub Navigation */}
        <header className="border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-[57px] bg-white/95 backdrop-blur-md z-20">
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              Style<span className="text-orange-600">Hub</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-600">
            <button onClick={() => setActiveCategory('all')} className={activeCategory === 'all' ? 'text-orange-600' : 'hover:text-slate-900'}>Home</button>
            <button onClick={() => setActiveCategory('all')} className="hover:text-slate-900">Shop</button>
            <button onClick={() => setActiveCategory('men')} className={activeCategory === 'men' ? 'text-orange-600' : 'hover:text-slate-900'}>Men</button>
            <button onClick={() => setActiveCategory('women')} className={activeCategory === 'women' ? 'text-orange-600' : 'hover:text-slate-900'}>Women</button>
            <button onClick={() => setActiveCategory('accessories')} className={activeCategory === 'accessories' ? 'text-orange-600' : 'hover:text-slate-900'}>Accessories</button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2.5 rounded-full bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-600 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-orange-50 via-amber-50 to-rose-50 py-16 px-6 overflow-hidden">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-orange-600 font-extrabold text-xs tracking-wider uppercase">
                New Season &bull; 2026 Collection
              </span>
              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
                New Season <br />
                <span className="text-orange-600">New Style</span>
              </h1>
              <p className="text-slate-600 text-sm max-w-md leading-relaxed">
                Discover the latest collection of trendy clothing for every occasion. Modern silhouettes designed with premium comfort.
              </p>
              <button
                onClick={() => setActiveCategory('all')}
                className="bg-orange-600 hover:bg-orange-700 text-white px-7 py-3 rounded-full text-xs font-bold shadow-md shadow-orange-500/25 flex items-center gap-2"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-xl aspect-4/3 max-w-md mx-auto">
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80"
                  alt="Fashion model"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 4 Trust Highlights (matching Reference Image 9) */}
        <section className="border-y border-slate-100 py-6 px-6 bg-white">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <Truck className="w-6 h-6 text-orange-600 shrink-0" />
              <div>
                <h5 className="font-bold text-xs text-slate-900">Free Shipping</h5>
                <p className="text-[11px] text-slate-500">On all prepaid orders</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="w-6 h-6 text-orange-600 shrink-0" />
              <div>
                <h5 className="font-bold text-xs text-slate-900">Easy Returns</h5>
                <p className="text-[11px] text-slate-500">7-day hassle-free policy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-orange-600 shrink-0" />
              <div>
                <h5 className="font-bold text-xs text-slate-900">Secure Payment</h5>
                <p className="text-[11px] text-slate-500">256-bit encrypted checkout</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Headphones className="w-6 h-6 text-orange-600 shrink-0" />
              <div>
                <h5 className="font-bold text-xs text-slate-900">24/7 Support</h5>
                <p className="text-[11px] text-slate-500">Always here to assist</p>
              </div>
            </div>
          </div>
        </section>

        {/* Shop by Category Tabs */}
        <section className="py-12 px-6 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Shop by Category</h2>
              <p className="text-xs text-slate-500 mt-1">Curated selections for every aesthetic.</p>
            </div>

            <div className="flex items-center gap-2">
              {(['all', 'men', 'women', 'accessories', 'footwear'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-full capitalize transition-colors ${
                    activeCategory === cat
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="group rounded-2xl border border-slate-100 hover:border-orange-200 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between bg-white"
              >
                <div>
                  <div className="relative aspect-4/5 overflow-hidden bg-slate-100">
                    <img
                      src={prod.img}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[10px] font-bold text-orange-600 px-2.5 py-1 rounded-full shadow-xs">
                      {prod.badge}
                    </span>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <div className="flex items-center gap-1 text-amber-500 text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span className="font-bold text-slate-700 text-[11px]">{prod.rating}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-orange-600 transition-colors">
                      {prod.name}
                    </h4>
                    <div className="font-mono font-bold text-slate-900 text-base">
                      ₹{prod.price.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => addToCart(prod)}
                    className="w-full bg-[#F95700] hover:bg-[#EA4D00] text-white py-2.5 rounded-xl font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2"
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
                <ShoppingCart className="w-5 h-5 text-orange-600" />
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
                  <span className="font-mono text-orange-600">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-[10px] text-slate-400">Shipping and taxes calculated at checkout.</p>
                <button
                  onClick={() => {
                    setCartOpen(false);
                    onUseDesign(template);
                  }}
                  className="w-full bg-[#F95700] hover:bg-[#EA4D00] text-white py-3 rounded-full font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Build This E-commerce Store</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Sticky Bottom Bar */}
      <div className="sticky bottom-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
        <div>
          <h4 className="font-extrabold text-white text-sm">{template.name}</h4>
          <p className="text-xs text-slate-400">Ready-made e-commerce design with cart & checkout ({template.templateCode})</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
          >
            &larr; Back to Templates
          </button>
          <button
            onClick={() => onUseDesign(template)}
            className="bg-[#F95700] hover:bg-[#EA4D00] text-white px-6 py-2 rounded-full font-bold text-xs shadow-lg shadow-orange-500/30"
          >
            Use This Design &rarr;
          </button>
        </div>
      </div>

    </div>
  );
};
