const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // No duplicate emails allowed
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    targets: {
      targetRole: { type: String, default: "" },
      targetDate: { type: String, default: "" }, // ISO date string "YYYY-MM-DD"
      salary: { type: String, default: "" },
      applicationTarget: { type: Number, default: 20, min: 1 },
    },
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema)

module.exports = User