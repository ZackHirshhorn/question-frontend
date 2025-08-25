import React from 'react';
import './Icon.css';

const ExitButton: React.FC = () => (
  <div className="icon-container" style={{ width: 'auto', height: 'auto', flex: '0 0 auto' }}>
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 10L9.99979 1.00007" stroke="black" strokeWidth="2" strokeLinecap="round"/>
      <path d="M10 10L1.00002 1.00027" stroke="black" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  </div>
);

export default ExitButton;

