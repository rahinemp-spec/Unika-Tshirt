
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { Product } from '../types';

interface AutoCarouselProps {
  products: Product[];
  onViewProduct: (product: Product) => void;
  formatPrice: (amount: number) => string;
}

const AutoCarousel: React.FC<AutoCarouselProps> = ({ products, onViewProduct, formatPrice }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const showcaseProducts = products.slice(0, 5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % showcaseProducts.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [showcaseProducts.length]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % showcaseProducts.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + showcaseProducts.length) % showcaseProducts.length);

  return (
    <div className="relative w-full h-full min-h-[400px] bg-white overflow-hidden rounded-[2.5rem] shadow-2xl border border-gray-100 group">
      {showcaseProducts.map((product, index) => (
        <div
          key={product.id}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out cursor-pointer ${
            index === currentIndex ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 z-0 pointer-events-none'
          }`}
          onClick={() => onViewProduct(product)}
        >
          {/* Product Image */}
          <div className="absolute inset-0">
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-linear ${
                index === currentIndex ? 'scale-110' : 'scale-100'
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          </div>

          {/* Product Info Overlay */}
          <div className="absolute bottom-0 left-0 w-full p-8 md:p-10 text-white">
            <div className="flex items-center space-x-2 text-white/60 text-[10px] font-black tracking-widest uppercase mb-2">
              <span className="w-6 h-[1px] bg-white/30"></span>
              <span>New Drop {index + 1}</span>
            </div>
            <h3 className="text-3xl font-black mb-2 tracking-tight">{product.name}</h3>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold">{formatPrice(product.price)}</span>
              <div
                className="bg-white text-black p-3 rounded-xl hover:scale-110 active:scale-95 transition-all shadow-xl"
              >
                <ShoppingBag size={20} />
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <div className="absolute top-1/2 -translate-y-1/2 w-full px-4 flex justify-between z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={(e) => { e.stopPropagation(); prevSlide(); }} className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white hover:text-black transition-all">
          <ChevronLeft size={20} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); nextSlide(); }} className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white hover:text-black transition-all">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="absolute top-6 left-6 z-20 flex space-x-1.5">
        {showcaseProducts.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-500 ${
              i === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-white/10 w-full z-20">
        <div 
          key={currentIndex}
          className="h-full bg-white/40 animate-[progress_10s_linear]"
          style={{ width: '100%' }}
        />
      </div>

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default AutoCarousel;
