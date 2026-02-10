
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
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
import { PRODUCTS as INITIAL_PRODUCTS } from './constants';
import { Product, CartItem, View } from './types';
import { ShoppingBag, ChevronRight, Plus, Minus, ChevronLeft, ShieldCheck, Zap, Truck, Sparkles, Activity, MapPin, Trash2, Loader2 } from 'lucide-react';

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

  // Fetch live products from Google Sheets and merge with defaults
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

        // MERGE LOGIC: Keep initial products and overwrite/append with cloud products
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
      console.error("Failed to sync with cloud inventory:", error);
      // On error, we still have INITIAL_PRODUCTS from state init
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
    alert(`${product.name} (Size: ${size}) added to bag!`);
  };

  const updateQuantity = (id: string, size: string | undefined, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && item.selectedSize === size) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
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
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (view === 'admin') {
    if (!isAdminAuthenticated) {
      return <AdminLogin onLogin={() => setIsAdminAuthenticated(true)} />;
    }
    return <AdminPanel onLogout={() => { setIsAdminAuthenticated(false); setView('home'); }} onInventoryUpdate={fetchLiveProducts} />;
  }

  const renderHome = () => (
    <div className="bg-white">
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-white py-12 md:py-0">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-gray-50 rounded-full blur-[120px] opacity-40 animate-pulse"></div>
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full opacity-[0.02] select-none pointer-events-none text-left pl-10">
            <span className="text-[30vw] font-black text-black leading-none block">UNIKA</span>
          </div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7">
            <div className="inline-flex items-center space-x-3 px-4 py-1.5 bg-gray-100 rounded-full text-xs font-bold tracking-widest uppercase mb-8 text-gray-500">
              <Activity size={14} className="text-green-500 animate-pulse" />
              <span>Dhaka HQ • Live Design Studio</span>
            </div>
            
            <h1 className="text-7xl lg:text-[9rem] font-black mb-8 tracking-tighter leading-[0.85]">
              WEAR THE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-black via-gray-700 to-gray-400">FUTURE.</span>
            </h1>
            
            <p className="text-xl text-gray-500 mb-12 max-w-xl font-medium leading-relaxed">
              Experience the convergence of high-street fashion and Generative AI. 
              Exclusive garments crafted with silicon-born art.
            </p>
            
            <div className="flex flex-wrap gap-6">
              <button 
                onClick={() => setView('shop')}
                className="group px-12 py-5 bg-black text-white rounded-2xl font-bold flex items-center space-x-3 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/30"
              >
                <span>Browse Catalog</span>
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => setView('designer')}
                className="px-12 py-5 bg-white text-black border-2 border-black rounded-2xl font-bold flex items-center space-x-3 hover:bg-black hover:text-white transition-all shadow-lg"
              >
                <span>Design with AI</span>
                <Sparkles size={18} />
              </button>
            </div>
          </div>

          <div className="md:col-span-5 relative">
            <div className="absolute -top-6 -left-6 z-30 bg-black text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl">
              Seasonal Showcase
            </div>
            <div className="aspect-[4/5] w-full max-w-[450px] mx-auto">
              <AutoCarousel 
                products={products} 
                onViewProduct={openProductDetail} 
                formatPrice={formatPrice} 
              />
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 border-[20px] border-gray-100 rounded-full -z-10"></div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white overflow-hidden border-t border-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <div className="flex items-center space-x-2 text-red-500 mb-2">
                <Zap size={16} fill="currentColor" />
                <span className="text-sm font-black uppercase tracking-widest">Hot Right Now</span>
              </div>
              <h2 className="text-4xl font-black">Most Wanted Designs</h2>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => scrollSlider('left')} className="p-3 border border-gray-200 rounded-full hover:bg-black hover:text-white transition-all active:scale-90"><ChevronLeft size={24} /></button>
              <button onClick={() => scrollSlider('right')} className="p-3 border border-gray-200 rounded-full hover:bg-black hover:text-white transition-all active:scale-90"><ChevronRight size={24} /></button>
            </div>
          </div>

          <div ref={sliderRef} className="flex space-x-8 overflow-x-auto scrollbar-hide pb-8 snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {isLoadingProducts && products.length === INITIAL_PRODUCTS.length && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-20 backdrop-blur-[2px]">
                 <div className="flex flex-col items-center space-y-2">
                    <Loader2 className="animate-spin text-black" size={32} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Syncing Cloud Designs...</p>
                 </div>
              </div>
            )}
            {products.map(product => (
              <div key={product.id} className="min-w-[300px] md:min-w-[350px] snap-start group cursor-pointer" onClick={() => openProductDetail(product)}>
                <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-6 shadow-md group-hover:shadow-2xl transition-all duration-500">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">Trend</div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                    <div className="w-full bg-white text-black py-4 rounded-2xl font-black flex items-center justify-center space-x-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                      <Plus size={20} />
                      <span>View Details</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-1">{product.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">{product.category}</span>
                  <span className="text-lg font-black">{formatPrice(product.price)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-12">
          <div className="flex items-start space-x-6">
            <div className="bg-black text-white p-4 rounded-2xl"><ShieldCheck size={32} /></div>
            <div>
              <h4 className="text-xl font-bold mb-2">Quality First</h4>
              <p className="text-gray-500 text-sm">We use 100% organic cotton and high-density prints that never fade.</p>
            </div>
          </div>
          <div className="flex items-start space-x-6">
            <div className="bg-black text-white p-4 rounded-2xl"><Truck size={32} /></div>
            <div>
              <h4 className="text-xl font-bold mb-2">Standard Delivery</h4>
              <p className="text-gray-500 text-sm">Dhaka: ৳60 | Outside: ৳120. Fast shipping within 24-48 hours.</p>
            </div>
          </div>
          <div className="flex items-start space-x-6">
            <div className="bg-black text-white p-4 rounded-2xl"><Sparkles size={32} /></div>
            <div>
              <h4 className="text-xl font-bold mb-2">AI Generated</h4>
              <p className="text-gray-500 text-sm">Every design is a unique iteration optimized by our proprietary AI.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  const renderShop = () => (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-black mb-4">The Collection</h2>
        <p className="text-gray-500">Carefully curated, AI-perfected designs for the modern wardrobe.</p>
        {isLoadingProducts && <div className="mt-4 text-xs font-bold uppercase text-gray-400 flex items-center justify-center space-x-2"><Loader2 size={12} className="animate-spin"/> <span>Updating Collection...</span></div>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {products.map(product => (
          <div key={product.id} className="bg-white p-5 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col h-full group">
            <div className="relative aspect-[4/5] mb-6 rounded-[2rem] overflow-hidden cursor-pointer" onClick={() => openProductDetail(product)}>
              <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute bottom-6 right-6 bg-black text-white p-4 rounded-2xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-xl hover:scale-110 active:scale-95"><Plus size={28} /></div>
            </div>
            <div className="flex-grow px-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">{product.category}</span>
              <h3 className="text-xl font-bold mb-2 group-hover:text-gray-600 transition-colors">{product.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">{product.description}</p>
            </div>
            <div className="mt-4 px-2 flex justify-between items-center pt-6 border-t border-gray-50">
              <span className="text-2xl font-black">{formatPrice(product.price)}</span>
              <button onClick={() => openProductDetail(product)} className="text-xs font-black uppercase tracking-widest text-black border-b-2 border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition-all">View Details</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const renderCart = () => (
    <section className="py-12 px-4 max-w-5xl mx-auto min-h-[60vh]">
      <h2 className="text-4xl font-black mb-12">Your Shopping Bag</h2>
      
      {cart.length === 0 ? (
        <div className="text-center py-32 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
          <ShoppingBag size={80} className="mx-auto text-gray-200 mb-8" />
          <h3 className="text-3xl font-bold mb-4">Your bag is empty</h3>
          <p className="text-gray-500 mb-10 text-lg">You haven't added anything to your collection yet.</p>
          <button onClick={() => setView('shop')} className="bg-black text-white px-12 py-5 rounded-full font-bold hover:scale-105 transition-all shadow-xl shadow-black/20">Start Shopping</button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item, idx) => (
              <div key={`${item.id}-${item.selectedSize}-${idx}`} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex items-center space-x-8 shadow-sm hover:shadow-md transition-all">
                <img src={item.image} alt={item.name} className="w-32 h-32 object-cover rounded-[1.5rem]" />
                <div className="flex-grow">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{item.category}</span>
                    <span className="text-[10px] font-black uppercase text-white bg-black px-2 py-0.5 rounded">Size: {item.selectedSize}</span>
                  </div>
                  <h3 className="text-xl font-bold mt-1">{item.name}</h3>
                  <p className="text-lg font-bold text-gray-900 mt-2">{formatPrice(item.price)}</p>
                  <div className="flex items-center space-x-4 mt-6">
                    <div className="flex items-center space-x-3 bg-gray-100 p-1.5 rounded-xl">
                      <button onClick={() => updateQuantity(item.id, item.selectedSize, -1)} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all"><Minus size={16} /></button>
                      <span className="font-bold w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.selectedSize, 1)} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all"><Plus size={16} /></button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between self-stretch">
                  <button onClick={() => removeFromCart(item.id, item.selectedSize)} className="text-gray-300 hover:text-red-500 transition-colors p-2"><Trash2 size={24} /></button>
                  <p className="font-black text-xl">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-black text-white p-10 rounded-[3rem] h-fit sticky top-28 shadow-2xl">
            <h3 className="text-3xl font-black mb-8">Summary</h3>
            <div className="mb-8">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 block">Delivery Location</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl">
                <button onClick={() => setShippingLocation('dhaka')} className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${shippingLocation === 'dhaka' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}><MapPin size={12} /><span>Dhaka</span></button>
                <button onClick={() => setShippingLocation('outside')} className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${shippingLocation === 'outside' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}><MapPin size={12} /><span>Outside</span></button>
              </div>
            </div>
            <div className="space-y-6 mb-10">
              <div className="flex justify-between text-gray-400 text-sm"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-gray-400 text-sm"><span>Shipping ({shippingLocation === 'dhaka' ? 'Inside' : 'Outside'} Dhaka)</span><span>{formatPrice(shippingFee)}</span></div>
              <div className="pt-6 border-t border-white/10 flex justify-between text-2xl font-black"><span>Total</span><span>{formatPrice(grandTotal)}</span></div>
            </div>
            <button className="w-full bg-white text-black py-5 rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl" onClick={() => setView('checkout')}>Checkout Now</button>
          </div>
        </div>
      )}
    </section>
  );

  return (
    <Layout currentView={view} setView={setView} cartCount={cartCount}>
      {view === 'home' && renderHome()}
      {view === 'shop' && renderShop()}
      {view === 'designer' && <AIDesigner addToCart={(p) => addToCart(p, 'L')} />}
      {view === 'cart' && renderCart()}
      {view === 'product-detail' && selectedProduct && <ProductDetail product={selectedProduct} onBack={() => setView('shop')} onAddToCart={addToCart} formatPrice={formatPrice} />}
      {view === 'tracking' && <TrackingView />}
      {view === 'checkout' && <CheckoutForm subtotal={subtotal} shippingFee={shippingFee} grandTotal={grandTotal} cartItems={cart} onBack={() => setView('cart')} onSuccess={() => { setCart([]); setView('success'); }} formatPrice={formatPrice} />}
      {view === 'success' && <SuccessPage onContinue={() => setView('shop')} />}
      <StylistChat />
      <SpeedInsights />
    </Layout>
  );
};

export default App;
