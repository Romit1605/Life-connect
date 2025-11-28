const Policy = require("../models/Policy");
const User = require("../models/User");
const Notification = require("../models/Notification");

// @desc    Get all policies
// @route   GET /api/policies
// @access  Public
const getAllPolicies = async (req, res) => {
    try {
        const policies = await Policy.find({ isActive: true })
            .sort({ role: 1, sectionNumber: 1 })
            .populate("lastUpdatedBy", "full_name organization_name");
        res.status(200).json(policies);
    } catch (error) {
        console.error("Get all policies error:", error);
        res.status(500).json({ message: "Error fetching policies", error: error.message });
    }
};

// @desc    Get policies by role
// @route   GET /api/policies/:role
// @access  Public
const getPoliciesByRole = async (req, res) => {
    try {
        const { role } = req.params;
        const policies = await Policy.find({ role, isActive: true })
            .sort({ sectionNumber: 1 })
            .populate("lastUpdatedBy", "full_name organization_name");
        res.status(200).json(policies);
    } catch (error) {
        console.error("Get policies by role error:", error);
        res.status(500).json({ message: "Error fetching policies", error: error.message });
    }
};

// @desc    Create a new policy
// @route   POST /api/policies
// @access  Private (Government only)
const createPolicy = async (req, res) => {
    try {
        if (req.user.role !== "government") {
            return res.status(403).json({ message: "Only government can create policies" });
        }

        const { role, sectionTitle, sectionNumber, policyItems } = req.body;

        if (!role || !sectionTitle || !sectionNumber || !policyItems || policyItems.length === 0) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        const policy = await Policy.create({
            role,
            sectionTitle,
            sectionNumber,
            policyItems,
            lastUpdatedBy: req.user.id,
        });

        const populatedPolicy = await Policy.findById(policy._id)
            .populate("lastUpdatedBy", "full_name organization_name");

        // Send notifications to all users
        const allUsers = await User.find({});
        const roleDisplayName = role.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());

        const notifications = allUsers.map(user => ({
            recipient: user._id,
            type: "policy_update",
            message: `New policy added: ${roleDisplayName} - ${sectionTitle}`,
            relatedId: policy._id,
            relatedModel: "Policy",
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        res.status(201).json(populatedPolicy);
    } catch (error) {
        console.error("Create policy error:", error);
        res.status(500).json({ message: "Error creating policy", error: error.message });
    }
};

// @desc    Update a policy
// @route   PUT /api/policies/:id
// @access  Private (Government only)
const updatePolicy = async (req, res) => {
    try {
        if (req.user.role !== "government") {
            return res.status(403).json({ message: "Only government can update policies" });
        }

        const policy = await Policy.findById(req.params.id);

        if (!policy) {
            return res.status(404).json({ message: "Policy not found" });
        }

        const { sectionTitle, sectionNumber, policyItems } = req.body;

        // Increment version
        policy.version += 1;
        policy.sectionTitle = sectionTitle || policy.sectionTitle;
        policy.sectionNumber = sectionNumber !== undefined ? sectionNumber : policy.sectionNumber;
        policy.policyItems = policyItems || policy.policyItems;
        policy.lastUpdatedBy = req.user.id;

        await policy.save();

        const populatedPolicy = await Policy.findById(policy._id)
            .populate("lastUpdatedBy", "full_name organization_name");

        // Send notifications to all users
        const allUsers = await User.find({});
        const roleDisplayName = policy.role.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());

        const notifications = allUsers.map(user => ({
            recipient: user._id,
            type: "policy_update",
            message: `Policy updated: ${roleDisplayName} - ${policy.sectionTitle}`,
            relatedId: policy._id,
            relatedModel: "Policy",
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        res.status(200).json(populatedPolicy);
    } catch (error) {
        console.error("Update policy error:", error);
        res.status(500).json({ message: "Error updating policy", error: error.message });
    }
};

// @desc    Delete a policy
// @route   DELETE /api/policies/:id
// @access  Private (Government only)
const deletePolicy = async (req, res) => {
    try {
        if (req.user.role !== "government") {
            return res.status(403).json({ message: "Only government can delete policies" });
        }

        const { reason } = req.body;

        if (!reason || !reason.trim()) {
            return res.status(400).json({ message: "Deletion reason is required" });
        }

        const policy = await Policy.findById(req.params.id);

        if (!policy) {
            return res.status(404).json({ message: "Policy not found" });
        }

        // Soft delete by setting isActive to false
        policy.isActive = false;
        policy.deletionReason = reason;
        policy.lastUpdatedBy = req.user.id;
        await policy.save();

        // Send notifications to all users
        const allUsers = await User.find({});
        const roleDisplayName = policy.role.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());

        const notifications = allUsers.map(user => ({
            recipient: user._id,
            type: "policy_update",
            message: `Policy removed: ${roleDisplayName} - ${policy.sectionTitle}. Reason: ${reason}`,
            relatedId: policy._id,
            relatedModel: "Policy",
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        res.status(200).json({ message: "Policy deleted successfully", id: req.params.id });
    } catch (error) {
        console.error("Delete policy error:", error);
        res.status(500).json({ message: "Error deleting policy", error: error.message });
    }
};

// @desc    Seed default policies
// @route   POST /api/policies/seed
// @access  Private (Government only)
const seedPolicies = async (req, res) => {
    try {
        if (req.user.role !== "government") {
            return res.status(403).json({ message: "Only government can seed policies" });
        }

        const defaultPolicies = [
            // Pharmacy Policies
            {
                role: "pharmacy",
                sectionTitle: "Medicine Storage Guidelines",
                sectionNumber: 1,
                policyItems: [
                    "All medicines must be stored at recommended temperatures.",
                    "Expired medicines must be segregated immediately.",
                    "Narcotics must be stored in a double-locked cabinet.",
                    "Temperature logs must be maintained twice daily.",
                    "Humidity levels must be monitored and recorded."
                ]
            },
            {
                role: "pharmacy",
                sectionTitle: "Prescription Handling",
                sectionNumber: 2,
                policyItems: [
                    "Verify patient identity before dispensing.",
                    "Check for drug interactions.",
                    "Explain dosage instructions clearly to the patient.",
                    "Retain hard copies of prescriptions for 2 years.",
                    "Report suspicious prescriptions to authorities."
                ]
            },
            {
                role: "pharmacy",
                sectionTitle: "Inventory Management",
                sectionNumber: 3,
                policyItems: [
                    "Conduct weekly stock audits.",
                    "Use First-In-First-Out (FIFO) method.",
                    "Maintain minimum stock levels for essential drugs.",
                    "Record all incoming stock immediately.",
                    "Dispose of damaged stock as per bio-hazard guidelines."
                ]
            },
            {
                role: "pharmacy",
                sectionTitle: "Staff Hygiene",
                sectionNumber: 4,
                policyItems: [
                    "Wear clean lab coats at all times.",
                    "Sanitize hands before and after handling medicines.",
                    "No eating or drinking in the dispensing area.",
                    "Regular health checkups for staff.",
                    "Hair must be tied back and covered."
                ]
            },
            {
                role: "pharmacy",
                sectionTitle: "Emergency Protocols",
                sectionNumber: 5,
                policyItems: [
                    "Maintain an updated list of emergency contacts.",
                    "Keep a fully stocked first aid kit.",
                    "Conduct fire drills quarterly.",
                    "Ensure fire extinguishers are accessible.",
                    "Have a backup power source for refrigerators."
                ]
            },

            // Blood Bank Policies
            {
                role: "blood_bank",
                sectionTitle: "Donor Screening",
                sectionNumber: 1,
                policyItems: [
                    "Verify donor age and weight.",
                    "Check hemoglobin levels before donation.",
                    "Conduct mandatory health history interview.",
                    "Defer donors with recent travel to malaria zones.",
                    "Ensure donor consent form is signed."
                ]
            },
            {
                role: "blood_bank",
                sectionTitle: "Blood Collection",
                sectionNumber: 2,
                policyItems: [
                    "Use single-use sterile needles only.",
                    "Label blood bags immediately after collection.",
                    "Monitor donor for adverse reactions.",
                    "Maintain aseptic conditions during venipuncture.",
                    "Store blood at 2-6°C immediately."
                ]
            },
            {
                role: "blood_bank",
                sectionTitle: "Testing Protocols",
                sectionNumber: 3,
                policyItems: [
                    "Test all units for HIV, Hepatitis B & C.",
                    "Perform blood grouping and cross-matching.",
                    "Screen for syphilis and malaria.",
                    "Quarantine units until testing is complete.",
                    "Discard reactive units as per bio-safety norms."
                ]
            },
            {
                role: "blood_bank",
                sectionTitle: "Storage and Transport",
                sectionNumber: 4,
                policyItems: [
                    "Monitor refrigerator temperature continuously.",
                    "Use validated transport boxes for distribution.",
                    "Maintain cold chain during transport.",
                    "Segregate different blood components.",
                    "Calibrate equipment every 6 months."
                ]
            },
            {
                role: "blood_bank",
                sectionTitle: "Record Keeping",
                sectionNumber: 5,
                policyItems: [
                    "Maintain donor registry for 5 years.",
                    "Log all adverse reactions.",
                    "Track blood unit disposition.",
                    "Record daily quality control checks.",
                    "Maintain equipment maintenance logs."
                ]
            },

            // Hospital Policies
            {
                role: "hospital",
                sectionTitle: "Patient Admission",
                sectionNumber: 1,
                policyItems: [
                    "Verify patient identity with two identifiers.",
                    "Obtain informed consent for treatment.",
                    "Assess patient for fall risk.",
                    "Screen for infectious diseases on arrival.",
                    "Record baseline vital signs."
                ]
            },
            {
                role: "hospital",
                sectionTitle: "Infection Control",
                sectionNumber: 2,
                policyItems: [
                    "Adhere to hand hygiene protocols.",
                    "Use PPE appropriate for the procedure.",
                    "Isolate patients with contagious diseases.",
                    "Sterilize surgical instruments strictly.",
                    "Disinfect high-touch surfaces daily."
                ]
            },
            {
                role: "hospital",
                sectionTitle: "Medication Administration",
                sectionNumber: 3,
                policyItems: [
                    "Follow the 'Five Rights' of medication administration.",
                    "Double-check high-alert medications.",
                    "Document medication administration immediately.",
                    "Monitor patient for drug reactions.",
                    "Report medication errors safely."
                ]
            },
            {
                role: "hospital",
                sectionTitle: "Emergency Response",
                sectionNumber: 4,
                policyItems: [
                    "Respond to Code Blue within 2 minutes.",
                    "Maintain crash carts fully stocked.",
                    "Conduct regular mock drills.",
                    "Ensure clear access to emergency exits.",
                    "Triaging must be done by qualified staff."
                ]
            },
            {
                role: "hospital",
                sectionTitle: "Waste Management",
                sectionNumber: 5,
                policyItems: [
                    "Segregate waste at the point of generation.",
                    "Use color-coded bins correctly.",
                    "Handle sharps with extreme care.",
                    "Store biomedical waste in a secured area.",
                    "Dispose of waste within 48 hours."
                ]
            },

            // NGO Policies
            {
                role: "ngo",
                sectionTitle: "Camp Organization",
                sectionNumber: 1,
                policyItems: [
                    "Obtain necessary government permits.",
                    "Ensure adequate space for the camp.",
                    "Provide clean drinking water.",
                    "Arrange for waste disposal facilities.",
                    "Ensure accessibility for elderly and disabled."
                ]
            },
            {
                role: "ngo",
                sectionTitle: "Volunteer Management",
                sectionNumber: 2,
                policyItems: [
                    "Verify volunteer background checks.",
                    "Provide orientation and training.",
                    "Assign clear roles and responsibilities.",
                    "Ensure volunteer safety and well-being.",
                    "Maintain a volunteer attendance log."
                ]
            },
            {
                role: "ngo",
                sectionTitle: "Fund Utilization",
                sectionNumber: 3,
                policyItems: [
                    "Maintain transparent financial records.",
                    "Use funds only for approved purposes.",
                    "Conduct annual financial audits.",
                    "Issue receipts for all donations.",
                    "Report expenses to the board quarterly."
                ]
            },
            {
                role: "ngo",
                sectionTitle: "Beneficiary Interaction",
                sectionNumber: 4,
                policyItems: [
                    "Treat all beneficiaries with dignity.",
                    "Maintain beneficiary confidentiality.",
                    "Do not discriminate based on caste or creed.",
                    "Collect feedback from beneficiaries.",
                    "Address grievances promptly."
                ]
            },
            {
                role: "ngo",
                sectionTitle: "Partnership Guidelines",
                sectionNumber: 5,
                policyItems: [
                    "Collaborate with registered hospitals only.",
                    "Sign MOUs for long-term partnerships.",
                    "Ensure partners adhere to ethical standards.",
                    "Review partnership performance annually.",
                    "Maintain open communication channels."
                ]
            }
        ];

        // Add user ID to all policies
        const policiesToInsert = defaultPolicies.map(p => ({
            ...p,
            lastUpdatedBy: req.user.id,
            version: 1
        }));

        // Insert policies
        await Policy.insertMany(policiesToInsert);

        res.status(201).json({ message: "Default policies seeded successfully", count: policiesToInsert.length });
    } catch (error) {
        console.error("Seed policies error:", error);
        res.status(500).json({ message: "Error seeding policies", error: error.message });
    }
};

module.exports = {
    getAllPolicies,
    getPoliciesByRole,
    createPolicy,
    updatePolicy,
    deletePolicy,
    seedPolicies,
};
