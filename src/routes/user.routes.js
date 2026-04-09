const express = require('express');
const router = express.Router();

const authenticateUser = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const userController = require('../controllers/user.controller');

router.post('/profile-picture',
    authenticateUser,
    upload.single('profileImage'),
    userController.uploadProfilePicture);

    router.delete('/profile-picture',
    authenticateUser,
    userController.deleteProfilePicture);

    router.get('/me', authenticateUser, userController.getUserProfile);
module.exports = router;