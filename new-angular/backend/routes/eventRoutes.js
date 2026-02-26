const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent
} = require('../controllers/eventController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { requireCsrf } = require('../middleware/csrfMiddleware');

router.get('/', getAllEvents);
router.post('/', protect, requireCsrf, authorizeRoles('admin'), createEvent);
router.put('/:id', protect, requireCsrf, authorizeRoles('admin'), updateEvent);
router.delete('/:id', protect, requireCsrf, authorizeRoles('admin'), deleteEvent);
router.post('/:id/register', protect, requireCsrf, authorizeRoles('user'), registerForEvent);

module.exports = router;
