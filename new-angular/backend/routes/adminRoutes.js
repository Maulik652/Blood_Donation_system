const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getAllHospitals,
  getAllRequests,
  deleteUser,
  getStatistics
} = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// All routes require admin role
router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/users', getAllUsers);
router.get('/hospitals', getAllHospitals);
router.get('/requests', getAllRequests);
router.delete('/users/:id', deleteUser);
router.get('/statistics', getStatistics);

module.exports = router;
