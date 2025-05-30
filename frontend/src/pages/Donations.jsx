import React, { useEffect, useRef, useState } from "react";
import { Search, MapPin, Filter } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ تم إضافة useLocation
import DonationCard from "../components/DonationCard";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";

const categories = [
  { id: "all", label: "All" },
  { id: "nursing", label: "Nursing & Pregnancy" },
  { id: "clothes", label: "Clothes" },
  { id: "electronics", label: "Electronics" },
  { id: "furniture", label: "Furniture" },
  { id: "food", label: "Food" },
  { id: "other", label: "Other" },
];

axios.defaults.baseURL = "http://localhost:5050/api";
axios.defaults.withCredentials = true;

const Donations = () => {
  const navigate = useNavigate();
  const locationHook = useLocation(); // ✅ جديد
  const [selectedkind, setSelectedkind] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);
  const [selectedId, setSelectedId] = useState(null);
  const [donations, setDonations] = useState([]);

  const observerTarget = useRef(null);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-in-out",
    });
  }, []);

  useEffect(() => {
    const fetchDonations = async () => {
      const res = await axios.get("/donations");
     const valid = res.data.filter((d) => d.isValid === undefined || d.isValid === true || d.isValid === "true");

      setDonations(valid);
    };

    fetchDonations(); // ✅ كل مرة تتغير فيها الصفحة (بعد الرجوع مثلاً)
  }, [locationHook]); // ✅ هذا هو المفتاح

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          visibleCount < filteredDonations.length
        ) {
          setVisibleCount((prev) => prev + 3);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [donations, visibleCount]);

  const filteredDonations = donations.filter((donation) => {
    const matchesKind =
      selectedkind === "all" || donation.kind?.toLowerCase() === selectedkind;

    const matchesSearch =
      donation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation =
      !location ||
      donation.location.toLowerCase().includes(location.toLowerCase());

    return matchesKind && matchesSearch && matchesLocation;
  });

  return (
    <div className="container-fluid py-4">
      <div className="bg-white p-4 rounded shadow-sm mb-5">
        <div className="row g-3">
          <div className="col-md-6 position-relative p-2">
            <Search
              className="position-absolute top-50 translate-middle-y ms-2 text-muted"
              size={16}
            />
            <input
              type="text"
              placeholder="Search donations..."
              className="form-control ps-5"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="col-md-6 position-relative p-2">
            <MapPin
              className="position-absolute top-50 translate-middle-y ms-2 text-muted"
              size={16}
            />
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="form-select ps-5"
            >
              <option value="">Select a location</option>
              <option value="amman">Amman</option>
              <option value="irbid">Irbid</option>
              <option value="zarqa">Zarqa</option>
              <option value="aqaba">Aqaba</option>
              <option value="ajloun">Ajloun</option>
              <option value="jerash">Jerash</option>
              <option value="mafraq">Mafraq</option>
              <option value="balqa">Balqa</option>
              <option value="karak">Karak</option>
              <option value="tafilah">Tafilah</option>
              <option value="ma'an">Ma'an</option>
              <option value="madaba">Madaba</option>
            </select>
          </div>

          <div className="col-12 d-flex align-items-center flex-wrap gap-2 mt-2">
            <Filter className="text-muted" size={20} />
            {categories.map((kind) => (
              <button
                key={kind.id}
                onClick={() => {
                  setSelectedkind(kind.id);
                  setVisibleCount(6);
                }}
                className={`btn btn-sm ${
                  selectedkind === kind.id
                    ? "btn-primary text-white"
                    : "btn-primary"
                }`}
              >
                {kind.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="row g-4">
        {filteredDonations.slice(0, visibleCount).map((donation, index) => (
          <div
            key={donation._id}
            className="col-md-6 col-lg-4"
            data-aos="fade-up"
            data-aos-delay={index * 100}
          >
            <DonationCard
              donation={donation}
              onSelect={setSelectedId}
              isSelected={donation._id === selectedId}
            />
          </div>
        ))}
        <div ref={observerTarget}></div>
      </div>
    </div>
  );
};

export default Donations;
