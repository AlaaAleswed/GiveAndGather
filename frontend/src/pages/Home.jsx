// File: src/pages/Home.jsx

import React, { useEffect } from 'react';
import '../index.css'; // Ensure your global styles are here
import leftHand from '../assets/leftHand.png'; // اليد العلوية
import rightHand from '../assets/rightHand.png'; // اليد السفلية
import AboutUs from '../pages/AboutUs';
import CoverflowSlider from "../components/CoverflowSlider";

const Home = () => {
useEffect(() => {
  const handleScroll = () => {
    const scrollY = window.scrollY;
    const left = document.querySelector(".left-hand");
    const right = document.querySelector(".right-hand");
    const title = document.querySelector(".hero-title");

    if (left && right && title) {
      left.style.transform = `translateX(-${scrollY * 0.4}px)`;
      right.style.transform = `translateX(${scrollY * 0.4}px)`;
      title.style.opacity = 1 - scrollY / 250;
    }

    document.querySelectorAll(".text-block").forEach((block) => {
      const rect = block.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) {
        block.classList.add("visible");
      }
    });
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);


  return (
    <>
      {/* Hero Section */}
  <section className="hero-section">
  <img src={leftHand} alt="Left Hand" className="left-hand" />
  <img src={rightHand} alt="Right Hand" className="right-hand" />
  <h1 className="hero-title">Give & Gather</h1>
</section>

<div className="section-transition"></div>
   
{/* <AboutUs></AboutUs> */}
 <CoverflowSlider />

        {/* <div className="text-block fade-in">
          <h2>🌍 About Us | من نحن</h2>
          <p>We are a group of computer science students with a purpose.</p>
          <p>نحن مجموعة من طلاب علوم الحاسوب، اجتمعنا لهدف سامٍ.</p>
        </div>

        <div className="text-block fade-in">
          <p>A platform born from empathy and responsibility...</p>
          <p>منصة وُلدت من رحم المسؤولية والرحمة...</p>
        </div>

        <div className="text-block fade-in dark-bg glow-text">
          <p>🌱 Every leftover item is a chance...</p>
          <p>كل غرض زائد هو فرصة...</p>
        </div>

        <div className="text-block fade-in mosque-bg">
          <p>🌄 In Islam, helping others is not optional...</p>
          <p>في الإسلام، مساعدة الآخرين ليست خيارًا...</p>
        </div>

        <div className="text-block fade-in">
          <p>🌟 This is our mission...</p>
          <p>هذه رسالتنا...</p>
        </div> */}
    
    </>
  );
};

export default Home;
