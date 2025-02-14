const mongoose = require("mongoose");

const DonationsSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  userId: { type: String, required: true, unique: true },
  amount: { type: Number, default: 0 },
});

module.exports = mongoose.model("Donations", DonationsSchema);