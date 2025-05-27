const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');

const {
  requestPasswordReset,
  resetPassword,
  getAllUsers,
  getProfile,
  updateProfile,
  changePassword, // ✅ تمت إضافته
  getUserById,
  updateSettings,
} = require('../controllers/userController');

const { protect, adminOnly } = require('../middlewares/auth');

// تغيير كلمة المرور داخل الحساب (مطلوب تسجيل الدخول)
router.post('/change-password', protect, changePassword);

// طلب تغيير كلمة المرور (بكود عبر الإيميل)
router.post('/request-reset', requestPasswordReset);

// تنفيذ تغيير كلمة المرور (بعد إدخال الكود)
router.post('/reset-password', resetPassword);

// بيانات المستخدم
router.get('/', protect, getAllUsers);

router.get('/profile', protect, getProfile);

router.put('/profile', protect, upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "backgroundImage", maxCount: 1 }
]), updateProfile);

router.get("/:id", getUserById);

router.put('/settings', protect, updateSettings);

module.exports = router;
