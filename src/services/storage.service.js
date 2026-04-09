const { bucket } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

// Upload profile picture to Firebase Storage
const uploadFile = async (File, userId) => {
    try {
        const uniqueFileName = `${uuidv4()}-${File.originalname}`;

        const fileUpload = bucket.file(`profile-pictures/${userId}/${uniqueFileName}`); //combination of names
        const blobStream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype
            }
        }); //writable stream to upload file

        return new Promise((resolve, reject) => {
            blobStream.on('error', (error) => reject(error));
            blobStream.on('finish', async () => {
                await fileUpload.makePublic();
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
                resolve({
                    fileName: uniqueFileName,
                    url: publicUrl
                });
            });
            blobStream.end(File.buffer);
        });
    } catch (error) {
        throw new Error('Error uploading file');
    }
};

// Delete profile picture from Firebase Storage
const deleteFile = async (filePath) => {
    try {
        const file = bucket.file(filePath);
        await file.delete();
    } catch (error) {
        console.error('Error deleting file:', error.message);
    }
};

module.exports = {
    uploadFile,
    deleteFile
};