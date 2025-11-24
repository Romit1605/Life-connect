const express = require("express");
const router = express.Router();
const { getDonations, createDonation } = require("../controllers/donationController");
const { protect } = require("../middleware/authMiddleware");

router.route("/").get(protect, getDonations).post(protect, createDonation);

module.exports = router;
