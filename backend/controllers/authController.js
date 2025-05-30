const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");

// Register
exports.register = async (req, res) => {
  const { name, email, password, confirmPassword, phone, location } = req.body;

  // تحقق من وجود كل الحقول المطلوبة
  if (!name || !email || !password || !confirmPassword || !phone || !location) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      location,
    });

    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        country: user.country,
      },
    });
  } catch (err) {
    console.error("❌ Error registering user:", err.message);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// Login
// exports.login = async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const user = await User.findOne({ email });
//         if (!user || !(await bcrypt.compare(password, user.password))) {
//             return res.status(401).json({ message: 'Invalid credentials' });
//         }

//         const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//             expiresIn: '2h'
//         });

//         const { password: pwd, ...userData } = user._doc;
//         res.json({ token, user: userData });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log("📥 Login attempt:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Password incorrect");
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (user.isBanned) {
      return res.status(403).json({ message: "Your account has been banned. Please contact support." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    const { password: pwd, ...userData } = user.toObject();

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // ← اجعله دائمًا false في بيئة التطوير
      sameSite: "Lax", // ← أفضل من Strict لتسمح بإرسال الكوكي من React إلى Express
      maxAge: 2 * 60 * 60 * 1000,
    });

    console.log("✅ Login success:", user.email);
    res.json({
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (err) {
    console.error("🔥 Server error:", err.message);
    res.status(500).json({ message: "Server error during login" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token"); // حذف الكوكي
  res.json({ message: "Logged out successfully" });
};

// const User = require('../models/User');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// exports.register = async (req, res) => {
//     const { name, email, password } = req.body;
//     try {
//         const hashed = await bcrypt.hash(password, 10);
//         const user = await User.create({ name, email, password: hashed });
//         res.status(201).json(user);
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// };

// exports.login = async (req, res) => {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user || !await bcrypt.compare(password, user.password))
//         return res.status(401).json({ message: 'Invalid credentials' });

//     console.log('JWT_SECRET:', process.env.JWT_SECRET);

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

//     res.json({ token });
// };
