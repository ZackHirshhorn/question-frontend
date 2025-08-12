import React from 'react';

const TriangleIcon: React.FC<{ style?: React.CSSProperties; isRotated?: boolean; isVisible?: boolean }> = ({ style, isRotated, isVisible }) => {
  const combinedStyle: React.CSSProperties = {
    ...style,
    transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
    transform: isRotated ? 'rotate(-90deg)' : 'rotate(0deg)',
    opacity: isVisible ? 1 : 0,
  };

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      style={combinedStyle}
    >
      <polygon points="18,6 6,12 18,18" fill="black" />
    </svg>
  );
};

export default TriangleIcon;
