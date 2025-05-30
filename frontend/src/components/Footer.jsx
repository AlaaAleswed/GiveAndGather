import React from 'react';
import { Heart } from 'lucide-react';
import "../styles/footer.css";

const Footer = () => {
  return (
    <footer className="footer-wrapper shadow-sm">
      <div className="container-fluid py-2 px-3 text-center footer-content">
        <div className="d-flex align-items-center justify-content-center gap-2">
          <Heart className="text-primary" size={18} />
          <span className="text-secondary">Give & Gather © {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
