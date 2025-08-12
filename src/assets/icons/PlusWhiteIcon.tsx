import React from 'react';
import './Icon.css';

const PlusWhiteIcon: React.FC = () => (
  <div className="icon-container" style={{ width: 'auto', height: 'auto', flex: '0 0 auto' }}>
    <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="10.5" y1="1" x2="10.5" y2="19" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="1.5" y1="10" x2="19.5" y2="10" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </div>
);

export default PlusWhiteIcon;
