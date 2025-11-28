const express = require("express");
const router = express.Router();
const {
    addStock,
    getInventory,
    updateStock,
    deleteStock,
} = require("../controllers/medicineController");
const { protect } = require("../middleware/authMiddleware");

router.route("/")
    .post(protect, addStock)
    .get(protect, getInventory);

router.route("/:id")
    .put(protect, updateStock)
    .delete(protect, deleteStock);

module.exports = router;
