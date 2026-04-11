const {db} = require('../config/firebase');

const registerUser = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { displayName, email } = req.body;
        
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            return res.status(200).json({ message: 'User already registered' });
        }

        await userRef.set({
            uid: userId,
            displayName: displayName || null,
            email: email || null,
            profileImage: null,
            createdAt: new Date()
        });
        return res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    registerUser
};