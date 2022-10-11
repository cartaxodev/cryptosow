const express = require('express');
const projectController = require('../../controllers/projectController');
const authController = require('../../controllers/authController');

const router = express.Router();

router.route('/')
    .post(authController.autenticate, authController.authorize(['project-owner']), projectController.createNewProject);

module.exports = router;