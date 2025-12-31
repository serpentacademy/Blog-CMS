import React from 'react';
import { dummyProducts } from '../data';

const Products: React.FC = () => {
  return (
    <div className="layout-sidebar left">
      <h3 className="sidebar-title">My Products</h3>
      
      {dummyProducts.map((product, index) => (
        <a key={index} href={product.url} className="product-card">
          <div className="product-image-wrapper">
            <img src={product.image} alt={product.name} className="product-image" />
          </div>
          <div className="product-info">
            <h4>{product.name}</h4>
            <p>{product.description}</p>
          </div>
        </a>
      ))}
    </div>
  );
};

export default Products;