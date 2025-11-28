const express = require("express");
const router = express.Router();
const { getCamps, getCampById, createCamp, updateCamp, deleteCamp } = require("../controllers/campController");
const { protect } = require("../middleware/authMiddleware");

router.route("/").get(getCamps).post(protect, createCamp);
router.route("/:id").get(getCampById).put(protect, updateCamp).delete(protect, deleteCamp);

module.exports = router;
