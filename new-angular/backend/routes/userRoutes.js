const express = require("express");
const rateLimit = require('express-rate-limit');
const router = express.Router();
const controller = require("../controllers/userController");
const { protect } = require('../middleware/authMiddleware');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many authentication attempts. Please try again later.',
    },
});

router.post('/register', authLimiter, controller.register);
router.post('/login', authLimiter, controller.login);
router.post('/logout', controller.logout);

router.get('/profile', protect, controller.getProfile);
router.put('/availability', protect, controller.updateAvailability);

module.exports = router;