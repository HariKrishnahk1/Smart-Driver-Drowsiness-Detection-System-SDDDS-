import React from 'react';

export default function NeonEyesLogo({ size = 40, style = {}, className = "" }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      width={size} 
      height={size} 
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        ...style
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* White Neon Glow */}
        <filter id="neon-white-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur1" />
          <feGaussianBlur stdDeviation="6" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        {/* Intense Inner Glow for Pupils */}
        <filter id="intense-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComponentTransfer in="blur" result="boost">
            <feFuncA type="linear" slope="2" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="boost" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      <g filter="url(#neon-white-glow)">
        {/* Left Eye Outer Lid */}
        <path 
          d="M 10 50 Q 30 22 50 50 Q 30 78 10 50 Z" 
          stroke="#ffffff" 
          strokeWidth="3.5" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        {/* Left Eye Inner Iris Circle */}
        <circle 
          cx="30" 
          cy="50" 
          r="8.5" 
          stroke="#a3a3a3" 
          strokeWidth="2" 
          fill="none" 
        />
        {/* Left Eye Glowing Pupil */}
        <circle 
          cx="30" 
          cy="50" 
          r="4.5" 
          fill="#ffffff" 
          filter="url(#intense-glow)"
        />
        {/* Left Eye Light Catch Reflection */}
        <circle 
          cx="32" 
          cy="48" 
          r="1.2" 
          fill="#ffffff" 
        />
        
        {/* Right Eye Outer Lid */}
        <path 
          d="M 50 50 Q 70 22 90 50 Q 70 78 50 50 Z" 
          stroke="#ffffff" 
          strokeWidth="3.5" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        {/* Right Eye Inner Iris Circle */}
        <circle 
          cx="70" 
          cy="50" 
          r="8.5" 
          stroke="#a3a3a3" 
          strokeWidth="2" 
          fill="none" 
        />
        {/* Right Eye Glowing Pupil */}
        <circle 
          cx="70" 
          cy="50" 
          r="4.5" 
          fill="#ffffff" 
          filter="url(#intense-glow)"
        />
        {/* Right Eye Light Catch Reflection */}
        <circle 
          cx="72" 
          cy="48" 
          r="1.2" 
          fill="#ffffff" 
        />
        
        {/* Futuristic Cyber Brows / HUD accents */}
        <path 
          d="M 8 32 Q 30 13 48 30" 
          stroke="#ffffff" 
          strokeWidth="2" 
          fill="none" 
          strokeLinecap="round" 
        />
        <path 
          d="M 52 30 Q 70 13 92 32" 
          stroke="#ffffff" 
          strokeWidth="2" 
          fill="none" 
          strokeLinecap="round" 
        />
        
        {/* Cybernetic HUD Accent Tick Marks below eyes */}
        <path 
          d="M 22 65 L 26 69" 
          stroke="#a3a3a3" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
        />
        <path 
          d="M 38 65 L 34 69" 
          stroke="#a3a3a3" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
        />
        <path 
          d="M 62 65 L 66 69" 
          stroke="#a3a3a3" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
        />
        <path 
          d="M 78 65 L 74 69" 
          stroke="#a3a3a3" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
        />
      </g>
    </svg>
  );
}
