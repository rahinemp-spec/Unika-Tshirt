
import React, { useState } from 'react';
import { Wand2, Loader2, Sparkles, Plus, Brush } from 'lucide-react';
import { generateTShirtDesign } from '../services/geminiService';
import { Product } from '../types';

interface AIDesignerProps {
  addToCart: (product: Product) => void;
}

const AIDesigner: React.FC<AIDesignerProps> = ({ addToCart }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    const result = await generateTShirtDesign(prompt);
    setGeneratedImage(result);
    setIsGenerating(false);
  };

  const handleAddToCart = () => {
    if (generatedImage) {
      const customProduct: Product = {
        id: `custom-${Date.now()}`,
        name: `Custom: ${prompt.substring(0, 20)}...`,
        price: 1850,
        description: `AI-generated custom design based on: "${prompt}"`,
        image: generatedImage,
        category: 'Custom'
      };
      addToCart(customProduct);
      alert('Custom design added to cart!');
    }
  };

  return (
    <section className="py-12 px-4 max-w-5xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="grid md:grid-cols-2">
          <div className="p-8 md:p-12 bg-gray-50 flex flex-col justify-center">
            <div className="inline-flex items-center px-3 py-1 bg-black text-white rounded-full text-xs font-bold mb-4 animate-pulse">
              <Sparkles size={12} className="mr-2" /> NEW AI ENGINE
            </div>
            <h2 className="text-4xl font-black leading-tight mb-6">
              Dream It. <br /> We'll Print It.
            </h2>
            <p className="text-gray-600 mb-8">
              Describe your perfect t-shirt design. Our AI will generate a unique piece of wearable art just for you.
            </p>
            
            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A minimalist geometric fox with watercolor splashes in blue and orange..."
                className="w-full h-32 p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all resize-none"
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt}
                className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" />
                    <span>Imagining...</span>
                  </>
                ) : (
                  <>
                    <Wand2 />
                    <span>Generate Unique Design</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white p-8 flex flex-col items-center justify-center relative min-h-[400px]">
            {generatedImage ? (
              <div className="w-full h-full flex flex-col items-center">
                <div className="relative group w-full max-w-sm aspect-square">
                  <img 
                    src={generatedImage} 
                    alt="AI Design" 
                    className="w-full h-full object-cover rounded-2xl shadow-xl transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 border-4 border-black/5 pointer-events-none rounded-2xl"></div>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="mt-8 flex items-center space-x-2 bg-green-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-600 transition-colors"
                >
                  <Plus size={20} />
                  <span>Add to Cart - ৳1850</span>
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4 opacity-30">
                <div className="w-48 h-48 border-4 border-dashed border-gray-300 rounded-3xl mx-auto flex items-center justify-center">
                  <Brush size={48} />
                </div>
                <p className="font-medium">Your masterpiece will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIDesigner;
