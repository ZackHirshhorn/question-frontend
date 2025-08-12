import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const TopBar: React.FC = () => {
  const location = useLocation();

  const topBarStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 100px',
    marginBottom: '80px',
  };

  const tabStyle: React.CSSProperties = {
    flex: '1', // Each tab takes up 50% of the space
    display: 'flex',
    justifyContent: 'center', // Center the content horizontally
  };

  const getLinkStyle = (path: string): React.CSSProperties => {
    const isActive = location.pathname.startsWith(path);
    return {
      textDecoration: isActive ? 'underline' : 'none',
      color: isActive ? '#007bff' : 'black',
      fontSize: '18px',
      cursor: 'pointer',
      padding: '10px',
    };
  };

  return (
    <div style={topBarStyle}>
      {/* Right Half (due to RTL) */}
      <div style={tabStyle}>
        <Link to="/templates" style={getLinkStyle('/templates')}>
          שאלונים
        </Link>
      </div>

      {/* Left Half */}
      <div style={tabStyle}>
        <Link to="/responses" style={getLinkStyle('/responses')}>
          תגובות
        </Link>
      </div>
    </div>
  );
};

export default TopBar;
