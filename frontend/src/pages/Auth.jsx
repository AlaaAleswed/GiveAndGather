import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import don from "../assets/don.jpg";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUserContext } from "../context/UserContext";

axios.defaults.baseURL = "http://localhost:5050/api";
axios.defaults.withCredentials = true;

const Auth = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { fetchUser } =useUserContext();
  const [showPhone, setShowPhone] = useState(true);

  const navigate = useNavigate();

  const jordanGovernorates = [
    "Amman",
    "Irbid",
    "Zarqa",
    "Balqa",
    "Madaba",
    "Aqaba",
    "Karak",
    "Tafilah",
    "Ma'an",
    "Jerash",
    "Ajloun",
    "Mafraq",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSignIn && password !== confirmPassword) {
      return alert("Passwords do not match");
    }
    try {
      if (!isSignIn) {
        // REGISTER
        const response = await axios.post("/auth/register", {
          name,
          email,
          password,
          confirmPassword,
          phone,
          location,
            showPhone,
        });
        alert("Registered successfully! You can now sign in.");
        setIsSignIn(true); // الانتقال إلى صفحة تسجيل الدخول
      } else {
        // LOGIN
        const res = await axios.post(
          "/auth/login",
          { email, password },
          { withCredentials: true }
        );
        await fetchUser();
        // const profile = res.data.user;
        navigate("/profile"); // الانتقال إلى الصفحة الرئيسية
      }
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  

  return (
    <div className="container mt-5">
      <div
        className="row justify-content-center align-items-center shadow-lg rounded overflow-hidden"
        style={{ minHeight: "500px" }}
      >
        {/* الصورة */}
        <div className="col-lg-6 d-none d-lg-block p-0">
          <img
            src={don}
            alt="Donate"
            className="img-fluid h-100 w-100"
            style={{ objectFit: "cover" }}
          />
        </div>

        {/* الفورم */}
        <div className="col-lg-6 bg-white p-5">
          <h2 className="text-center mb-4">
            {isSignIn ? "Sign In" : "Sign Up"}
          </h2>
          <form onSubmit={handleSubmit}>
            {!isSignIn && (
              <>
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <input
                  type="tel"
                  className="form-control mb-2"
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <select
                  className="form-control mb-2"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                >
                  <option value="">Select Governorate</option>
                  {jordanGovernorates.map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </select>

<div className="form-check mb-2">
  <input
    type="checkbox"
    className="form-check-input"
    id="showPhone"
    checked={showPhone}
    onChange={(e) => setShowPhone(e.target.checked)}
  />
  <label className="form-check-label" htmlFor="showPhone">
    Allow others to see my phone number
  </label>
</div>


              </>
            )}
            <input
              type="email"
              className="form-control mb-2"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="form-control mb-2"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {!isSignIn && (
              <input
                type="password"
                className="form-control mb-2"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            )}
            <div className="form-check mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="rememberMe"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <label className="form-check-label" htmlFor="rememberMe">
                Remember me
              </label>
            </div>
            <button className="btn btn-primary w-100" type="submit">
              {isSignIn ? "Sign In" : "Sign Up"}
            </button>
          </form>
          <p className="text-center mt-3">
            {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              className="btn btn-link"
              onClick={() => setIsSignIn(!isSignIn)}
            >
              {isSignIn ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
