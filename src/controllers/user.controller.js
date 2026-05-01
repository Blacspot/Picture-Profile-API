const { db } = require('../config/firebase');
const { uploadFile, deleteFile } = require('../services/storage.service');

/**
 * Upload or Update Profile Picture
 */
const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.uid;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    let oldFilePath = null;

    if (userDoc.exists) {
      const userData = userDoc.data();

      if (userData.profileImage && userData.profileImage.filePath) {
        oldFilePath = userData.profileImage.filePath;
      }
    }

    // Upload new file
    const uploadedFile = await uploadFile(req.file, userId);

    // Delete old file if exists
    if (oldFilePath) {
      await deleteFile(oldFilePath);
    }

    // Save metadata to Firestore
    const profileImageData = {
      fileName: uploadedFile.fileName,
      filePath: uploadedFile.filePath,
      url: uploadedFile.url,
      mimeType: req.file.mimetype,
      size: req.file.size,
      updatedAt: new Date()
    };

    await userRef.set(
      {
        profileImage: profileImageData
      },
      { merge: true }
    );

    return res.status(200).json({
      message: 'Profile picture uploaded successfully',
      profileImage: profileImageData
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete Profile Picture
 */
const deleteProfilePicture = async (req, res) => {
  try {
    const userId = req.user.uid;

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = userDoc.data();

    if (!userData.profileImage) {
      return res.status(400).json({ message: 'No profile picture to delete' });
    }

    const filePath = userData.profileImage.filePath;

    // Delete from storage
    await deleteFile(filePath);

    // Remove from Firestore
    await userRef.update({
      profileImage: null
    });

    return res.status(200).json({
      message: 'Profile picture deleted successfully'
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get User Profile
 */
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.uid;

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    return res.status(200).json({
      user: userDoc.data()
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  uploadProfilePicture,
  deleteProfilePicture,
  getUserProfile
};