const express = require('express');
const router = express.Router();
const { register, login,logout } = require('../controllers/authController');
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout); 

module.exports = router;




// const express = require('express');
// const router = express.Router();

// // Register user
// router.post('/register', (req, res) => {
// res.json({mess:'GET all works'})
// });

// // Login user
// router.post('/login', (req, res) => {
//   // Handle user login
// });

// module.exports = router;
