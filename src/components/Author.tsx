import React from 'react';
import { authorData } from '../data';
import logo from "../logo2.jpg"

const Author: React.FC = () => {
  return (
    <div className="author-card">
      <h3 className="sidebar-title">About the Author</h3>
      <div className="author-image-wrapper">
        <img src={logo} alt={authorData.name} className="author-image" />
      </div>
      <div className="author-name">{authorData.name}</div>
      <p className="author-bio">{authorData.bio}</p>
      
      {/* Simple Text Links */}
      <div style={{ display: 'flex', gap: '15px', fontSize: '0.9rem', fontWeight: 'bold' }}>
        <a href="#" style={{ color: '#000', textDecoration: 'none' }}>Instagram</a>
        <a href="#" style={{ color: '#000', textDecoration: 'none' }}>Twitter</a>
      </div>
    </div>
  );
};

export default Author;