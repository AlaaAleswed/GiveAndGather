import React from 'react';
import { Heart } from 'lucide-react';
import herovideo from '../assets/herovideo.mp4';

const Footer = () => {
  return (
    <footer className="footer-wrapper shadow-sm">
      <div className="footer-video-wrapper">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="footer-video"
        >
          <source src={herovideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="container-fluid py-4 px-3 text-center footer-content">
        <div className="d-flex align-items-center justify-content-center gap-2">
          <Heart className="text-primary" size={20} />
          <span className="text-secondary">Give & Gather © {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
