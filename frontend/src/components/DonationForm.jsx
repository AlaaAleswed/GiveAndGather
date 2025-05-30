import React, { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:5050/api";
axios.defaults.withCredentials = true;

const DonationForm = ({ mode = "add", donation = null }) => {
  const [title, setTitle] = useState("");
  const [kind, setkind] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState([]);
  const [expirationDate, setExpirationDate] = useState("");
  const [condition, setCondition] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const navigate = useNavigate();

  const governorates = [
    "Amman",
    "Irbid",
    "Zarqa",
    "Aqaba",
    "Ajloun",
    "Jerash",
    "Mafraq",
    "Balqa",
    "Karak",
    "Tafilah",
    "Ma'an",
    "Madaba",
  ];

  useEffect(() => {
    if (mode === "edit" && donation) {
      setTitle(donation.title);
      setkind(donation.kind);
      setDescription(donation.description);
      setLocation(donation.location);
      setCondition(donation.condition);
      setExpirationDate(donation.expirationDate || "");
      setExistingImages(donation.images || []);
    }
  }, [mode, donation]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).filter((file) =>
      file.name.match(/\.(jpg|jpeg|png|gif)$/i)
    );
    const readers = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ file, preview: reader.result });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((results) => {
      setImages((prev) => [...prev, ...results]);
      setNewImages((prev) => [...prev, ...results]); // ✅ ضروري
    });
  };

  const removeOldImage = (index) => {
    const updated = [...existingImages];
    updated.splice(index, 1);
    setExistingImages(updated);
  };

  const removeNewImage = (index) => {
    const updated = [...newImages];
    updated.splice(index, 1);
    setNewImages(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("kind", kind);
      formData.append("description", description);
      formData.append("location", location);
      // formData.append("expireDate", expirationDate);
      formData.append("condition", condition);
      formData.append("existingImages", JSON.stringify(existingImages));

      if (kind === "food") {
        if (!expirationDate) {
          alert("Please provide an expiration date for food donations.");
          return;
        }
        formData.append("expireDate", expirationDate); // ✅ استخدم الاسم الصحيح
      }

      newImages.forEach((img) => {
        if (img.file) formData.append("images", img.file);
      });

      if (mode === "edit") {
        await axios.put(`/donations/${donation._id}`, formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Donation updated successfully!");
      } else {
        await axios.post("/donations", formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Donation created successfully!");
      }
      navigate("/donations");
    } catch (err) {
      console.error("❌ Failed to submit donation:", err.message);
      alert("Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#f0f4f7",
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
    >
      <div className="container my-auto">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card shadow-lg border-0 rounded-4 mt-5 mb-5">
              <div className="card-body p-4">
                <h2 className="card-title mb-4 text-center">
                  {mode === "add" ? "Add New Donation" : "Edit Donation"}
                </h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={title || ""}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">kind</label>
                    <select
                      className="form-select"
                      value={kind || ""}
                      onChange={(e) => setkind(e.target.value)}
                      required
                    >
                      <option value="">Select a kind</option>
                      <option value="clothes">Clothes</option>
                      <option value="electronics">Electronics</option>
                      <option value="furniture">Furniture</option>
                      <option value="food">Food</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {kind === "food" && (
                    <div className="mb-3">
                      <label className="form-label">Expiration Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={expirationDate || ""}
                        onChange={(e) => setExpirationDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Condition</label>
                    <div>
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="condition"
                          id="new"
                          value="new"
                          checked={condition === "new"}
                          onChange={(e) => setCondition(e.target.value)}
                          required
                        />
                        <label className="form-check-label" htmlFor="new">
                          New
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="condition"
                          id="used"
                          value="used"
                          checked={condition === "used"}
                          onChange={(e) => setCondition(e.target.value)}
                        />
                        <label className="form-check-label" htmlFor="used">
                          Used
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={description || ""}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Location</label>
                    <select
                      className="form-select"
                      value={location || ""}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    >
                      <option value="">Select a location</option>
                      {governorates.map((gov) => (
                        <option key={gov} value={gov || ""}>
                          {gov}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Images</label>
                    <div
                      className="border border-2 rounded p-4 text-center bg-light position-relative cursor-pointer"
                      style={{ borderStyle: "dashed" }}
                      onClick={() =>
                        document.getElementById("fileInput").click()
                      }
                    >
                      <Upload className="text-secondary mb-2" />
                      <p className="text-muted mb-1">
                        Click or drag files to upload
                      </p>
                      <input
                        id="fileInput"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="d-none"
                      />
                    </div>

                    {/* Always reserve space below, even if no images yet */}
                    <div
                      className="mt-3 d-flex flex-wrap gap-3"
                      style={{ minHeight: "110px" }}
                    >
                      {existingImages.map((img, idx) => (
                        <div key={`old-${idx}`} className="position-relative">
                          <img
                            src={img}
                            alt={`old-img-${idx}`}
                            style={{
                              width: "100px",
                              height: "100px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 end-0"
                            style={{ transform: "translate(50%, -50%)" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeOldImage(idx);
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {newImages.map((img, idx) => (
                        <div key={`new-${idx}`} className="position-relative">
                          <img
                            src={img.preview}
                            alt={`new-img-${idx}`}
                            style={{
                              width: "100px",
                              height: "100px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 end-0"
                            style={{ transform: "translate(50%, -50%)" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNewImage(idx);
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                    style={{ opacity: loading ? 0.7 : 1 }}
                  >
                    {loading
                      ? "Saving..."
                      : mode === "add"
                      ? "Save Donation"
                      : "Update Donation"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationForm;
