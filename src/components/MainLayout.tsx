import React from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';

const MainLayout: React.FC = () => {
  return (
    <>
      <TopBar />
      <Outlet />
    </>
  );
};

export default MainLayout;
