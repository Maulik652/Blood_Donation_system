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

router.get('/', getAllEvents);
router.post('/', protect, authorizeRoles('admin'), createEvent);
router.put('/:id', protect, authorizeRoles('admin'), updateEvent);
router.delete('/:id', protect, authorizeRoles('admin'), deleteEvent);
router.post('/:id/register', protect, authorizeRoles('user'), registerForEvent);

module.exports = router;
