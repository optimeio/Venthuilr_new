import React, { useState, useEffect } from 'react';
import './Preloader.css';

export default function Preloader({ onComplete, minDuration = 2200 }) {
  const [stage, setStage] = useState('drawing');
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setStage('bloomed');
    }, 900);

    const t2 = setTimeout(() => {
      setStage('reveal');
    }, 1800);

    const t3 = setTimeout(() => {
      setStage('done');
      if (onComplete) onComplete();
    }, minDuration);

    const t4 = setTimeout(() => {
      setHidden(true);
    }, minDuration + 450);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [minDuration, onComplete]);

  if (hidden) return null;

  return (
    <div className={`venthulir-preloader-backdrop stage-${stage}`} aria-hidden="true">
      
      {/* Ambient Nature Rays & Floating Golden Spores */}
      <div className="preloader-ambient-glow" />
      <div className="preloader-spores">
        <span className="spore spore-1" />
        <span className="spore spore-2" />
        <span className="spore spore-3" />
        <span className="spore spore-4" />
        <span className="spore spore-5" />
        <span className="spore spore-6" />
      </div>

      <div className="preloader-center-pod">
        
        {/* Animated Sprouting SVG Logo */}
        <div className="logo-svg-wrapper">
          
          <svg 
            viewBox="0 0 200 220" 
            className="logo-sprout-svg"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Vibrant Nature Gradient for Hands */}
              <linearGradient id="handGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#0d5228" />
                <stop offset="50%" stopColor="#16853f" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>

              {/* Lush Leaf Gradient */}
              <linearGradient id="leafGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#15803d" />
                <stop offset="60%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#4ade80" />
              </linearGradient>

              {/* Central Seed Sunbeam */}
              <radialGradient id="seedGradient" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#86efac" />
                <stop offset="45%" stopColor="#16a34a" />
                <stop offset="100%" stopColor="#0f4c28" />
              </radialGradient>

              {/* Golden Sun Flare Glow */}
              <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* 1. Growing Soil Ripple & Root Energy Base */}
            <ellipse 
              cx="100" 
              cy="210" 
              rx="24" 
              ry="4" 
              className="soil-ripple" 
            />

            {/* 2. Caring Nurturing Hands (Left & Right) */}
            {/* Left Protective Hand */}
            <path
              d="M 100 208 C 94 195, 68 178, 52 142 C 40 115, 45 88, 56 68 C 58 64, 62 66, 61 70 C 54 94, 58 122, 74 148 C 84 164, 95 180, 100 208 Z"
              className="svg-elem svg-hand-left"
              fill="url(#handGradient)"
            />

            {/* Right Protective Hand */}
            <path
              d="M 100 208 C 106 195, 132 178, 148 142 C 160 115, 155 88, 144 68 C 142 64, 138 66, 139 70 C 146 94, 142 122, 126 148 C 116 164, 105 180, 100 208 Z"
              className="svg-elem svg-hand-right"
              fill="url(#handGradient)"
            />

            {/* 3. Central Organic Seed / Golden Sun Orb */}
            <circle
              cx="100"
              cy="114"
              r="14"
              className="svg-elem svg-seed-core"
              fill="url(#seedGradient)"
              filter="url(#goldGlow)"
            />

            {/* 4. Tender Sprouting Inner Micro-Leaves */}
            {/* Left Sprout */}
            <path
              d="M 88 122 C 76 122, 70 112, 74 98 C 82 102, 88 110, 88 122 Z"
              className="svg-elem svg-sprout-left"
              fill="url(#leafGradient)"
            />

            {/* Right Sprout */}
            <path
              d="M 112 122 C 124 122, 130 112, 126 98 C 118 102, 112 110, 112 122 Z"
              className="svg-elem svg-sprout-right"
              fill="url(#leafGradient)"
            />

            {/* 5. The 3 Majestic Crown Harvest Leaves */}
            {/* Left Crown Leaf */}
            <path
              d="M 82 86 C 62 82, 54 62, 58 42 C 72 48, 82 64, 82 86 Z"
              className="svg-elem svg-crown-left"
              fill="url(#leafGradient)"
            />

            {/* Right Crown Leaf */}
            <path
              d="M 118 86 C 138 82, 146 62, 142 42 C 128 48, 118 64, 118 86 Z"
              className="svg-elem svg-crown-right"
              fill="url(#leafGradient)"
            />

            {/* Center Top Tall Leaf (The Thulir Crown) */}
            <path
              d="M 100 88 C 84 62, 86 36, 100 12 C 114 36, 116 62, 100 88 Z"
              className="svg-elem svg-crown-center"
              fill="url(#leafGradient)"
            />
            {/* Center Leaf Rib Spine */}
            <line
              x1="100"
              y1="22"
              x2="100"
              y2="82"
              stroke="#86efac"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="svg-elem svg-leaf-rib"
            />

          </svg>

          {/* Golden Sunburst Halo */}
          <div className="logo-halo-ring" />
        </div>

        {/* Brand Name Letter-by-Letter Reveal */}
        <div className="preloader-brand-reveal">
          <h1 className="preloader-title">
            {'VENTHULIR'.split('').map((letter, idx) => (
              <span 
                key={idx} 
                className="letter-span"
                style={{ animationDelay: `${0.85 + idx * 0.06}s` }}
              >
                {letter}
              </span>
            ))}
          </h1>
          <p className="preloader-tagline">
            <span className="tagline-dot" />
            PURE TASTE OF NATURE
            <span className="tagline-dot" />
          </p>
        </div>

        {/* Organic Loading Pulse Progress Line */}
        <div className="preloader-progress-track">
          <div className="preloader-progress-fill" />
        </div>

      </div>

    </div>
  );
}
