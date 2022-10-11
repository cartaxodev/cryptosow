const express = require('express');
const userController = require('../../controllers/userController');
const authController = require('../../controllers/authController');

const router = express.Router();

router.route('/')
    .get(authController.autenticate, authController.authorize(['admin']), userController.getAllUsers)
    .post(authController.autenticate, authController.authorize(['admin']), userController.createNewUser);

router.route('/:id')
    .get(authController.autenticate, authController.authorize(['admin']), userController.getUser)
    .patch(authController.autenticate, authController.authorize(['admin']),userController.updateUser)
    .delete(authController.autenticate, authController.authorize(['admin']),userController.inactivateUser);

module.exports = router;