const express = require("express");
const router = express.Router();
const { getRequests, createRequest } = require("../controllers/requestController");
const { protect } = require("../middleware/authMiddleware");

router.route("/").get(getRequests).post(protect, createRequest);

module.exports = router;
