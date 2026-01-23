
import React, { useEffect, useState } from 'react';

const StartupSplash: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [text, setText] = useState('');
  const [showSubtext, setShowSubtext] = useState(false);
  const fullText = "HIM SYSTEM";
  const subTexts = [
    "> INITIALIZING KERNEL...",
    "> LOADING NEURAL NETWORK...",
    "> AUTHENTICATING OPERATOR...",
    "> SYSTEM READY."
  ];
  const [currentSubIndex, setCurrentSubIndex] = useState(0);

  useEffect(() => {
    // Typewriter effect for main text
    let i = 0;
    const timer = setInterval(() => {
      setText(fullText.substring(0, i));
      i++;
      if (i > fullText.length) {
        clearInterval(timer);
        setTimeout(() => setShowSubtext(true), 500);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (showSubtext) {
      const subTimer = setInterval(() => {
        setCurrentSubIndex(prev => {
          if (prev < subTexts.length - 1) return prev + 1;
          return prev;
        });
      }, 400);

      const exitTimer = setTimeout(() => {
        onComplete();
      }, 2500);

      return () => {
        clearInterval(subTimer);
        clearTimeout(exitTimer);
      };
    }
  }, [showSubtext, onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden font-mono select-none">
      {/* Background Matrix-like static overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: 'radial-gradient(#ea580c 1px, transparent 0)',
        backgroundSize: '30px 30px'
      }}></div>

      {/* Main Logo */}
      <div className="relative">
        <h1 
          className="text-6xl md:text-8xl font-black text-orange-600 tracking-[0.2em] relative z-10"
          style={{ fontFamily: "'Orbitron', sans-serif", textShadow: '0 0 20px rgba(234, 88, 12, 0.5)' }}
        >
          {text}
          <span className="animate-pulse bg-orange-600 w-4 h-12 md:h-16 inline-block ml-2 align-middle"></span>
        </h1>
        
        {/* Mirror Reflection */}
        <h1 
          className="text-6xl md:text-8xl font-black text-orange-900/10 tracking-[0.2em] absolute top-full left-0 scale-y-[-0.5] blur-[2px] mt-2"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          {text}
        </h1>
      </div>

      {/* Loading Status */}
      <div className="mt-16 h-20 flex flex-col items-start w-64 md:w-96">
        {showSubtext && (
          <div className="space-y-1 w-full animate-in fade-in duration-700">
            {subTexts.slice(0, currentSubIndex + 1).map((t, idx) => (
              <p key={idx} className="text-[10px] md:text-xs text-orange-500/60 font-mono tracking-tighter">
                {t}
              </p>
            ))}
            <div className="w-full bg-gray-900 h-1 mt-4 overflow-hidden rounded-full">
              <div 
                className="h-full bg-orange-600 transition-all duration-300 shadow-[0_0_10px_rgba(234,88,12,0.8)]"
                style={{ width: `${((currentSubIndex + 1) / subTexts.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Decorative Corners */}
      <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-orange-600/20"></div>
      <div className="absolute top-10 right-10 w-20 h-20 border-t-2 border-r-2 border-orange-600/20"></div>
      <div className="absolute bottom-10 left-10 w-20 h-20 border-b-2 border-l-2 border-orange-600/20"></div>
      <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-orange-600/20"></div>

      {/* CRT Scanline Effect */}
      <div className="scanline"></div>
    </div>
  );
};

export default StartupSplash;
