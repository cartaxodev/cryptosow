const express = require('express');
const donationController = require('../../controllers/donationController');
const authController = require('../../controllers/authController');

const router = express.Router();

router.route('/')
    .get(authController.autenticate, authController.authorize(['donor']), donationController.getCurrentUserDonations)
    .post(authController.autenticate, authController.authorize(['donor']), donationController.makeNewDonation);

module.exports = router;