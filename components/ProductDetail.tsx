
import React, { useState } from 'react';
import { Product, CartItem } from '../types';
import { ChevronLeft, ShoppingBag, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, size: string) => void;
  formatPrice: (amount: number) => string;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack, onAddToCart, formatPrice }) => {
  const [selectedSize, setSelectedSize] = useState('L');
  const sizes = ['M', 'L', 'XL', '2XL', '3XL'];

  const sizeChart = [
    { size: 'M', chest: '39', length: '27.5', sleeve: '8.5' },
    { size: 'L', chest: '40.5', length: '28', sleeve: '8.75' },
    { size: 'XL', chest: '43', length: '29', sleeve: '9' },
    { size: '2XL', chest: '45', length: '30', sleeve: '9.25' },
    { size: '3XL', chest: '47', length: '31', sleeve: '9.5' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button 
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-500 hover:text-black transition-colors mb-8 group"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold uppercase tracking-widest text-xs">Back to Collection</span>
      </button>

      <div className="grid md:grid-cols-2 gap-16">
        {/* Product Image */}
        <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <span className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-4">{product.category} Collection</span>
          <h1 className="text-5xl font-black mb-6 tracking-tighter">{product.name}</h1>
          <p className="text-3xl font-black mb-8">{formatPrice(product.price)}</p>
          
          <div className="mb-10">
            <h3 className="text-sm font-black uppercase tracking-widest mb-4">Select Size</h3>
            <div className="flex flex-wrap gap-3">
              {sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-16 h-14 rounded-xl font-bold transition-all border-2 flex items-center justify-center ${
                    selectedSize === size 
                      ? 'bg-black border-black text-white shadow-lg scale-105' 
                      : 'border-gray-100 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => onAddToCart(product, selectedSize)}
            className="w-full bg-black text-white py-6 rounded-2xl font-black text-lg flex items-center justify-center space-x-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-black/20 mb-12"
          >
            <ShoppingBag size={24} />
            <span>Add to Bag - {selectedSize}</span>
          </button>

          <div className="border-t border-gray-100 pt-10">
            <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-gray-400">Description & Details</h3>
            <p className="text-gray-500 leading-relaxed mb-8">
              {product.description} Crafted from high-quality premium cotton with precision stitching. 
              Our designs are AI-optimized for visual impact and printed using eco-friendly, high-density ink technology.
            </p>

            {/* Size Chart Table */}
            <div className="bg-gray-50 rounded-3xl p-8 mb-10">
              <h4 className="font-black text-sm mb-6 flex items-center space-x-2">
                <span>Size Measurement Chart</span>
                <span className="text-[10px] text-gray-400 font-normal">(Inches)</span>
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400">
                      <th className="pb-4 font-black uppercase tracking-widest text-[10px]">Size</th>
                      <th className="pb-4 font-black uppercase tracking-widest text-[10px]">Chest</th>
                      <th className="pb-4 font-black uppercase tracking-widest text-[10px]">Length</th>
                      <th className="pb-4 font-black uppercase tracking-widest text-[10px]">Sleeve</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    {sizeChart.map((row) => (
                      <tr key={row.size} className="border-b border-gray-100 last:border-0">
                        <td className="py-4 font-bold text-black">{row.size}</td>
                        <td className="py-4">{row.chest}</td>
                        <td className="py-4">{row.length}</td>
                        <td className="py-4">{row.sleeve}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-2xl">
                <ShieldCheck size={20} className="mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Premium Quality</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-2xl">
                <Truck size={20} className="mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Dhaka ৳60 | Outside ৳120</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-2xl">
                <RotateCcw size={20} className="mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
