const express = require("express");
const router = express.Router();
const controller = require("../controllers/requestController");
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { requireCsrf } = require('../middleware/csrfMiddleware');

router.use(protect);
router.use(requireCsrf);

router.post('/create', authorizeRoles('hospital'), controller.createRequest);
router.get('/my', authorizeRoles('hospital'), controller.getMyRequests);
router.get('/inventory', authorizeRoles('hospital'), controller.getHospitalInventory);

router.get('/available', authorizeRoles('user'), controller.getAvailableRequests);
router.put('/:id/status', controller.updateRequestStatus);
router.get('/history', authorizeRoles('user'), controller.getDonationHistory);

// Backward-compatible aliases
router.put('/update-status/:id', controller.updateRequestStatus);
router.get('/donation-history', authorizeRoles('user'), controller.getDonationHistory);

module.exports = router;