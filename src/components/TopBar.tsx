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
    let isActive = location.pathname.startsWith(path);
    // Treat root path as Templates active
    if (path === '/templates') {
      isActive = isActive || location.pathname === '/';
    }
    const base: React.CSSProperties = {
      cursor: 'pointer',
      padding: '10px',
    };
    if (isActive) {
      return {
        ...base,
        textDecoration: 'underline',
        color: '#0957D0',
        fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
        fontWeight: 700,
        fontSize: '20px',
        lineHeight: '100%',
        letterSpacing: '0',
        textAlign: 'right',
      };
    }
    // Non-active tab typography from Figma
    return {
      ...base,
      textDecoration: 'none',
      color: 'black',
      fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
      fontWeight: 700,
      fontSize: '20px',
      lineHeight: '100%',
      letterSpacing: '0',
      textAlign: 'right',
    };
  };

  return (
    <div style={topBarStyle}>
      {/* Templates */}
      <div style={tabStyle}>
        <Link to="/templates" style={getLinkStyle('/templates')}>
          שאלונים
        </Link>
      </div>

      {/* Questions (middle tab) */}
      <div style={tabStyle}>
        <Link to="/questions" style={getLinkStyle('/questions')}>
          שאלות
        </Link>
      </div>

      {/* Responses */}
      <div style={tabStyle}>
        <Link to="/responses" style={getLinkStyle('/responses')}>
          תגובות
        </Link>
      </div>
    </div>
  );
};

export default TopBar;
