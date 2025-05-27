// const multer = require('multer');
// const path = require('path');

// // 🎯 الإعدادات للتخزين
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/messages/');
//   },
//   filename: function (req, file, cb) {
//     const ext = path.extname(file.originalname);
//     const filename = Date.now() + ext;
//     cb(null, filename);
//   }
// });

// // ✅ أنواع الملفات المسموحة
// const fileFilter = (req, file, cb) => {
//   const allowed = /jpeg|jpg|png|pdf/;
//   const ext = allowed.test(path.extname(file.originalname).toLowerCase());
//   const mime = allowed.test(file.mimetype);
//   if (ext && mime) return cb(null, true);
//   cb(new Error('Only images and PDFs are allowed'));
// };

// // 📦 إعدادات Multer النهائية
// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 5 * 1024 * 1024 } // 5MB كحد أقصى
// });

// module.exports = upload;



const multer = require('multer');
const path = require('path');

// 🎯 إعدادات التخزين
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext;
    cb(null, filename);
  }
});

// ✅ أنواع الملفات المسموحة (صور - صوت - فيديو - مستندات)
const allowedExtensions = [
  '.jpg', '.jpeg', '.png',
  '.pdf', '.docx', '.xlsx',
  '.mp3', '.wav',
  '.mp4', '.webm'
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'));
  }
};

// 📦 إعدادات Multer النهائية
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB كحد أقصى
});

module.exports = upload;
