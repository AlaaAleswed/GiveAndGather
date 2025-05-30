import { Bookmark, MapPin, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:5050/api";
axios.defaults.withCredentials = true;

// ✅ حساب الوقت منذ إنشاء التبرع
const formatTimeAgo = (createdAt) => {
  if (!createdAt) return "";
  const now = new Date();
  const createdDate = new Date(createdAt);
  const diffInSeconds = Math.floor((now - createdDate) / 1000);
  const minute = 60;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  if (diffInSeconds < minute) return `${diffInSeconds} second(s) ago`;
  if (diffInSeconds < hour) return `${Math.floor(diffInSeconds / minute)} minute(s) ago`;
  if (diffInSeconds < day) return `${Math.floor(diffInSeconds / hour)} hour(s) ago`;
  if (diffInSeconds < week) return `${Math.floor(diffInSeconds / day)} day(s) ago`;
  return createdDate.toLocaleDateString("en-GB");
};

const DonationCard = ({ donation, onDelete }) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    const checkSaved = async () => {
      try {
        const res = await axios.get("/saved");
        const savedIds = res.data.map((d) => d._id);
        setIsSaved(savedIds.includes(donation._id));
      } catch (err) {
        console.error("❌ Failed to check saved:", err.message);
      }
    };
    checkSaved();
  }, [donation._id]);

  useEffect(() => {
    let interval;
    if (hovered && donation.images?.length > 1) {
      interval = setInterval(() => {
        setImageIndex((prev) => (prev + 1) % donation.images.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [hovered, donation.images]);

  const toggleSave = async (e) => {
    e.stopPropagation();
    try {
      if (isSaved) {
        await axios.delete(`/saved/${donation._id}`);
      } else {
        await axios.post(`/saved/${donation._id}`, {});
      }
      setIsSaved(!isSaved);
    } catch (err) {
      console.error("❌ Failed to toggle save:", err.message);
      alert("Failed to update saved status");
    }
  };

  const currentImage = donation.images?.[imageIndex];
  
  const imageObj = currentImage;
    console.log("🖼️ imageObj:", imageObj);

  const imageUrl =

    typeof imageObj === "string"
      ? imageObj.startsWith("http")
        ? imageObj
        : `http://localhost:5050/uploads/${imageObj}`
      : `http://localhost:5050/uploads/${imageObj?.filename || imageObj?.name || ""}`;
  const validImage = imageUrl && imageUrl !== "http://localhost:5050/uploads/";

  return (
    <div
      className="card h-100 w-100 position-relative"
      onClick={() => navigate(`/donations/${donation._id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setImageIndex(0);
      }}
      style={{ cursor: "pointer" }}
    >
      <div className="position-absolute top-0 end-0 p-2 d-flex gap-2">
        <Bookmark
          size={20}
          color={isSaved ? "#007bff" : "#aaa"}
          fill={isSaved ? "#007bff" : "none"}
          style={{ cursor: "pointer" }}
          onClick={toggleSave}
        />
      </div>

      <div style={{ height: "60%", overflow: "hidden", width: "100%", paddingTop: "8px" }}>
        <img
          src={validImage ? imageUrl : "/assets/noImage.png"}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/assets/noImage.png";
          }}
          alt={donation.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "0.5s" }}
        />
      </div>

      <div className="card-body d-flex flex-column bg-white">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="badge bg-primary text-light text-capitalize px-3 py-1 rounded-pill">
            {donation.kind}
          </span>
          <small className="text-muted">{formatTimeAgo(donation.createdAt)}</small>
        </div>

        <h5 className="card-title mb-2 fw-semibold">{donation.title}</h5>

        <div className="d-flex align-items-center text-muted small mb-3">
          <MapPin size={14} className="me-1" />
          <span>{donation.location}</span>
        </div>

        <button
          type="button"
          className="btn-animated mt-auto d-flex align-items-center gap-1"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/donations/${donation._id}`);
          }}
        >
          <span>View Details</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default DonationCard;
