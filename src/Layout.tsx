import React from 'react';
import { Outlet } from 'react-router-dom';
import MainMenu from './MainMenu';

const Layout = () => {
  return (
    <div className="app-layout">
      {/* The Menu sits on top of everything */}
      <MainMenu />
      
      {/* 'Outlet' is where Home or Post renders */}
      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;