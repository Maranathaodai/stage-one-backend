const express = require('express');
const router = express.Router();
const stringController = require('../controllers/stringController');

// Natural language filter endpoint (must be before /:string_value to avoid conflict)
router.get('/filter-by-natural-language', stringController.filterByNaturalLanguage);

// Regular endpoints
router.post('/', stringController.createString);
router.get('/', stringController.getAllStrings);
router.get('/:string_value', stringController.getStringByValue);
router.delete('/:string_value', stringController.deleteString);

module.exports = router;
