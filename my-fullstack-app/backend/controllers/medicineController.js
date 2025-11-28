const Medicine = require("../models/Medicine");

// @desc    Add new medicine stock
// @route   POST /api/medicine
// @access  Private (Pharmacy only)
const addStock = async (req, res) => {
    console.log("=== Add Medicine Request ===");
    console.log("User:", req.user);
    console.log("Body:", req.body);

    const { name, batchNumber, quantity, expiryDate, manufactureDate, manufacturer, notes } = req.body;

    // Check user role
    if (req.user.role !== "pharmacy") {
        console.log("Access denied - user role is not pharmacy:", req.user.role);
        return res.status(403).json({ message: "Not authorized. Pharmacy only." });
    }

    if (!name || !batchNumber || !quantity || !expiryDate) {
        console.log("Validation failed - missing required fields");
        return res.status(400).json({ message: "Please provide all required fields" });
    }

    try {
        const medicine = await Medicine.create({
            pharmacy: req.user.id,
            name,
            batchNumber,
            quantity,
            expiryDate,
            manufactureDate,
            manufacturer,
            notes,
        });

        console.log("Medicine created successfully:", medicine);
        res.status(201).json(medicine);
    } catch (error) {
        console.error("=== Add Medicine Error ===");
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Full error:", error);

        // Return detailed error for debugging
        res.status(500).json({
            message: "Error adding medicine",
            error: error.message,
            details: error.toString()
        });
    }
};

// @desc    Get pharmacy inventory
// @route   GET /api/medicine
// @access  Private
const getInventory = async (req, res) => {
    console.log("=== Get Inventory Request ===");
    console.log("User:", req.user);
    console.log("User Role:", req.user?.role);

    try {
        // Pharmacies see their own stock
        let query = {};

        if (req.user.role === "pharmacy") {
            query.pharmacy = req.user.id;
            console.log("Query:", query);
        } else {
            console.log("Access denied - user role is not pharmacy");
            return res.status(403).json({ message: "Not authorized to view inventory" });
        }

        const inventory = await Medicine.find(query).sort({ expiryDate: 1 });
        console.log("Found inventory items:", inventory.length);
        res.status(200).json(inventory);
    } catch (error) {
        console.error("=== Get Inventory Error ===");
        console.error("Error:", error);
        res.status(500).json({ message: "Error fetching inventory", error: error.message });
    }
};

// @desc    Update medicine stock
// @route   PUT /api/medicine/:id
// @access  Private (Pharmacy only)
const updateStock = async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);

        if (!medicine) {
            return res.status(404).json({ message: "Medicine not found" });
        }

        // Check ownership
        if (medicine.pharmacy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to update this stock" });
        }

        const updatedMedicine = await Medicine.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json(updatedMedicine);
    } catch (error) {
        console.error("Update medicine error:", error);
        res.status(500).json({ message: "Error updating medicine", error: error.message });
    }
};

// @desc    Delete medicine stock
// @route   DELETE /api/medicine/:id
// @access  Private (Pharmacy only)
const deleteStock = async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);

        if (!medicine) {
            return res.status(404).json({ message: "Medicine not found" });
        }

        // Check ownership
        if (medicine.pharmacy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to delete this stock" });
        }

        await medicine.deleteOne();

        res.status(200).json({ message: "Medicine removed" });
    } catch (error) {
        console.error("Delete medicine error:", error);
        res.status(500).json({ message: "Error deleting medicine", error: error.message });
    }
};

module.exports = {
    addStock,
    getInventory,
    updateStock,
    deleteStock,
};
