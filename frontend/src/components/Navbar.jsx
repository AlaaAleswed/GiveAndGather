import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Heart,
  Gift,
  UserCircle,
  MessageCircle,
  LogIn,
  PlusCircle,
  Home,
} from "lucide-react";
import { Dropdown } from "react-bootstrap";
import { Settings } from "lucide-react";
import translations from "../translations";
import axios from "axios";
import { useUser } from "../context/UserContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, setUser, fetchUser } = useUser();
  const lang = localStorage.getItem("language") || "en";
  const t = translations[lang];
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    axios
      .get("/users/profile", { withCredentials: true })
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        setUser(null); // المستخدم غير مسجل دخول
      });
  }, []);


  const textColor = isHome ? "text-light" : "text-dark";

  return (
    <nav
      className={`nav navbar navbar-expand-lg shadow-sm ${
        isHome ? "navbar-dark" : "navbar-light bg-white"
      }`}
      style={{
        // backgroundImage: isHome
        //   ? `linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${donateimage2})`
        //   : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        transition: "background-color 0.3s ease",
        position: "relative", // important: not fixed or sticky
        top: "0",
        width: "100%",
        zIndex: 1000,
      }}
    >
      <div className="container-fluid">
        <Link
          to="/"
          className={`navbar-brand d-flex align-items-center px-3 ${textColor}`}
        >
          <Heart className="me-2 text-primary" />
          <span className={`fw-bold ${textColor}`}>Give & Gather</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`position-relative w-50 collapse navbar-collapse ${
            isOpen ? "show" : ""
          }`}
        >
          <ul className="navl navbar-nav justify-content-end flex-grow-1 pe-3 ms-auto d-flex align-items-center gap-3">
            <li className="nav-item pe-3 py-3">
              <Link
                to="/"
                className={`d-flex align-items-center text-decoration-none ${textColor}`}
              >
                <Home className="me-1" size={18} />
                <span>Home</span>
              </Link>
            </li>
            <li className="nav-item pe-3 py-3">
              <Link
                to={user ? "/add-donation" : "/auth"}
                className={`d-flex align-items-center text-decoration-none ${textColor}`}
              >
                <PlusCircle className="me-1" size={18} />
                <span>add donation</span>
              </Link>
            </li>
            <li className="nav-item pe-3 py-3">
              <Link
                to={user ? "/donations" : "/auth"}
                className={`d-flex align-items-center text-decoration-none ${textColor}`}
              >
                <Gift className="me-1" size={18} />
                <span>{t.donations}</span>
              </Link>
            </li>

            <li className="nav-item pe-3 py-3">
              <Link
                to="/chat"
                className={`d-flex align-items-center text-decoration-none ${textColor}`}
              >
                <MessageCircle className="me-1" size={18} />
                <span>{t.messages}</span>
              </Link>
            </li>

            {user && (
              <li className="nav-item pe-3 py-3">
                <Dropdown align="end">
                  <Dropdown.Toggle
                    as="div"
                    id="dropdownProfile"
                    role="button"
                    aria-expanded="false"
                    className="d-flex align-items-center border-0 bg-transparent"
                    style={{ cursor: "pointer" }}
                  >
                    {user?.profileImage ? (
                      <img
                        src={
                          user.profileImage.startsWith("http")
                            ? user.profileImage
                            : `http://localhost:5050/uploads/${user.profileImage}`
                        }
                        alt="Profile"
                        className="rounded-circle"
                        width="40"
                        height="40"
                        style={{ objectFit: "cover" }}
                        onError={(e) => {
                          e.target.src = "/assets/user.png";
                        }}
                      />
                    ) : (
                      <UserCircle size={32} className="text-secondary" />
                    )}
                  </Dropdown.Toggle>

                  <Dropdown.Menu
                    className="dropdown-menu-end shadow-sm border-0 mt-2"
                    aria-labelledby="dropdownProfile"
                  >
                    <Dropdown.Item
                      as={Link}
                      to={user ? "/profile" : "/auth"}
                      className="d-flex align-items-center text-primary"
                    >
                      <UserCircle className="me-2" size={16} />
                      {t.profile}
                    </Dropdown.Item>
                    <Dropdown.Item
                      as={Link}
                      to={user ? "/settings" : "/auth"}
                      className="d-flex align-items-center text-primary"
                    >
                      <Settings className="me-2" size={16} />
                      {t.settings}
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item
                      as="button"
                      onClick={async () => {
                        try {
                          await axios.post(
                            "/auth/logout",
                            {},
                            { withCredentials: true }
                          );
                          setUser(null); // تحديث الحالة
                          navigate("/auth");
                        } catch (err) {
                          console.error("❌ Logout failed:", err.message);
                          alert("Logout failed");
                        }
                      }}
                      className="d-flex align-items-center text-danger"
                    >
                      <LogIn className="me-2" size={16} />
                      {t.signOut}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </li>
            )}

            {!user && (
              <li className="pe-3 py-2">
                <Link
                  to="/auth"
                  className="btn btn-primary d-flex align-items-center"
                >
                  <LogIn className="me-1" size={18} />
                  <span>Sign In</span>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
