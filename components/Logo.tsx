
import React from 'react';

interface LogoProps {
  className?: string;
  light?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "h-16", light = false }) => {
  const color = light ? "white" : "black";
  const lineColor = light ? "rgba(255,255,255,0.3)" : "#9ca3af";

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Top Row: Lines and T-Shirt Icon */}
      <div className="flex items-center w-full space-x-2">
        <div className="h-[1.5px] flex-grow" style={{ backgroundColor: lineColor }}></div>
        <svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C10.5 2 9.5 2.5 9 3C8 2.5 7 2 5.5 2C3.5 2 2 3.5 2 5.5V7.5L5 8.5V18H19V8.5L22 7.5V5.5C22 3.5 20.5 2 18.5 2C17 2 16 2.5 15 3C14.5 2.5 13.5 2 12 2Z" fill={color}/>
        </svg>
        <div className="h-[1.5px] flex-grow" style={{ backgroundColor: lineColor }}></div>
      </div>
      
      {/* Middle Row: UNIKA Wordmark */}
      <h1 
        className="font-black tracking-tighter leading-none py-1" 
        style={{ color, fontSize: '2.4rem', letterSpacing: '-0.05em' }}
      >
        UNIKA
      </h1>
      
      {/* Bottom Row: T SHIRTS and Lines */}
      <div className="flex items-center w-full space-x-2 -mt-1">
        <div className="h-[1px] w-8" style={{ backgroundColor: lineColor }}></div>
        <span 
          className="font-bold text-[0.65rem] uppercase tracking-[0.3em] whitespace-nowrap"
          style={{ color }}
        >
          T Shirts
        </span>
        <div className="h-[1px] w-8" style={{ backgroundColor: lineColor }}></div>
      </div>
    </div>
  );
};

export default Logo;
