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
import { useUser } from "../context/UserContext";

axios.defaults.baseURL = "http://localhost:5050/api";
axios.defaults.withCredentials = true;

const Home = () => {
  const lang = localStorage.getItem("language") || "en";
  const t = translations[lang];

  const [mostInterested, setMostInterested] = useState([]);
  const scrollRef = useRef();

const { user: currentUser } = useUser();
  const navigate = useNavigate();

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
      <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center text-center">
        {/* Background */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100 "
          style={{
            width: "100vw",
            height: "100%",
            backgroundImage: `url(${donateimage2})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            zIndex: -1,
          }}
        >
          <div
            className="w-100 h-100"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.88)" }}
          ></div>
        </div>

        {/* Content */}
        <div className="container position-relative z-1 animate-slide-bottom">
          <h1 className="display-4 fw-bold text-light mb-4">
            {lang === "en" ? "Share Kindness, " : "شارك اللطف، "}
            <span className="text-warning">
              {lang === "en" ? "Make Impact" : "وصنع الأثر"}
            </span>
          </h1>
          <p
            className="lead text-light mb-4 mx-auto"
            style={{ maxWidth: "600px" }}
          >
            {lang === "en"
              ? "Join our community of givers and make a difference in someone's life through the power of sharing."
              : "انضم إلى مجتمع العطاء واصنع فرقًا في حياة شخص من خلال قوة المشاركة."}
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link
              to="/add-donation"
              className="btn btn-light d-flex align-items-center gap-2"
            >
              <Gift size={20} /> {lang === "en" ? "Donate Now" : "تبرع الآن"}
            </Link>
            <Link
              to="/donations"
              className="btn btn-warning d-flex align-items-center gap-2"
            >
              <Search size={20} />{" "}
              {lang === "en" ? "Browse Donations" : "تصفح التبرعات"}
            </Link>
          </div>
        </div>
      </div>

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

      {/* CTA Section */}
      <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center text-center">
        <div
          className="position-absolute start-0 end-0"
          style={{
            width: "100%",
            height: "90%",
            backgroundImage: `url(${donateimage2})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            zIndex: -1,
            // opacity: 0.2,
          }}
        >
          <div
            className="w-100 h-100"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.77)" }}
          ></div>
        </div>

        <div className="container position-relative z-1">
          <h2 className="display-4 fw-bold text-light mb-4">
            {lang === "en" ? "Ready to Make a " : "هل أنت مستعد لترك "}
            <span className="text-warning">
              {lang === "en" ? "Difference?" : "أثر؟"}
            </span>
          </h2>
          <p
            className="lead text-light mb-4 mx-auto"
            style={{ maxWidth: "600px" }}
          >
            {lang === "en"
              ? "Join our community today and start sharing kindness with those in need."
              : "انضم إلى مجتمعنا اليوم وابدأ بمشاركة اللطف مع المحتاجين."}
          </p>
          <div className="d-flex justify-content-center">
            <Link
              to="/auth"
              className="btn btn-light d-inline-flex align-items-center gap-2"
            >
              <UserPlus size={20} /> {lang === "en" ? "Join Now" : "انضم الآن"}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
