const express = require("express");
const router = express.Router();
const { getCamps, getCampById, createCamp, updateCamp, deleteCamp, approveCamp, approveGovernmentCamp, rejectCamp, registerForCamp } = require("../controllers/campController");
const { protect } = require("../middleware/authMiddleware");

router.route("/").get(getCamps).post(protect, createCamp);
router.route("/:id").get(getCampById).put(protect, updateCamp).delete(protect, deleteCamp);
router.route("/:id/approve").put(protect, approveCamp);
router.route("/:id/approve-government").put(protect, approveGovernmentCamp);
router.route("/:id/reject").put(protect, rejectCamp);
router.route("/:id/register").post(protect, registerForCamp);

module.exports = router;
