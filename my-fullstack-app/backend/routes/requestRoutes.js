const express = require("express");
const router = express.Router();
const { getRequests, getRequestById, createRequest, updateRequest, deleteRequest } = require("../controllers/requestController");
const { protect } = require("../middleware/authMiddleware");

router.route("/").get(getRequests).post(protect, createRequest);
router.route("/:id").get(getRequestById).put(protect, updateRequest).delete(protect, deleteRequest);

module.exports = router;
