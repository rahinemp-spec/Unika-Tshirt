
import React, { useState } from 'react';
import { ChevronLeft, Send, CheckCircle2, MapPin, User, Phone, Mail, Loader2 } from 'lucide-react';

interface CheckoutFormProps {
  subtotal: number;
  shippingFee: number;
  grandTotal: number;
  cartItems: any[];
  onBack: () => void;
  onSuccess: () => void;
  formatPrice: (amount: number) => string;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ 
  subtotal, 
  shippingFee, 
  grandTotal, 
  cartItems, 
  onBack, 
  onSuccess,
  formatPrice 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    jela: '',
    thana: '',
    road: '',
    address: ''
  });

  // PROVIDED GOOGLE APPS SCRIPT WEB APP URL
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz6t7ea5QCdTITMFucAq-baDdBVUgUxJe-vJRvcQLtjKySHF_S8qUvuGpD0zfNKlG9l/exec'; 

  const districts = [
    "Dhaka", "Chittagong", "Gazipur", "Narayanganj", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Cumilla"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const orderData = {
      ...formData,
      items: cartItems.map(item => `${item.name} (${item.selectedSize}) x${item.quantity}`).join(', '),
      subtotal,
      shipping: shippingFee,
      total: grandTotal,
      date: new Date().toLocaleString()
    };

    try {
      if (GOOGLE_SCRIPT_URL) {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors', 
          cache: 'no-cache',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });
        onSuccess();
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000));
        onSuccess();
      }
    } catch (error) {
      console.error('Submission failed', error);
      alert('Order submission failed. Please check your internet or try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button 
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-500 hover:text-black transition-colors mb-8 group"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold uppercase tracking-widest text-xs text-black">Back to Cart</span>
      </button>

      <div className="grid md:grid-cols-5 gap-12">
        <div className="md:col-span-3">
          <h2 className="text-4xl font-black mb-8 tracking-tighter">Delivery Details</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    required
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    required
                    name="jela"
                    value={formData.jela}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all appearance-none"
                  >
                    <option value="">Select Jela (District)</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="relative">
                  <input
                    required
                    name="thana"
                    value={formData.thana}
                    onChange={handleChange}
                    placeholder="Thana / Upazila"
                    className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all"
                  />
                </div>
              </div>

              <input
                required
                name="road"
                value={formData.road}
                onChange={handleChange}
                placeholder="Road Name / House No"
                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all"
              />

              <textarea
                required
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Full Location / Detailed Address"
                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all h-32 resize-none"
              />
            </div>

            <button
              disabled={isSubmitting}
              type="submit"
              className="w-full bg-black text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center space-x-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-black/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="animate-spin" size={24} />
                  <span>Submitting Order...</span>
                </div>
              ) : (
                <>
                  <Send size={24} />
                  <span>Confirm Order</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl sticky top-28">
            <h3 className="text-xl font-black mb-6">Order Summary</h3>
            <div className="space-y-4 mb-8">
              {cartItems.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-500">{item.name} x{item.quantity}</span>
                  <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-3 pt-6 border-t border-gray-50">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping</span>
                <span>{formatPrice(shippingFee)}</span>
              </div>
              <div className="flex justify-between text-2xl font-black pt-4">
                <span>Total</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center space-x-3 text-green-600 mb-2">
                <CheckCircle2 size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Cash on Delivery</span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                Pay safely when you receive your t-shirts at your doorstep. We will also send a confirmation email to <strong>{formData.email || 'your email'}</strong> via our automated system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
