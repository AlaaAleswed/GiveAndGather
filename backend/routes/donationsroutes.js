const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');



const {
  createDonation,
  getAllDonations,
  getDonationsByUser, 
  updateDonation,
  deleteDonation,
  getDonationById,
  updateDonationStatus ,
  getSimilarDonations,
  getDonationsByUserId,
} = require('../controllers/donationController');

console.log("📡 donationsroutes.js LOADED");


router.get('/similar', getSimilarDonations);

const upload = require('../middlewares/upload');
const { protect, adminOnly } = require('../middlewares/auth');


router.patch('/:id/status', protect, updateDonationStatus);

// Create donation with image upload (authenticated users only)
router.post('/', protect, upload.array('images', 1), createDonation);

// Get all donations
router.get('/', getAllDonations);



router.get('/user', protect, getDonationsByUser);

router.get('/user/:userId', protect, getDonationsByUser);

// Get single donation by ID
router.get('/:id', protect, getDonationById);


// Update a donation (authenticated)
router.put('/:id', protect, upload.array('images', 5), updateDonation);

// Delete a donation (authenticated)
router.delete('/:id', protect, deleteDonation);

// Admin-only delete route
router.delete('/admin/:id', protect, adminOnly, deleteDonation);


router.get("/byUser/:id", getDonationsByUserId); 

// GET /donations/most-interested
router.get('/most-interested', async (req, res) => {
  try {
    const result = await Donation.aggregate([
      {
        $lookup: {
          from: 'UserActivity', // تأكد أن اسم المجموعة مطابق لاسمها في MongoDB
          localField: '_id',
          foreignField: 'donation',
          as: 'views'
        }
      },
      {
        $addFields: {
          viewCount: { $size: '$views' }
        }
      },
      { $sort: { viewCount: -1 } },
      { $limit: 8 },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' }
    ]);

    res.json(result);
  } catch (error) {
    console.error("🔥 ERROR in /most-interested:", error); // اطبع الخطأ كامل
    res.status(500).json({
      message: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;
