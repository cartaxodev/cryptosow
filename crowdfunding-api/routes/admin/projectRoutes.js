const express = require('express');
const projectController = require('../../controllers/projectController');
const authController = require('../../controllers/authController');

const router = express.Router();

router.route('/')
    .get(authController.autenticate, authController.authorize(['admin']), projectController.getAllProjects);

router.route('/:id')
    .get(authController.autenticate, authController.authorize(['admin']), projectController.getProjectById)
    .patch(authController.autenticate, authController.authorize(['admin']), projectController.activateProject)
    .delete(authController.autenticate, authController.authorize(['admin']), projectController.inactivateProject);

module.exports = router;