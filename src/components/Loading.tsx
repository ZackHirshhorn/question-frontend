import React from 'react';
import SpinnerIcon from '../assets/icons/SpinnerIcon';

const Loading: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', fontSize: '24px', padding: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <SpinnerIcon size="lg" variant="dark" />
      <div>בטעינה...</div>
    </div>
  );
};

export default Loading;
