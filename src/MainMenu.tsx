import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Layers, Tag, Menu, X, Search, Moon, Sun } from 'lucide-react';
import './css/MainMenu.css';
import logo from "./logo.jpg";

const MainMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const location = useLocation();

  // 1. Handle Route Changes
  useEffect(() => {
    setIsOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  // 2. Handle Theme Toggle
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav className="navbar">
      <div className="nav-blur-layer" />
      
      <div className="nav-container">
        
        {/* --- LEFT: LOGO --- */}
        <NavLink to="/" className="nav-brand">
          <img src={logo} alt="Logo" className="nav-logo-img" />
          <span className="nav-logo-text">BlogCMS.</span>
        </NavLink>

        {/* --- CENTER: LINKS (Desktop) --- */}
        <div className="nav-desktop">
          <NavItem to="/" label="Home" icon={<Home size={16} />} />
          <NavItem to="/posts" label="Posts" icon={<BookOpen size={16} />} />
          <NavItem to="/categories" label="Categories" icon={<Layers size={16} />} />
          <NavItem to="/labels" label="Labels" icon={<Tag size={16} />} />
        </div>

        {/* --- RIGHT: ACTIONS --- */}
        <div className="nav-actions">
          
          {/* Search Bar (Expandable) */}
          <div className={`search-wrapper ${isSearchOpen ? 'active' : ''}`}>
             <button 
                className="icon-btn search-trigger" 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Toggle Search"
             >
                <Search size={20} />
             </button>
             <input 
                type="text" 
                placeholder="Type to search..." 
                className="search-input"
                autoFocus={isSearchOpen}
                onBlur={() => !// keep open if it has text, else close logic here
                   null
                }
             />
          </div>

          {/* Theme Toggle */}
          <button className="icon-btn theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
             <div className="theme-icon-sun"><Sun size={20} /></div>
             <div className="theme-icon-moon"><Moon size={20} /></div>
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-toggle" 
            onClick={() => setIsOpen(!isOpen)} 
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* --- MOBILE DROPDOWN --- */}
        <div className={`nav-mobile ${isOpen ? 'is-open' : ''}`}>
          <div className="mobile-links-wrapper">
             <NavItem to="/" label="Home" icon={<Home size={20} />} />
             <NavItem to="/posts" label="Posts" icon={<BookOpen size={20} />} />
             <NavItem to="/categories" label="Categories" icon={<Layers size={20} />} />
             <NavItem to="/labels" label="Labels" icon={<Tag size={20} />} />
          </div>
        </div>

      </div>
    </nav>
  );
};

// Reusable Nav Item
const NavItem = ({ to, label, icon }: { to: string, label: string, icon: React.ReactNode }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
  >
    <span className="icon-box">{icon}</span>
    <span className="label">{label}</span>
  </NavLink>
);

export default MainMenu;