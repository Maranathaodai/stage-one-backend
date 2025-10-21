const express = require('express');
const router = express.Router();
const stringController = require('../controllers/stringController');

router.get('/filter-by-natural-language', stringController.filterByNaturalLanguage);

router.post('/', stringController.createString);
router.get('/', stringController.getAllStrings);
router.get('/:string_value', stringController.getStringByValue);
router.delete('/:string_value', stringController.deleteString);

module.exports = router;
