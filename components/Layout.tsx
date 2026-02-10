
import React from 'react';
import { ShoppingCart, Layout as LayoutIcon, Brush, Home, Menu, X, MapPin, Shield, Instagram, Twitter, Facebook } from 'lucide-react';
import { View } from '../types';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  setView: (view: View) => void;
  cartCount: number;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, cartCount }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const NavItem = ({ view, icon: Icon, label }: { view: View, icon: any, label: string }) => (
    <button
      onClick={() => { setView(view); setIsMenuOpen(false); window.scrollTo(0,0); }}
      className={`relative px-4 py-2 text-xs font-black uppercase tracking-[0.2em] transition-all ${
        currentView === view ? 'text-black' : 'text-gray-400 hover:text-black'
      }`}
    >
      {label}
      {currentView === view && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full"></span>}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Editorial Announcement Bar */}
      <div className="bg-black text-white py-2 text-[10px] font-black uppercase tracking-[0.4em] text-center overflow-hidden">
        <div className="animate-pulse">Next Day Delivery inside Dhaka • New Generation AI Designs Live</div>
      </div>

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-50 h-24">
        <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
          {/* Mobile Menu Trigger */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Navigation Links - Left */}
          <nav className="hidden md:flex items-center space-x-4 flex-1">
            <NavItem view="home" icon={Home} label="Home" />
            <NavItem view="shop" icon={LayoutIcon} label="Catalog" />
            <NavItem view="designer" icon={Brush} label="Design Studio" />
          </nav>

          {/* Logo - Center */}
          <div className="flex justify-center items-center flex-1 cursor-pointer" onClick={() => { setView('home'); window.scrollTo(0,0); }}>
            <Logo className="w-28" />
          </div>

          {/* Navigation Links - Right */}
          <div className="flex items-center justify-end space-x-6 flex-1">
            <button onClick={() => setView('tracking')} className="hidden md:flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
              <MapPin size={14} />
              <span>Track Order</span>
            </button>
            <button 
              onClick={() => setView('cart')}
              className="relative p-2 text-black hover:scale-110 transition-transform"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 top-24 bg-white z-50 p-8 space-y-8 animate-in slide-in-from-top duration-300">
            <div className="flex flex-col space-y-6">
              <button onClick={() => { setView('home'); setIsMenuOpen(false); }} className="text-4xl font-black tracking-tighter text-left">The House</button>
              <button onClick={() => { setView('shop'); setIsMenuOpen(false); }} className="text-4xl font-black tracking-tighter text-left">Catalog</button>
              <button onClick={() => { setView('designer'); setIsMenuOpen(false); }} className="text-4xl font-black tracking-tighter text-left">Design Studio</button>
              <button onClick={() => { setView('tracking'); setIsMenuOpen(false); }} className="text-4xl font-black tracking-tighter text-left">Tracking</button>
            </div>
            <div className="pt-12 border-t border-gray-100 flex space-x-6">
              <Instagram size={24} /> <Twitter size={24} /> <Facebook size={24} />
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-100 py-32 mt-32">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-20">
          <div className="col-span-2">
            <Logo className="w-40 mb-10" />
            <p className="text-gray-400 max-w-sm mb-12 leading-relaxed">
              We are not a fast-fashion brand. We are a digital-first apparel house redefining how fashion is conceived and consumed through the lens of machine intelligence.
            </p>
            <div className="flex space-x-6 text-gray-300">
              <Instagram className="hover:text-black transition-colors cursor-pointer" />
              <Twitter className="hover:text-black transition-colors cursor-pointer" />
              <Facebook className="hover:text-black transition-colors cursor-pointer" />
            </div>
          </div>
          <div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.4em] mb-10 text-gray-300">The Catalog</h4>
            <ul className="space-y-4 font-bold text-sm">
              <li><button onClick={() => setView('shop')} className="hover:translate-x-2 transition-transform block">Season One</button></li>
              <li><button onClick={() => setView('shop')} className="hover:translate-x-2 transition-transform block">Modern Prints</button></li>
              <li><button onClick={() => setView('shop')} className="hover:translate-x-2 transition-transform block">Abstract Concept</button></li>
              <li><button onClick={() => setView('designer')} className="hover:translate-x-2 transition-transform block text-red-500">Custom Studio</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.4em] mb-10 text-gray-300">Support</h4>
            <ul className="space-y-4 font-bold text-sm">
              <li><button onClick={() => setView('tracking')} className="hover:translate-x-2 transition-transform block">Track My Order</button></li>
              <li><a href="#" className="hover:translate-x-2 transition-transform block">Shipping Policy</a></li>
              <li><a href="#" className="hover:translate-x-2 transition-transform block">Size Guide</a></li>
              <li>
                <button onClick={() => setView('admin')} className="flex items-center space-x-2 text-gray-200 hover:text-black transition-colors">
                  <Shield size={14} />
                  <span>Admin Access</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-32 pt-12 border-t border-gray-50 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
            © {new Date().getFullYear()} UNIKA T-SHIRTS DHAKA. All AI Models Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
