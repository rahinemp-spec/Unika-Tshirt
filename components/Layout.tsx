
import React from 'react';
import { ShoppingCart, Layout as LayoutIcon, Brush, Home, Menu, X, MapPin, Shield } from 'lucide-react';
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
      onClick={() => { setView(view); setIsMenuOpen(false); }}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
        currentView === view 
          ? 'bg-black text-white shadow-lg' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon size={20} />
      <span className="font-semibold">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center cursor-pointer transform hover:scale-105 transition-transform" onClick={() => setView('home')}>
              <Logo className="w-32" />
            </div>

            <nav className="hidden md:flex items-center space-x-4">
              <NavItem view="home" icon={Home} label="Home" />
              <NavItem view="shop" icon={LayoutIcon} label="Shop" />
              <NavItem view="designer" icon={Brush} label="AI Designer" />
              <NavItem view="tracking" icon={MapPin} label="Track" />
              <button 
                onClick={() => setView('cart')}
                className="relative p-2 text-gray-600 hover:text-black transition-colors"
              >
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>
            </nav>

            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 p-4 space-y-4 shadow-xl">
            <NavItem view="home" icon={Home} label="Home" />
            <NavItem view="shop" icon={LayoutIcon} label="Shop" />
            <NavItem view="designer" icon={Brush} label="AI Designer" />
            <NavItem view="tracking" icon={MapPin} label="Track Order" />
            <NavItem view="cart" icon={ShoppingCart} label={`Bag (${cartCount})`} />
          </div>
        )}
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
          <div className="grid md:grid-cols-4 gap-12 items-start">
            <div className="col-span-2">
              <Logo light className="w-40 mb-8 mx-auto md:mx-0" />
              <p className="text-gray-400 max-w-sm mx-auto md:mx-0">
                Redefining apparel through the lens of artificial intelligence. Wear art that was born from silicon and soul.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-white/40">Quick Links</h4>
              <ul className="space-y-4 text-gray-400 text-sm font-medium">
                <li><button className="hover:text-white transition-colors" onClick={() => setView('shop')}>Browse All</button></li>
                <li><button className="hover:text-white transition-colors" onClick={() => setView('designer')}>AI Design Tool</button></li>
                <li><button className="hover:text-white transition-colors" onClick={() => setView('tracking')}>Track Order</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-white/40">Authorized</h4>
              <ul className="space-y-4 text-gray-400 text-sm font-medium">
                <li>
                  <button onClick={() => setView('admin')} className="flex items-center space-x-2 text-gray-600 hover:text-white transition-colors">
                    <Shield size={14} />
                    <span>Staff Portal</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-white/10 text-center text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} UNIKA T-SHIRTS. Crafted in Dhaka, Bangladesh.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
