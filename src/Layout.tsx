import React from 'react';
import { Outlet } from 'react-router-dom';
import MainMenu from './MainMenu';
import Footer from './components/Footer'; // <-- Import here

const Layout = () => {
  return (
    <div className="app-layout">
      {/* The Menu sits on top of everything */}
      <MainMenu />
      
      {/* 'Outlet' is where Home or Post renders */}
      <main className="page-content">
        <Outlet />
      </main>
      <Footer /> {/* <-- Add at the bottom */}
    </div>
  );
};

export default Layout;