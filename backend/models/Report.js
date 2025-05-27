const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetType: { type: String, enum: ["user", "donation"], required: true },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    donation: { type: mongoose.Schema.Types.ObjectId, ref: "Donation" },
    reason: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
