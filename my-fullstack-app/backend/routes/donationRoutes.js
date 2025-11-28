const express = require("express");
const router = express.Router();
const { getDonations, getAllDonations, getDonationStats, createDonation, updateDonation, deleteDonation } = require("../controllers/donationController");
const { protect } = require("../middleware/authMiddleware");

router.route("/").get(protect, getDonations).post(protect, createDonation);
router.get("/all", getAllDonations);
router.get("/stats", getDonationStats);
router.route("/:id").put(protect, updateDonation).delete(protect, deleteDonation);

module.exports = router;
