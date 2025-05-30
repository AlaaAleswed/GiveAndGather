
import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Gift,
  Search,
  UserPlus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import StatsCarousel from "../components/StatsCarousel";
import donateimage2 from "../assets/donateimage2.png";
import translations from "../translations";
import DonationCard from "../components/DonationCard";
import axios from "axios";


import React, { useEffect } from 'react';
import '../index.css'; // Ensure your global styles are here
import leftHand from '../assets/leftHand.png'; // اليد العلوية
import rightHand from '../assets/rightHand.png'; // اليد السفلية
import AboutUs from '../pages/AboutUs';
import CoverflowSlider from "../components/CoverflowSlider";
import { useUserContext } from "../context/UserContext";

const Home = () => {

   

  const [mostInterested, setMostInterested] = useState([]);
  const scrollRef = useRef();

const { user: currentUser } = useUserContext();
  const navigate = useNavigate();


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




  useEffect(() => {
    axios
      .get("/donations/most-interested")
      .then((res) => setMostInterested(res.data))
      .catch((err) =>
        console.error("❌ Failed to fetch most interested:", err)
      );
  }, []);
  const scroll = (direction) => {
    const container = scrollRef.current;
    if (!container) return;
    const scrollAmount = 320;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };


  return (
    <>
      {/* Hero Section */}
  <section className="hero-section">
  <img src={leftHand} alt="Left Hand" className="left-hand" />
  <img src={rightHand} alt="Right Hand" className="right-hand" />
  <h1 className="hero-title">Give & Gather</h1>
</section>

<div className="section-transition"></div>
   

 <CoverflowSlider />

      

      {/* most interested section */}
      <h2 className="mt-5 mb-3">Most Intrested </h2>
      <div className="position-relative">
        <button
          className="btn btn-light position-absolute top-50 start-0 translate-middle-y z-2"
          style={{ boxShadow: "0 0 6px rgba(0,0,0,0.2)" }}
          onClick={() => scroll("left")}
        >
          <ChevronLeft />
        </button>
        <div
          ref={scrollRef}
          className="d-flex overflow-auto gap-3 px-4 py-3"
          style={{
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {mostInterested.map((donation) => (
            <div
              key={donation._id}
              className="flex-shrink-0"
              style={{ width: "300px",height: "400px", scrollSnapAlign: "start" }}
              onClick={() => {
                if (!currentUser) {
                  navigate("/auth");
                } else {
                  navigate(`/donations/${donation._id}`);
                }
              }}
            >
              <DonationCard donation={donation} />
            </div>
          ))}
        </div>
        <button
          className="btn btn-light position-absolute top-50 end-0 translate-middle-y z-2"
          style={{ boxShadow: "0 0 6px rgba(0,0,0,0.2)" }}
          onClick={() => scroll("right")}
        >
          <ChevronRight />
        </button>
      </div>

      {/* Stats Section */}
      <div className="position-relative min-vh-100 w-100 d-flex align-items-center justify-content-center bg-white">
        <StatsCarousel />
      </div>

     
    
    </>
  );
};

export default Home;
