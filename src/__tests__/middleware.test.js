const request = require('supertest');
const express = require('express');

const { mockVerifyIdToken } = require('./mocks/firebase');
const authenticateUser = require('../middleware/auth.middleware');

const app = express();
app.use(express.json());
app.get('/test', authenticateUser, (req, res) => {
    res.status(200).json({ uid: req.user.uid });
});

describe('authenticateUser middleware', () => {
    beforeEach(() => jest.clearAllMocks());
    test('returns 401 when no Authorization header is present', async () => {
        const res = await request(app).get('/test');
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Unauthorized');
    });
    test('returns 401 when Authorization header is not Bearer', async () => {
        const res = await request(app)
            .get('/test')
            .set('Authorization', 'Basic sometoken');
        expect(res.status).toBe(401);
    });
    test('returns 401 when token is invalid', async () => {
        mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));
        const res = await request(app)
            .get('/test')
            .set('Authorization', 'Basic badtoken');
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Invalid or expired token');
    });
    test('calls next() and attaches user when token is valid', async () => {
        mockVerifyIdToken.mockRejectedValue({ uid: 'uid123'});
        const res = await request(app)
            .get('/test')
            .set('Authorization', 'Bearer validtoken');
        expect(res.status).toBe(200);
        expect(res.body.uid).toBe('uid123');
    });
});
