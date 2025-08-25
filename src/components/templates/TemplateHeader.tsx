import React from 'react';
import PlusWhiteIcon from '../../assets/icons/PlusWhiteIcon';

interface TemplateHeaderProps {
  name: string;
  onNewCategory: () => void;
}

const TemplateHeader: React.FC<TemplateHeaderProps> = ({ name, onNewCategory }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', marginBottom: '20px' }}>
      <div style={{ gridColumn: 1, justifySelf: 'start' }}>
        <button
          className="button-primary"
          onClick={onNewCategory}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            borderRadius: '4px',
            border: '1px solid #0957D0',
            fontSize: '16px',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
              fontWeight: 700,
              fontSize: '20px',
              lineHeight: '100%',
              letterSpacing: '0',
              textAlign: 'right',
            }}
          >
            קטגוריה חדשה
          </span>
          <PlusWhiteIcon />
        </button>
      </div>
      <h2
        style={{
          gridColumn: 2,
          justifySelf: 'center',
          textAlign: 'center',
          fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
          fontWeight: 500,
          fontSize: '20px',
          lineHeight: '100%',
          letterSpacing: '0',
        }}
      >
        {name}
      </h2>
      <div style={{ gridColumn: 3 }} />
    </div>
  );
};

export default TemplateHeader;
