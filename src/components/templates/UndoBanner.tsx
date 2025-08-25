import React from 'react';

interface UndoBannerProps {
  label: string;
  onUndo: () => void;
}

const UndoBanner: React.FC<UndoBannerProps> = ({ label, onUndo }) => {
  return (
    <div
      role="alert"
      style={{
        padding: '12px 16px',
        background: '#183755',
        border: '1px solid #D0D5DD',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingInlineEnd: '60px',
        direction: 'rtl',
        position: 'absolute',
        right: 0,
        top: 0,
        width: '40%',
        transform: 'translateX(42%)',
        zIndex: 10,
      }}
    >
      <span
        style={{
          fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
          fontWeight: 500,
          fontStyle: 'normal',
          fontSize: '20px',
          lineHeight: '100%',
          letterSpacing: '0',
          textAlign: 'right',
          color: '#FFFFFF',
        }}
      >
        {label}
      </span>
      <button
        onClick={onUndo}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#7FCCFE',
          cursor: 'pointer',
          fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
          fontWeight: 700,
          fontStyle: 'normal',
          fontSize: '18px',
          lineHeight: '100%',
          letterSpacing: '0',
          textAlign: 'right',
          padding: 0,
        }}
      >
        בטל
      </button>
    </div>
  );
};

export default UndoBanner;

