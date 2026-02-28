const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getAllHospitals,
  getAllRequests,
  deleteUser,
  approveHospital,
  getStatistics
} = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { requireCsrf } = require('../middleware/csrfMiddleware');

// All routes require admin role
router.use(protect);
router.use(requireCsrf);
router.use(authorizeRoles('admin'));

router.get('/users', getAllUsers);
router.get('/hospitals', getAllHospitals);
router.patch('/hospitals/:id/approve', approveHospital);
router.get('/requests', getAllRequests);
router.delete('/users/:id', deleteUser);
router.get('/statistics', getStatistics);

module.exports = router;
