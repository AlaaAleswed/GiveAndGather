import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Moon, Globe, Mail, Phone, Lock, Eye, MapPin } from "lucide-react";
import { Tab, Nav, Alert } from "react-bootstrap";
import axios from "axios";

const SettingsPage = ({ setTheme, setLanguage }) => {
  const [settings, setSettings] = useState({
    email: "",
    phone: "",
    governorate: "",
    language: "en",
    theme: "light",
    newPassword: "",
    confirmPassword: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);

  const governorates = [
    "Amman", "Irbid", "Zarqa", "Aqaba", "Ajloun", "Jerash", "Mafraq",
    "Balqa", "Karak", "Tafilah", "Ma'an", "Madaba"
  ];

  // ⬅️ Load user data from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/users/profile", { withCredentials: true });
        setSettings((prev) => ({
          ...prev,
          email: res.data.email,
          phone: res.data.phone,
          governorate: res.data.location || "",
          language: res.data.language || "en",
          theme: res.data.theme || "light",
        }));
        setLanguage(res.data.language || "en");
        setTheme(res.data.theme || "light");
        document.body.setAttribute("data-theme", res.data.theme || "light");
      } catch (err) {
        setError("Failed to load profile");
      }
    };
    fetchProfile();
  }, [setLanguage, setTheme]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      // ✅ Update general info
      await axios.put("/users/profile", {
        email: settings.email,
        phone: settings.phone,
        location: settings.governorate,
        language: settings.language,
        theme: settings.theme,
      }, { withCredentials: true });

      // ✅ Change password if needed
      if (settings.newPassword) {
        if (settings.newPassword !== settings.confirmPassword) {
          alert("Passwords do not match");
          return;
        }
        await axios.post("/auth/change-password", {
          newPassword: settings.newPassword,
          confirmPassword: settings.confirmPassword,
        }, { withCredentials: true });
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save settings");
    }
  };

  return (
    <div className="container py-5" style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <div className="card shadow border-0">
        <div className="card-body p-4">
          <h3 className="mb-4 border-bottom pb-2">⚙️ Settings</h3>

          {showSuccess && (
            <Alert variant="success" className="fade show">
              Settings saved successfully!
            </Alert>
          )}
          {error && (
            <Alert variant="danger" className="fade show">
              {error}
            </Alert>
          )}

          <Tab.Container defaultActiveKey="account">
            <Nav variant="tabs" className="mb-4">
              <Nav.Item><Nav.Link eventKey="account">Account Info</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="preferences">Preferences</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="security">Security</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="danger" className="text-danger">Danger Zone</Nav.Link></Nav.Item>
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey="account">
                <div className="mb-3"><Mail className="me-2 text-muted" />
                  <input type="email" name="email" value={settings.email} onChange={handleChange} className="form-control" />
                </div>
                <div className="mb-3"><Phone className="me-2 text-muted" />
                  <input type="tel" name="phone" value={settings.phone} onChange={handleChange} className="form-control" />
                </div>
                <div className="mb-3"><MapPin className="me-2 text-muted" />
                  <select name="governorate" className="form-select" value={settings.governorate} onChange={handleChange}>
                    <option value="">Select a Governorate</option>
                    {governorates.map((gov) => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>
              </Tab.Pane>

              <Tab.Pane eventKey="preferences">
                <div className="mb-3"><Moon className="me-2 text-muted" />
                  <select name="theme" className="form-select" value={settings.theme} onChange={handleChange}>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
                <div className="mb-3"><Globe className="me-2 text-muted" />
                  <select name="language" className="form-select" value={settings.language} onChange={handleChange}>
                    <option value="en">English</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>
              </Tab.Pane>

              <Tab.Pane eventKey="security">
                <div className="mb-3"><Lock className="me-2 text-muted" />
                  <input type="password" name="newPassword" className="form-control" value={settings.newPassword} onChange={handleChange} placeholder="New password" />
                </div>
                <div className="mb-3"><Eye className="me-2 text-muted" />
                  <input type="password" name="confirmPassword" className="form-control" value={settings.confirmPassword} onChange={handleChange} placeholder="Confirm password" />
                </div>
              </Tab.Pane>

              <Tab.Pane eventKey="danger">
                <div className="alert alert-warning d-flex align-items-center gap-2">
                  ⚠️ <strong>Danger Zone:</strong> Deleting your account is irreversible.
                </div>
                <div className="text-end">
                  <button className="btn btn-danger px-4" onClick={() => alert("Account deletion not yet implemented.")}>
                    Delete Account
                  </button>
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>

          <div className="text-end p-3">
            <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
