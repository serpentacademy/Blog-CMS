import React from 'react';

const SignUp: React.FC = () => {
  return (
    <div className="sidebar-section signup-card">
      <h3 className="signup-title">Join the Grid</h3>
      <p className="signup-text">Get weekly downloads from the digital frontier.</p>
      <div className="signup-form">
        <input type="email" placeholder="Enter your email..." className="signup-input" />
        <button className="signup-btn">Subscribe</button>
      </div>
    </div>
  );
};

export default SignUp;