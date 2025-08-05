import React, { useState, useRef, useEffect } from 'react';

interface TopMenuProps {
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

const TopMenu: React.FC<TopMenuProps> = ({ isLoggedIn, onLogin, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close the menu if clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuIcon = (
    <div onClick={toggleMenu} style={{ cursor: 'pointer', padding: '10px' }}>
      <div style={{ width: '25px', height: '3px', backgroundColor: 'black', margin: '4px 0' }}></div>
      <div style={{ width: '25px', height: '3px', backgroundColor: 'black', margin: '4px 0' }}></div>
      <div style={{ width: '25px', height: '3px', backgroundColor: 'black', margin: '4px 0' }}></div>
    </div>
  );

  const dropdownMenu = (
    <div style={{
      position: 'absolute',
      top: '50px',
      right: '10px',
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '4px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 1000,
    }}>
      <ul style={{ listStyle: 'none', margin: 0, padding: '10px 0' }}>
        {isLoggedIn ? (
          <li onClick={onLogout} style={{ padding: '10px 20px', cursor: 'pointer' }}>
            התנתקות
          </li>
        ) : (
          <li onClick={onLogin} style={{ padding: '10px 20px', cursor: 'pointer' }}>
            Login
          </li>
        )}
        {/* Additional actions can be added here */}
      </ul>
    </div>
  );

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      {menuIcon}
      {isOpen && dropdownMenu}
    </div>
  );
};

export default TopMenu;
