// src/pages/DonationDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MessageSquare, MapPin, Calendar, Tag, Info, User } from "lucide-react";
import axios from "axios";
import { getOrCreateConversation } from "../api";
import { useUser } from "../context/UserContext";

axios.defaults.baseURL = "http://localhost:5050/api";
axios.defaults.withCredentials = true;

// دالة تنسيق الوقت
const formatTimeAgo = (createdAt) => {
  if (!createdAt) return "";
  const now = new Date();
  const created = new Date(createdAt);
  const diff = Math.floor((now - created) / 1000);
  const minute = 60,
    hour = 3600,
    day = 86400,
    week = 604800;

  if (diff < minute) return `${diff} second(s) ago`;
  if (diff < hour) return `${Math.floor(diff / minute)} minute(s) ago`;
  if (diff < day) return `${Math.floor(diff / hour)} hour(s) ago`;
  if (diff < week) return `${Math.floor(diff / day)} day(s) ago`;
  return created.toLocaleDateString("en-GB"); // e.g. 05/03/2025
};

const DonationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [donation, setDonation] = useState(null);
  const [related, setRelated] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const { user: currentUser } = useUser();

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const res = await axios.get(`/donations/${id}`, {
          withCredentials: true,
        });
        setDonation(res.data);
        // fetch similar donations
        const all = await axios.get("/donations", {
          withCredentials: true,
        });
        const others = all.data.filter(
          (d) => d._id !== id && d.kind === res.data.kind
        );
        setRelated(others);
      } catch (err) {
        console.error("❌ Failed to load donation:", err.message);
        navigate("/donations");
      }
    };
    fetchDonation();
  }, [id, navigate]);

  useEffect(() => {
    let interval;
    if (hovered && donation?.images?.length > 1) {
      interval = setInterval(() => {
        setImageIndex((prev) => (prev + 1) % donation.images.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [hovered, donation]);

  useEffect(() => {
    if (donation?._id) {
      axios.put(`/donations/${donation._id}/interact`).catch((err) => {
        console.error("❌ Failed to track interaction:", err);
      });
    }
  }, [donation?._id]);
  if (!donation) return <p className="text-center mt-5">Loading...</p>;
  const images = donation.images?.length
    ? donation.images
    : ["https://via.placeholder.com/600x300?text=No+Image"];

  return (
    <div className="container py-5">
      <div className="card shadow border-0 overflow-hidden">
        <div
          className="position-relative bg-dark"
          style={{ height: "350px", overflow: "hidden" }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => {
            setHovered(false);
            setImageIndex(0);
          }}
        >
          {images.map((img, idx) => (
            <img
              key={idx}
              src={`http://localhost:5050/uploads/${img}`}
              alt={`slide-${idx}`}
              className="w-100 position-absolute top-0 start-0"
              style={{
                height: "350px",
                objectFit: "cover",
                opacity: imageIndex === idx ? 1 : 0,
                transition: "opacity 1s ease-in-out",
                zIndex: imageIndex === idx ? 2 : 1,
              }}
            />
          ))}

          {/* زر ← السابق */}
          {images.length > 1 && (
            <button
              className="btn btn-light position-absolute top-50 start-0 translate-middle-y"
              style={{ zIndex: 3 }}
              onClick={(e) => {
                e.stopPropagation();
                setImageIndex((prev) =>
                  prev === 0 ? images.length - 1 : prev - 1
                );
              }}
            >
              ‹
            </button>
          )}
          {/* زر → التالي */}
          {images.length > 1 && (
            <button
              className="btn btn-light position-absolute top-50 end-0 translate-middle-y"
              style={{ zIndex: 3 }}
              onClick={(e) => {
                e.stopPropagation();
                setImageIndex((prev) =>
                  prev === images.length - 1 ? 0 : prev + 1
                );
              }}
            >
              ›
            </button>
          )}
        </div>

        {donation.user?.name && (
          <div className="mb-3 d-flex align-items-center text-muted pt-2">
            <User size={18} className="me-2" />
            <span>
              Donor:{" "}
              <span
                style={{
                  color: "#0d6efd",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => navigate(`/profile/${donation.user._id}`)}
              >
                {donation.user.name}
              </span>
            </span>
          </div>
        )}
        <div className="card-body px-5 py-1">
          <h2 className="fw-bold mb-3 text-primary">{donation.title}</h2>
          <small className="text-muted d-block mb-3">
            🕒 Posted {formatTimeAgo(donation.createdAt)}
          </small>

          <div className="mb-3 d-flex align-items-center text-muted">
            <Tag size={18} className="me-2" />
            <span className="text-capitalize">{donation.kind}</span>
          </div>

          <div className="mb-3 d-flex align-items-center text-muted">
            <MapPin size={18} className="me-2" />
            <span>{donation.location}</span>
          </div>

          {donation.expireDate && (
            <div className="mb-3 d-flex align-items-center text-muted">
              <Calendar size={18} className="me-2" />
              <span>
                Expires on: {new Date(donation.expireDate).toLocaleDateString()}
              </span>
            </div>
          )}

          {donation.condition && (
            <div className="mb-3 d-flex align-items-center text-muted">
              <Info size={18} className="me-2" />
              <span>Condition: {donation.condition}</span>
            </div>
          )}

          <p
            className="mt-4 mb-4 text-secondary"
            style={{ fontSize: "1.05rem" }}
          >
            {donation.description}
          </p>

          {donation.user?._id !== currentUser?._id && (
            <button
              className="btn btn-primary rounded-pill mt-3 px-4"
              onClick={async () => {
                try {
                  await axios.put(`/donations/${donation._id}/interact`);
                  await getOrCreateConversation(
                    donation.user._id,
                    donation._id
                  );
                  navigate(`/chat/${donation.user._id}`);
                } catch (err) {
                  console.error("❌ Failed to start chat:", err);
                  alert("Could not start chat. Please try again.");
                }
              }}
            >
              <MessageSquare className="me-2" size={18} /> Contact Donor
            </button>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-5">
          <h4 className="mb-4">More in "{donation.kind}"</h4>
          <div className="row g-4">
            {related.map((item) => (
              <div key={item._id} className="col-md-4">
                <div
                  className="card h-100 shadow-sm hover-zoom"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/donations/${item._id}`)}
                >
                  <img
                    src={
                      item.images?.[0] || "https://via.placeholder.com/300x200"
                    }
                    className="card-img-top"
                    alt={item.title}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{item.title}</h5>
                    <small className="text-muted d-block mb-2">
                      🕒 {formatTimeAgo(item.createdAt)}
                    </small>
                    <p className="card-text text-muted mb-2">
                      {item.location} - {item.condition}
                    </p>
                    <span className="badge bg-secondary text-capitalize">
                      {item.kind}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationDetails;
