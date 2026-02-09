
import React from 'react';
import { ShoppingBag, CheckCircle2, ArrowRight } from 'lucide-react';

interface SuccessPageProps {
  onContinue: () => void;
}

const SuccessPage: React.FC<SuccessPageProps> = ({ onContinue }) => {
  return (
    <div className="max-w-xl mx-auto px-4 py-32 text-center">
      <div className="mb-8 relative inline-block">
        <div className="absolute inset-0 bg-green-500 blur-2xl opacity-20 animate-pulse"></div>
        <div className="relative bg-white p-6 rounded-[2.5rem] shadow-xl">
          <CheckCircle2 size={64} className="text-green-500" />
        </div>
      </div>
      
      <h2 className="text-5xl font-black mb-6 tracking-tighter">Order Confirmed!</h2>
      <p className="text-gray-500 text-lg mb-12">
        Thank you for choosing UNIKA TSHIRTS. Your unique designs are now in production and will reach your doorstep soon.
      </p>

      <div className="space-y-4">
        <button 
          onClick={onContinue}
          className="w-full bg-black text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center space-x-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-black/20"
        >
          <span>Continue Shopping</span>
          <ArrowRight size={24} />
        </button>
        <p className="text-xs text-gray-400 font-black uppercase tracking-[0.2em]">Check your email for order details</p>
      </div>
    </div>
  );
};

export default SuccessPage;
