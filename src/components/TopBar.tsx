import React from 'react';

interface TopBarProps {
  activeTab: string;
  onTabChange: (tab: 'questionnaires' | 'responses') => void;
}

const TopBar: React.FC<TopBarProps> = ({ activeTab, onTabChange }) => {
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

  const getLinkStyle = (tabName: 'questionnaires' | 'responses'): React.CSSProperties => {
    const isActive = activeTab === tabName;
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
        <a onClick={() => onTabChange('questionnaires')} style={getLinkStyle('questionnaires')}>
          שאלונים
        </a>
      </div>

      {/* Left Half */}
      <div style={tabStyle}>
        <a onClick={() => onTabChange('responses')} style={getLinkStyle('responses')}>
          תגובות
        </a>
      </div>
    </div>
  );
};

export default TopBar;
