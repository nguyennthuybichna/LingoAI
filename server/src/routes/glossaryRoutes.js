const express = require('express');
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
  getGlossary,
  addGlossaryTerm,
  deleteGlossaryTerm,
  updateGlossaryTerm,
} = require('../controllers/glossaryController');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getGlossary);
router.post('/', addGlossaryTerm);
router.put('/:id', updateGlossaryTerm);
router.delete('/:id', deleteGlossaryTerm);

module.exports = router;

