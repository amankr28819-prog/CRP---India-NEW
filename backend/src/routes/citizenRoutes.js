const express = require('express');
const router = express.Router();
const {
  searchCitizens,
  getPublicCitizenProfile
} = require('../controllers/citizenController');

router.get('/search', searchCitizens);
router.get('/:id/public-profile', getPublicCitizenProfile);

module.exports = router;
