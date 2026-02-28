const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  startEvent,
  endEvent,
  postponeEvent,
  registerForEvent
} = require('../controllers/eventController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { requireCsrf } = require('../middleware/csrfMiddleware');

router.get('/', getAllEvents);
router.post('/', protect, requireCsrf, authorizeRoles('admin'), createEvent);
router.put('/:id', protect, requireCsrf, authorizeRoles('admin'), updateEvent);
router.delete('/:id', protect, requireCsrf, authorizeRoles('admin'), deleteEvent);
router.patch('/:id/start', protect, requireCsrf, authorizeRoles('admin'), startEvent);
router.patch('/:id/end', protect, requireCsrf, authorizeRoles('admin'), endEvent);
router.patch('/:id/postpone', protect, requireCsrf, authorizeRoles('admin'), postponeEvent);
router.post('/:id/register', protect, requireCsrf, authorizeRoles('user'), registerForEvent);

module.exports = router;
