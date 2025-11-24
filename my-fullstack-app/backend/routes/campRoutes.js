const express = require("express");
const router = express.Router();
const { getCamps, createCamp } = require("../controllers/campController");
const { protect } = require("../middleware/authMiddleware");

router.route("/").get(getCamps).post(protect, createCamp);

module.exports = router;
