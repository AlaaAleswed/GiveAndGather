import React, { useEffect, useState } from "react";
import {
  Mail,
  MapPin,
  Phone,
  Calendar,
  Pencil,
  MessageSquare,
  Bookmark,
  BookOpen,
  Info,
  MoreVertical,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useUser } from "../context/UserContext";

axios.defaults.baseURL = "http://localhost:5050/api";
axios.defaults.withCredentials = true;

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("about");
  const [backgroundImage, setbackgroundImage] = useState(
    "/src/assets/relax.png"
  );
  const [userDonations, setUserDonations] = useState([]);
  const [savedDonations, setSavedDonations] = useState([]);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const { id } = useParams();
  const isOwnProfile = !id; // إذا لم يكن هناك ID، فهذا هو المستخدم الحالي
  const { fetchUser } = useUser();
  const [profileImageFile, setProfileImageFile] = useState(null); // جديد
  const [backgroundImageFile, setBackgroundImageFile] = useState(null);

  const handleMessageClick = () => navigate("/chat");

  const handlebackgroundImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackgroundImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setbackgroundImage(imageUrl);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file); // حفظ الملف الحقيقي
      const imageUrl = URL.createObjectURL(file);
      setEditedProfile((prev) => ({ ...prev, profileImage: imageUrl }));
    }
  };

  const handleEditDonation = (donation) => {
    navigate(`/edit-donation/${donation._id}`);
  };

  const handleDeleteDonation = async (donation) => {
    if (window.confirm("Are you sure you want to delete this donation?")) {
      try {
        await axios.delete(`/donations/${donation._id}`, {
          withCredentials: true,
        });
        setUserDonations((prev) => prev.filter((d) => d._id !== donation._id));
        setActiveMenuId(null);
      } catch (err) {
        console.error("❌ Failed to delete donation:", err.message);
        alert("Failed to delete donation.");
      }
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", editedProfile.name);
      formData.append("phone", editedProfile.phone);
      formData.append("location", editedProfile.location);
      formData.append("description", editedProfile.description);
      if (profileImageFile) {
        formData.append("profileImage", profileImageFile);
      }
      if (backgroundImageFile) {
        formData.append("backgroundImage", backgroundImageFile);
      }
      const res = await axios.put("/users/profile", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updated = {
        ...res.data,
        profileImage: res.data.profileImage
          ? `http://localhost:5050/uploads/${res.data.profileImage}`
          : "/assets/user.png",
        backgroundImage: res.data.backgroundImage
          ? `http://localhost:5050/uploads/${res.data.backgroundImage}`
          : "/src/assets/relax.png",
      };
      setProfile(updated); // ✅ استخدم updated
      setEditedProfile(updated); // ✅ استخدم updated
      await fetchUser(); // ✅ لتحديث Navbar
      setIsEditing(false);
    } catch (err) {
      console.error("❌ Failed to update profile", err.message);
      alert("Failed to update profile.");
    }
  };

  const fetchProfile = async () => {
    try {
      const url = id ? `/users/${id}` : "/users/profile";
      const res = await axios.get(url, { withCredentials: true });
      if (!res.data) return navigate("/auth");
      const parsed = res.data;
      const profileData = {
        name: parsed.name,
        location: parsed.location || "Not set",
        email: parsed.email,
        phone: parsed.phone,
        description: parsed.description || "Helping others is my passion.",
        backgroundImage: parsed.backgroundImage?.startsWith("http")
          ? parsed.backgroundImage
          : parsed.backgroundImage
          ? `http://localhost:5050/uploads/${parsed.backgroundImage}`
          : "/assets/relax.png",
        profileImage: parsed.profileImage?.startsWith("http")
          ? parsed.profileImage
          : parsed.profileImage
          ? `http://localhost:5050/uploads/${parsed.profileImage}`
          : "/assets/user.png",
        joinDate: parsed?.createdAt
          ? `Since ${new Date(parsed.createdAt).toLocaleDateString("en-GB", {
              year: "numeric",
              month: "long",
            })}`
          : "Join date not available",
      };
      setProfile(profileData);
      setEditedProfile(profileData);
      setbackgroundImage(profileData.backgroundImage); // ✅ أضف هذا
      if (isOwnProfile) {
        const [userDonationsRes, savedDonationsRes] = await Promise.all([
          axios.get("/donations/user", { withCredentials: true }),
          axios.get("/saved", { withCredentials: true }),
        ]);
        setUserDonations(userDonationsRes.data);
        setSavedDonations(savedDonationsRes.data);
      } else {
        const donationsRes = await axios.get(`/donations/byUser/${id}`, {
          withCredentials: true,
        });
        setUserDonations(donationsRes.data);
      }
    } catch (err) {
      console.error("❌ Failed to fetch profile", err.message);
      navigate("/auth");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [navigate]);
  if (!profile) return <p>Loading profile...</p>;

  return (
    <div className="container py-4">
      <div className="card shadow-lg">
        <div className="position-relative">
          <div
            className="w-100"
            style={{
              height: "220px",
              backgroundImage: `url(${
                backgroundImage?.includes("http")
                  ? backgroundImage
                  : `http://localhost:5050/uploads/${backgroundImage}`
              })`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderTopLeftRadius: "0.5rem",
              borderTopRightRadius: "0.5rem",
            }}
          />
          {isEditing && (
            <label className="position-absolute top-0 end-0 m-3 btn btn-sm btn-light shadow">
              Change Cover
              <input
                type="file"
                accept="image/*"
                onChange={handlebackgroundImageChange}
                style={{ display: "none" }}
              />
            </label>
          )}
          <div
            className="position-absolute"
            style={{ left: "30px", top: "150px" }}
          >
            <label style={{ cursor: isEditing ? "pointer" : "default" }}>
              <img
                src={
                  profileImageFile
                    ? URL.createObjectURL(profileImageFile)
                    : editedProfile?.profileImage?.includes("uploads")
                    ? editedProfile.profileImage
                    : "/assets/user.png"
                }
                alt="Profile"
                className="rounded-circle border border-1 border-white shadow"
                width={100}
                height={100}
                style={{ objectFit: "cover" }}
                onError={(e) => {
                  e.target.src = "/assets/user.png";
                }}
              />
              {isEditing && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              )}
            </label>
          </div>
        </div>

        <div className="card-body pt-5 mt-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              {isEditing ? (
                <input
                  type="text"
                  className="form-control fw-bold"
                  value={editedProfile.name}
                  onChange={(e) =>
                    setEditedProfile({ ...editedProfile, name: e.target.value })
                  }
                />
              ) : (
                <h3 className="fw-bold">{profile.name}</h3>
              )}
              {isEditing ? (
                <textarea
                  className="form-control mt-2"
                  value={editedProfile.description}
                  onChange={(e) =>
                    setEditedProfile({
                      ...editedProfile,
                      description: e.target.value,
                    })
                  }
                />
              ) : (
                <p className="text-muted">{profile.description}</p>
              )}
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-primary" onClick={handleMessageClick}>
                <MessageSquare size={16} className="me-1" /> Message
              </button>
              {isOwnProfile && (
                <button
                  className={`btn ${isEditing ? "btn-success" : "btn-primary"}`}
                  onClick={isEditing ? handleSave : () => setIsEditing(true)}
                >
                  <Pencil size={16} className="me-1" />{" "}
                  {isEditing ? "Save" : "Edit"}
                </button>
              )}
            </div>
          </div>

          <ul className="nav nav-pills mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "about" ? "active" : ""}`}
                onClick={() => setActiveTab("about")}
              >
                <Info size={16} className="me-1" /> About
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "donations" ? "active" : ""
                }`}
                onClick={() => setActiveTab("donations")}
              >
                <BookOpen size={16} className="me-1" /> Donations
              </button>
            </li>
            <li className="nav-item">
              {isOwnProfile && (
                <button
                  className={`nav-link ${
                    activeTab === "saved" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("saved")}
                >
                  <Bookmark size={16} className="me-1" /> Saved
                </button>
              )}
            </li>
          </ul>

          {activeTab === "about" && (
            <div className="row">
              <div className="col-md-6">
                <p>
                  <MapPin size={16} className="me-2 text-primary" />{" "}
                  {profile.location}
                </p>
                <p>
                  <Phone size={16} className="me-2 text-primary" />{" "}
                  {profile.phone}
                </p>
                <p>
                  <Calendar size={16} className="me-2 text-primary" />{" "}
                  {profile.joinDate}
                </p>
              </div>
              <div className="col-md-6">
                <p>
                  <Mail size={16} className="me-2 text-primary" />{" "}
                  {profile.email}
                </p>
              </div>
            </div>
          )}

          {activeTab === "donations" &&
            (userDonations.length > 0 ? (
              <div className="list-group">
                {userDonations.map((donation) => {
                  const isValid = donation.isValid !== false;
                  console.log(donation.title, "=>", donation.isValid);

                  return (
                    <div
                      key={donation._id}
                      className="list-group-item list-group-item-action d-flex align-items-center gap-3 shadow-sm rounded mb-3"
                      style={{ cursor: "pointer" }}
                    >
                      <img
                        src={
                          donation.images?.[0]
                            ? `http://localhost:5050/uploads/${donation.images[0]}`
                            : "https://via.placeholder.com/100x100"
                        }
                        alt={donation.title}
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                      <div className="flex-grow-1">
                        <h5 className="mb-1">{donation.title}</h5>
                        <p className="mb-1 text-muted">
                          {donation.kind || donation.kind} - {donation.location}
                        </p>
                      </div>

                      {/* 3-dot menu */}
                      {isOwnProfile && (
                        <div
                          className="position-absolute"
                          style={{
                            top: "10px",
                            right: "10px",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            setActiveMenuId((prev) =>
                              prev === donation._id ? null : donation._id
                            )
                          }
                        >
                          <MoreVertical size={20} />
                        </div>
                      )}

                      {/* Menu popup */}
                      {isOwnProfile && activeMenuId === donation._id && (
                        <div
                          className="position-absolute"
                          style={{
                            top: "35px",
                            right: "10px",
                            zIndex: 1000,
                            background: "#fff",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                            padding: "4px",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                          }}
                        >
                          <div
                            className="text-dark px-3 py-1 hover-bg"
                            style={{ cursor: "pointer", fontSize: "14px" }}
                            onClick={(e) => {
                              e.stopPropagation(); // ✅ أوقف الفقاعة
                              handleEditDonation(donation);
                            }}
                          >
                            Edit
                          </div>
                          <div
                            className="text-danger px-3 py-1 hover-bg"
                            style={{ cursor: "pointer", fontSize: "14px" }}
                            onClick={() => handleDeleteDonation(donation)}
                          >
                            Delete
                          </div>
                        </div>
                      )}

                      <button
                        disabled={!isOwnProfile} // ✅ منع التعديل
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!isOwnProfile) return; // حماية إضافية

                          const confirmed = window.confirm(
                            isValid
                              ? "Are you sure you want to mark this donation as Picked?"
                              : "Are you sure you want to mark this donation as Available?"
                          );
                          if (!confirmed) return;

                          try {
                            await axios.patch(
                              `/donations/${donation._id}/status`,
                              { isValid: !isValid },
                              { withCredentials: true }
                            );

                            setUserDonations((prev) =>
                              prev.map((d) =>
                                d._id === donation._id
                                  ? { ...d, isValid: !isValid }
                                  : d
                              )
                            );
                          } catch (err) {
                            console.error(
                              "❌ Failed to update donation status:",
                              err.message
                            );
                            alert("Failed to update status.");
                          }
                        }}
                        className={`btn btn-sm ${
                          isValid ? "btn-success" : "btn-secondary"
                        }`}
                      >
                        {isValid ? "Available" : "Picked"}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>No donations added yet.</p>
            ))}

          {isOwnProfile &&
            activeTab === "saved" &&
            (savedDonations.length > 0 ? (
              <div className="list-group">
                {savedDonations.map((don) => (
                  <div
                    key={don._id}
                    className="list-group-item list-group-item-action d-flex align-items-center gap-3 shadow-sm rounded mb-3"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/donations/${don._id}`)}
                  >
                    <img
                      src={
                        don.images?.[0]
                          ? `http://localhost:5050/uploads/${don.images[0]}`
                          : "https://via.placeholder.com/100x100"
                      }
                      alt={don.title}
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                    <div>
                      <h5 className="mb-1">{don.title}</h5>
                      <p className="mb-1 text-muted">
                        {don.kind} - {don.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No saved donations yet.</p>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
