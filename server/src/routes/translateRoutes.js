const express = require('express');
const { authMiddleware, optionalAuthMiddleware } = require('../middlewares/authMiddleware');
const { translate, getHistory, deleteTranslation } = require('../controllers/translateController');
const { translateRateLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.post('/', optionalAuthMiddleware, translateRateLimiter, translate);
router.get('/history', authMiddleware, getHistory);
router.delete('/history/:id', authMiddleware, deleteTranslation);

module.exports = router;


