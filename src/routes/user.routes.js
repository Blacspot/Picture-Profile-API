const express = require('express');
const router = express.Router();

const authenticateUser = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const userController = require('../controllers/user.controller');

router.post('/profile-picture',
    authenticateUser,
    (req, res, next) => {
        upload.single('profileImage')(req, res, (err) => {
            if (err) return res.status(400).json({ message: err.message });
            next();
        });
    },
    userController.uploadProfilePicture);

router.delete('/profile-picture', authenticateUser, userController.deleteProfilePicture);

router.get('/me', authenticateUser, userController.getUserProfile);
module.exports = router;