const Donation = require("../models/Donation");
const mongoose = require("mongoose");
const UserActivity = require("../models/UserActivity");

// Create Donation
exports.createDonation = async (req, res) => {
  try {
    if (!req.files || req.files.length < 1) {
      return res
        .status(400)
        .json({ message: "At least 1 images are required" });
    }

    // ✅ تحقق من الحقول الإضافية حسب النوع
    if (req.body.kind === "food" && !req.body.expireDate) {
      return res
        .status(400)
        .json({ message: "Expire date is required for food donations" });
    }

    if (!req.body.condition || !["new", "used"].includes(req.body.condition)) {
      return res
        .status(400)
        .json({ message: "Condition (new/used) is required" });
    }

    const images = req.files.map((file) => file.filename);

    const donation = await Donation.create({
      ...req.body,
      user: req.user._id,
      images,
       isValid: true 
    });

    res.status(201).json(donation);
  } catch (err) {
    res.status(500).json({ message: "Create donation failed: " + err.message });
  }
};

// Get All Donations (with optional filters: kind & location)
exports.getAllDonations = async (req, res) => {
  try {
    const { kind, location } = req.query;

    // Build dynamic filter
    const filter = {};
    if (kind) filter.kind = kind.toLowerCase();
    if (location) filter.location = location.toLowerCase();

    const donations = await Donation.find(filter).populate("user", "name");
    res.json(donations);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch donations: " + err.message });
  }
};

// Get Donations By User
exports.getDonationsByUser = async (req, res) => {
  console.log("🔥 getDonationsByUser controller HIT");

  try {
    console.log("🔍 Fetching donations for user:", req.user._id);

    const donations = await Donation.find({ user: req.user._id }).populate(
      "user",
      "name"
    );
    console.log("✅ Donations fetched:", donations.length);

    res.json(donations);
  } catch (err) {
    console.error("❌ Failed to fetch donations:", err.stack);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// Get Donation By ID
exports.getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id).populate(
      "user",
      "name"
    );
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    // await UserActivity.create({
    //   user: req.user._id, // تأكد أنك تستخدم توكن يحتوي user
    //   donation: donation._id,
    //   action: "view",
    // });
    res.json(donation);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch donation" });
  }
};

// Update Donation
exports.updateDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    // فقط صاحب التبرع يمكنه التعديل
    if (donation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const {
      title,
      kind,
      location,
      description,
      condition,
      expirationDate,
      existingImages,
    } = req.body;
    donation.title = title;
    donation.kind = kind;
    donation.location = location;
    donation.description = description;
    donation.condition = condition;
    donation.expirationDate = expirationDate;
    const keptImages = JSON.parse(existingImages || "[]");
    // أضف الصور الجديدة
    const uploadedImages = req.files
      ? req.files.map((file) => file.filename)
      : [];
    donation.images = [...keptImages, ...uploadedImages];
    await donation.save();
    res.json(donation);
  } catch (err) {
    console.error("❌ Error updating donation:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateDonationStatus = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    // فقط المستخدم الذي أنشأ التبرع يمكنه تعديله
    if (donation.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not allowed to update this donation" });
    }
    // الحالة الجديدة تأتي من body
    const { isValid } = req.body;
    donation.isValid = isValid;
    await donation.save();
    res.json({ message: "Status updated successfully", donation });
  } catch (err) {
    console.error("❌ Error updating donation:", err.stack);
    res.status(500).json({ message: "Failed to update status" });
  }
};

exports.getSimilarDonations = async (req, res) => {
  console.log("🔥🔥🔥 getSimilarDonations HIT", req.query);
  try {
    const { kind, excludeId } = req.query;

    if (!kind || !excludeId) {
      return res.status(400).json({ message: "Missing parameters" });
    }

    // تحويل excludeId إلى ObjectId بشكل صحيح
    const excludeObjectId = new mongoose.Types.ObjectId(excludeId);

    const donations = await Donation.find({
      kind,
      _id: { $ne: excludeObjectId },
    }).limit(6);

    res.json(donations);
  } catch (err) {
    console.error("❌ Similar Donation Error:", err); // تأكد من الطباعة
    res.status(500).json({ message: "Failed to fetch donation" });
  }
};

// Delete Donation
exports.deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation)
      return res.status(404).json({ message: "Donation not found" });

    // ✅ Check ownership
    if (donation.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized: Not your donation" });
    }

    await donation.deleteOne();
    res.json({ message: "Donation deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Deletion failed: " + err.message });
  }
};
exports.getDonationsByUserId = async (req, res) => {
  try {
    const donations = await Donation.find({ user: req.params.id }).populate(
      "user",
      "name"
    );
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// const Donation = require('../models/Donation');

// const mongoose = require('mongoose');

// exports.createDonation = async (req, res) => {
//     try {

//         console.log("User ID:", req.user && req.user._id);

//         console.log("Body:", req.body);
//         console.log("Files:", req.files);

//       if (!req.files || req.files.length < 2) {
//         return res.status(400).json({ message: 'At least 2 images are required' });
//       }

//       const images = req.files.map(file => file.filename);

//       const donation = await Donation.create({
//         ...req.body,
//         user: req.user._id,
//         images
//       });

//       res.status(201).json(donation);
//     } catch (err) {
//       console.error('Create Donation Error:', err.message);
//       res.status(500).json({ message: err.message });
//     }
//   };

//   exports.getAllDonations = async (req, res) => {
//     try {
//       const donations = await Donation.find().populate('user', 'name');
//       res.json(donations);
//     } catch (err) {
//       res.status(500).json({ message: err.message });
//     }
//   };

// exports.getDonationsByUser = async (req, res) => {
//   try {
//     const userId = new mongoose.Types.ObjectId(req.params.userId);
//     const donations = await Donation.find({ user: userId }).populate('user', 'name');
//     res.json(donations);
//   } catch (err) {
//     res.status(500).json({ message: 'Invalid user ID or server error' });
//   }
// };

// exports.updateDonation = async (req, res) => {
//     const donation = await Donation.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.json(donation);
// };

// exports.deleteDonation = async (req, res) => {
//     await Donation.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Deleted' });
// };

// exports.getDonationById = async (req, res) => {
//     try {
//       const donation = await Donation.findById(req.params.id).populate('user', 'name');
//       if (!donation) return res.status(404).json({ message: 'Donation not found' });
//       res.json(donation);
//     } catch (err) {
//       res.status(500).json({ message: err.message });
//     }
//   };
