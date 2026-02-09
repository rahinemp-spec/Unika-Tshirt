
import React, { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, MapPin, Loader2, AlertCircle } from 'lucide-react';

const TrackingView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // PROVIDED GOOGLE APPS SCRIPT WEB APP URL
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz6t7ea5QCdTITMFucAq-baDdBVUgUxJe-vJRvcQLtjKySHF_S8qUvuGpD0zfNKlG9l/exec';

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setIsSearching(true);
    setError(null);

    try {
      if (GOOGLE_SCRIPT_URL) {
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?track=${encodeURIComponent(query)}`);
        const contentType = response.headers.get("content-type");
        
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const data = await response.json();
          if (data.error) {
            setError('No order found for this email or phone number.');
            setOrder(null);
          } else {
            const statusMap: Record<string, string> = {
              'Order Placed': 'placed',
              'Processing': 'processing',
              'In Transit': 'shipped',
              'Delivered': 'delivered'
            };
            setOrder({
              id: data.id || 'UNIKA-PENDING',
              status: statusMap[data.status] || 'placed', 
              date: new Date(data.date).toLocaleDateString(),
              items: data.items,
              total: data.total,
              location: 'Bangladesh'
            });
          }
        } else {
          setError('Invalid tracking response from server.');
        }
      } else {
        setTimeout(() => {
          if (query.length > 5) {
            setOrder({
              id: 'UNIKA-MOCK',
              status: 'processing', 
              date: new Date().toLocaleDateString(),
              items: 'Vintage Sunset Dream (L) x1',
              total: '৳1,010',
              location: 'Dhaka, Bangladesh'
            });
          } else {
            setError('No order found for this email or phone number.');
          }
        }, 1000);
      }
    } catch (err) {
      console.error('Tracking failed', err);
      setError('Connection error. Could not retrieve tracking info.');
    } finally {
      setIsSearching(false);
    }
  };

  const steps = [
    { key: 'placed', label: 'Order Placed', icon: Clock, desc: 'We have received your order' },
    { key: 'processing', label: 'Processing', icon: Package, desc: 'Your design is being printed' },
    { key: 'shipped', label: 'In Transit', icon: Truck, desc: 'Handed over to delivery partner' },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle, desc: 'Arrived at your doorstep' }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === order?.status);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-black mb-4 tracking-tighter">Track Your Style</h2>
        <p className="text-gray-500">Enter your email or phone number to see where your order is.</p>
      </div>

      <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-16">
        <div className="relative group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Email or Phone Number..."
            className="w-full pl-6 pr-32 py-5 bg-white border-2 border-gray-100 rounded-2xl focus:border-black outline-none transition-all shadow-xl shadow-gray-200/50"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-2 top-2 bottom-2 bg-black text-white px-8 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
            {isSearching ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
            <span>Track</span>
          </button>
        </div>
        {error && (
          <div className="mt-4 flex items-center space-x-2 text-red-500 bg-red-50 p-4 rounded-xl text-sm font-medium animate-in fade-in zoom-in duration-300">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
      </form>

      {order && (
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-8 md:p-12 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50/50">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Order ID</span>
              <h3 className="text-2xl font-black">{order.id}</h3>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Estimated Delivery</span>
              <p className="font-bold">2-3 Business Days</p>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center space-y-8 md:space-y-0">
              <div className="absolute left-[15px] md:left-0 md:top-4 top-0 bottom-0 md:bottom-auto md:w-full w-[2px] bg-gray-100 -z-10 h-full md:h-[2px]"></div>
              
              {steps.map((step, idx) => {
                const isActive = idx <= currentStepIndex;
                const Icon = step.icon;
                return (
                  <div key={step.key} className="flex md:flex-col items-center md:text-center relative z-10 w-full md:w-1/4 group">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isActive ? 'bg-black text-white scale-110 shadow-lg' : 'bg-white border-2 border-gray-100 text-gray-300'
                    }`}>
                      <Icon size={14} />
                    </div>
                    <div className="ml-4 md:ml-0 md:mt-4">
                      <h4 className={`text-sm font-black uppercase tracking-tight ${isActive ? 'text-black' : 'text-gray-300'}`}>
                        {step.label}
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-1 max-w-[120px]">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-8 md:p-12 bg-gray-50/30 border-t border-gray-50 grid md:grid-cols-2 gap-8">
             <div className="flex items-start space-x-4">
               <div className="p-3 bg-white rounded-xl shadow-sm text-gray-400">
                 <MapPin size={20} />
               </div>
               <div>
                 <h4 className="font-bold text-sm">Shipping To</h4>
                 <p className="text-xs text-gray-500 mt-1">Order Details: {order.items}</p>
                 <p className="text-xs text-gray-500">{order.location}</p>
               </div>
             </div>
             <div className="text-right">
               <h4 className="font-bold text-sm">Order Value</h4>
               <p className="text-2xl font-black mt-1">{order.total}</p>
               <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Cash on Delivery</span>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingView;
