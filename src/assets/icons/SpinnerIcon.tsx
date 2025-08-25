import React from 'react';
import './Icon.css';

type SpinnerSize = 'sm' | 'md' | 'lg';
type SpinnerVariant = 'light' | 'dark';

interface SpinnerIconProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
}

const sizeToPx: Record<SpinnerSize, number> = {
  sm: 12,
  md: 14,
  lg: 18,
};

const variantToStroke: Record<SpinnerVariant, string> = {
  light: 'white',
  dark: '#333',
};

const SpinnerIcon: React.FC<SpinnerIconProps> = ({ size = 'md', variant = 'light' }) => {
  const px = sizeToPx[size] || 14;
  const stroke = variantToStroke[variant] || 'white';
  return (
    <div className="icon-container" style={{ width: 'auto', height: 'auto', flex: '0 0 auto' }}>
      <svg width={px} height={px} viewBox="0 0 50 50" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="25"
          cy="25"
          r="20"
          stroke={stroke}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="31.415, 31.415"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 25 25"
            to="360 25 25"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
};

export default SpinnerIcon;
