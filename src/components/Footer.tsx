import React from 'react';
import { Github, Heart, Code2 } from 'lucide-react';
import '../css/Footer.css';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer-wrapper">
            <div className="footer-container">
                
                {/* Left: Copyright & Simple message */}
                <div className="footer-left">
                    <span className="copyright">© {currentYear} Serpent Academy. All Rights Reserved.</span>
                    <span className="separator">•</span>
                    <span className="open-source-tag">
                        <Code2 size={14} className="muted-icon" /> Open Source Project
                    </span>
                </div>

                {/* Right: Made with Love & Repo Link */}
                <div className="footer-right">
                    <span className="made-with">
                        Created with <Heart size={14} fill="currentColor" className="heart-icon" />
                    </span>
                    
                    <a 
                        href="https://github.com/serpentacademy/Blog-CMS" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="github-repo-btn"
                        aria-label="View source code on GitHub"
                    >
                        <Github size={16} />
                        <span>View Repo</span>
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;