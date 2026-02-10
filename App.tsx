
import React, { useState, useMemo, useRef, useEffect } from 'react';
import Layout from './components/Layout';
import AIDesigner from './components/AIDesigner';
import StylistChat from './components/StylistChat';
import AutoCarousel from './components/AutoCarousel';
import ProductDetail from './components/ProductDetail';
import CheckoutForm from './components/CheckoutForm';
import SuccessPage from './components/SuccessPage';
import TrackingView from './components/TrackingView';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import { PRODUCTS as INITIAL_PRODUCTS, REVIEWS } from './constants';
import { Product, CartItem, View } from './types';
import { ShoppingBag, ChevronRight, Plus, Minus, ChevronLeft, ShieldCheck, Zap, Truck, Sparkles, Activity, MapPin, Trash2, Loader2, Star, Quote, ArrowDown } from 'lucide-react';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz6t7ea5QCdTITMFucAq-baDdBVUgUxJe-vJRvcQLtjKySHF_S8qUvuGpD0zfNKlG9l/exec';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shippingLocation, setShippingLocation] = useState<'dhaka' | 'outside'>('dhaka');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);

  const fetchLiveProducts = async () => {
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getAdminData`);
      const data = await response.json();
      if (data.products && Array.isArray(data.products)) {
        const mappedProducts: Product[] = data.products.map((p: any) => ({
          id: String(p.id),
          name: p.name || 'Untitled T-Shirt',
          price: Number(p.price) || 0,
          description: p.description || '',
          image: p.image || '',
          category: (p.category as any) || 'Modern'
        }));

        setProducts(prev => {
          const combined = [...INITIAL_PRODUCTS];
          mappedProducts.forEach(cloudProd => {
            const existingIndex = combined.findIndex(p => p.id === cloudProd.id);
            if (existingIndex !== -1) {
              combined[existingIndex] = cloudProd;
            } else {
              combined.push(cloudProd);
            }
          });
          return combined;
        });
      }
    } catch (error) {
      console.error("Cloud sync failed:", error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchLiveProducts();
  }, []);

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);
  const shippingFee = cart.length > 0 ? (shippingLocation === 'dhaka' ? 60 : 120) : 0;
  const grandTotal = subtotal + shippingFee;

  const addToCart = (product: Product, size: string = 'L') => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === size);
      if (existing) {
        return prev.map(item => (item.id === product.id && item.selectedSize === size) ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1, selectedSize: size }];
    });
  };

  const updateQuantity = (id: string, size: string | undefined, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && item.selectedSize === size) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string, size: string | undefined) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.selectedSize === size)));
  };

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setView('product-detail');
    window.scrollTo(0, 0);
  };

  const formatPrice = (amount: number) => `৳${amount.toLocaleString('en-BD')}`;

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 300;
      sliderRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  if (view === 'admin') {
    if (!isAdminAuthenticated) return <AdminLogin onLogin={() => setIsAdminAuthenticated(true)} />;
    return <AdminPanel onLogout={() => { setIsAdminAuthenticated(false); setView('home'); }} onInventoryUpdate={fetchLiveProducts} />;
  }

  const renderHome = () => (
    <div className="bg-white">
      {/* 1. HERO SECTION - Editorial Style */}
      <section className="relative min-h-screen flex items-center bg-white">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40vw] font-black text-gray-100 select-none">UNIKA</span>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
          <div className="animate-in fade-in slide-in-from-left duration-1000">
            <div className="flex items-center space-x-3 mb-8">
              <span className="w-12 h-[1px] bg-black"></span>
              <span className="text-xs font-black uppercase tracking-[0.4em]">Est. 2024 • Dhaka</span>
            </div>
            <h1 className="text-8xl md:text-[10rem] font-black leading-[0.8] tracking-tighter mb-10">
              WEAR <br /> GEN<span className="text-transparent bg-clip-text bg-gradient-to-br from-black to-gray-400">AI</span>.
            </h1>
            <p className="text-xl text-gray-500 max-w-lg mb-12 font-medium leading-relaxed">
              The first apparel house in Bangladesh dedicated to the fusion of Generative Artificial Intelligence and premium street fashion. 
            </p>
            <div className="flex items-center space-x-6">
              <button onClick={() => setView('shop')} className="px-10 py-5 bg-black text-white rounded-full font-bold hover:scale-105 transition-all shadow-xl">Explore Catalog</button>
              <button onClick={() => setView('designer')} className="flex items-center space-x-2 text-black font-black uppercase tracking-widest text-xs border-b-2 border-black pb-1 hover:text-gray-400 hover:border-gray-400 transition-all">
                <span>Start Designing</span>
                <Sparkles size={14} />
              </button>
            </div>
          </div>
          <div className="hidden lg:block relative group">
            <div className="absolute inset-0 bg-black/5 rounded-[4rem] -rotate-3 scale-105 group-hover:rotate-0 transition-all duration-700"></div>
            <AutoCarousel products={products} onViewProduct={openProductDetail} formatPrice={formatPrice} />
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
          <ArrowDown size={32} />
        </div>
      </section>

      {/* 2. THE VISION - Storytelling Section */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
          <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000">
            <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="Fashion Design" />
          </div>
          <div>
            <h2 className="text-5xl font-black mb-8 leading-tight">Art Without <br /> Boundaries.</h2>
            <p className="text-gray-500 text-lg mb-8 leading-relaxed italic">
              "We didn't just want to sell t-shirts. We wanted to provide a canvas where human imagination meets machine precision."
            </p>
            <p className="text-gray-600 mb-10 leading-relaxed">
              Every garment in our catalog started as a prompt, a dream, or a digital iteration. We use state-of-the-art AI models to generate textures and concepts that traditional design software could never conceive.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-black text-3xl mb-1">100%</h4>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Organic Cotton</p>
              </div>
              <div>
                <h4 className="font-black text-3xl mb-1">AI-Gen</h4>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Exclusive Art</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRENDING COLLECTION - Product Grid */}
      <section className="py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h3 className="text-sm font-black text-red-500 uppercase tracking-[0.3em] mb-4">New Arrivals</h3>
              <h2 className="text-6xl font-black tracking-tighter">Season One: Genesis</h2>
            </div>
            <button onClick={() => setView('shop')} className="text-sm font-black uppercase tracking-widest border-b-2 border-black pb-2">View Full Collection</button>
          </div>

          <div ref={sliderRef} className="flex space-x-10 overflow-x-auto scrollbar-hide pb-12 snap-x">
            {products.map(product => (
              <div key={product.id} className="min-w-[320px] md:min-w-[400px] snap-start group cursor-pointer" onClick={() => openProductDetail(product)}>
                <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden mb-8 shadow-md group-hover:shadow-2xl transition-all duration-700">
                  <img src={product.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={product.name} />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white text-black px-8 py-4 rounded-full font-black flex items-center space-x-2 translate-y-4 group-hover:translate-y-0 transition-transform">
                      <span>View Details</span>
                      <Plus size={20} />
                    </div>
                  </div>
                </div>
                <div className="px-4">
                  <h4 className="text-2xl font-black mb-1">{product.name}</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-medium">{product.category}</span>
                    <span className="text-xl font-bold">{formatPrice(product.price)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. THE COLLECTIVE - Reviews Section */}
      <section className="py-32 bg-black text-white rounded-[5rem] mx-6 mb-32 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-10 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-black mb-4">The Collective</h2>
            <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">What our community says</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {REVIEWS.map((review, i) => (
              <div key={i} className="p-10 bg-white/5 rounded-[3rem] border border-white/10 hover:bg-white/10 transition-all group">
                <Quote size={40} className="text-white/20 mb-8 group-hover:text-white/40 transition-colors" />
                <p className="text-lg font-medium leading-relaxed mb-10 text-gray-300 italic">"{review.text}"</p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center font-black">{review.name[0]}</div>
                  <div>
                    <h5 className="font-bold">{review.name}</h5>
                    <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION - Final Push */}
      <section className="py-32 bg-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <Sparkles className="mx-auto text-black mb-8" size={48} />
          <h2 className="text-6xl font-black mb-8 tracking-tighter">Your Imagination. <br /> Our Craftsmanship.</h2>
          <p className="text-gray-500 mb-12 text-lg">Join the hundreds of creators in Dhaka who are building their personal brands with UNIKA AI.</p>
          <button onClick={() => setView('designer')} className="bg-black text-white px-12 py-6 rounded-full font-black text-xl hover:scale-105 transition-all shadow-2xl">Enter the Design Studio</button>
        </div>
      </section>
    </div>
  );

  const renderShop = () => (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-20">
        <h2 className="text-6xl font-black tracking-tighter mb-4">The Archive</h2>
        <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">Collection 2024 / Genesis</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
        {products.map(product => (
          <div key={product.id} className="bg-white p-6 rounded-[3rem] border border-gray-100 hover:shadow-3xl transition-all duration-500 group flex flex-col h-full">
            <div className="relative aspect-[4/5] mb-8 rounded-[2.5rem] overflow-hidden cursor-pointer" onClick={() => openProductDetail(product)}>
              <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase">Available</div>
            </div>
            <div className="flex-grow">
              <span className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">{product.category}</span>
              <h3 className="text-2xl font-black mb-4 group-hover:translate-x-2 transition-transform">{product.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{product.description}</p>
            </div>
            <div className="mt-10 flex justify-between items-center pt-8 border-t border-gray-50">
              <span className="text-2xl font-black">{formatPrice(product.price)}</span>
              <button onClick={() => openProductDetail(product)} className="bg-black text-white p-4 rounded-2xl hover:scale-110 active:scale-95 transition-all"><Plus size={20}/></button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const renderCart = () => (
    <section className="py-24 px-6 max-w-5xl mx-auto min-h-[60vh]">
      <div className="flex justify-between items-end mb-16">
        <h2 className="text-5xl font-black tracking-tighter">Your Bag</h2>
        <span className="text-gray-400 font-bold">{cart.length} items</span>
      </div>
      {cart.length === 0 ? (
        <div className="text-center py-32 bg-gray-50 rounded-[4rem] border-2 border-dashed border-gray-200">
          <ShoppingBag size={80} className="mx-auto text-gray-200 mb-8" />
          <h3 className="text-3xl font-bold mb-4">Your bag is empty</h3>
          <button onClick={() => setView('shop')} className="bg-black text-white px-10 py-4 rounded-full font-bold hover:scale-105 transition-all">Start Shopping</button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-8">
            {cart.map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[3rem] border border-gray-100 flex items-center space-x-8 shadow-sm">
                <img src={item.image} className="w-32 h-32 object-cover rounded-[2rem]" alt={item.name} />
                <div className="flex-grow">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.category} • Size {item.selectedSize}</span>
                  <h3 className="text-xl font-black mt-1">{item.name}</h3>
                  <div className="flex items-center space-x-6 mt-6">
                    <div className="flex items-center space-x-4 bg-gray-50 px-4 py-2 rounded-xl">
                      <button onClick={() => updateQuantity(item.id, item.selectedSize, -1)} className="hover:text-red-500 transition-colors"><Minus size={16} /></button>
                      <span className="font-black text-lg">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.selectedSize, 1)} className="hover:text-green-500 transition-colors"><Plus size={16} /></button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-8">
                  <button onClick={() => removeFromCart(item.id, item.selectedSize)} className="text-gray-300 hover:text-red-500"><Trash2 size={24}/></button>
                  <p className="text-xl font-black">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-black text-white p-12 rounded-[4rem] h-fit sticky top-32">
            <h3 className="text-3xl font-black mb-10">Total</h3>
            <div className="space-y-6 mb-12">
              <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-gray-400"><span>Delivery</span><span>{formatPrice(shippingFee)}</span></div>
              <div className="pt-8 border-t border-white/10 flex justify-between text-3xl font-black"><span>Total</span><span>{formatPrice(grandTotal)}</span></div>
            </div>
            <button onClick={() => setView('checkout')} className="w-full bg-white text-black py-6 rounded-3xl font-black text-lg hover:scale-[1.02] transition-all">Proceed to Checkout</button>
          </div>
        </div>
      )}
    </section>
  );

  return (
    <Layout currentView={view} setView={setView} cartCount={cartCount}>
      {view === 'home' && renderHome()}
      {view === 'shop' && renderShop()}
      {view === 'designer' && <AIDesigner addToCart={(p) => addToCart(p)} />}
      {view === 'cart' && renderCart()}
      {view === 'product-detail' && selectedProduct && <ProductDetail product={selectedProduct} onBack={() => setView('shop')} onAddToCart={addToCart} formatPrice={formatPrice} />}
      {view === 'tracking' && <TrackingView />}
      {view === 'checkout' && <CheckoutForm subtotal={subtotal} shippingFee={shippingFee} grandTotal={grandTotal} cartItems={cart} onBack={() => setView('cart')} onSuccess={() => { setCart([]); setView('success'); }} formatPrice={formatPrice} />}
      {view === 'success' && <SuccessPage onContinue={() => setView('shop')} />}
      <StylistChat />
    </Layout>
  );
};

export default App;
