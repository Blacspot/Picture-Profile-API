const request = require('supertest');
const {
     mockVerifyIdToken,
     mockGet,
     mockSet,
     mockDocRef,
     } = require('./mocks/firebase');
const app = require('../app');

describe('POST api/auth/register', () => {
    beforeEach(() => jest.clearAllMocks());

    const authHeader = { Authorization: 'Bearer validtoken' };

    beforeEach(() => {
        mockVerifyIdToken.mockResolvedValue({ uid: 'uid123' });
    });

    test('returns 201 and creates user when user does not exist', async () => {
        mockGet.mockResolvedValue({ exists: false });
        mockSet.mockResolvedValue(true);

        const res = await request(app)
            .post('/api/auth/register')
            .set(authHeader)
            .send({ displayName: 'Test User', email: 'test@test.com' });
        expect(res.status).toBe(201);
        expect(res.body.message).toBe('User registered successfully');  
        expect(mockSet).toHaveBeenCalledWith(
            expect.objectContaining({
                uid: 'uid123',
                displayName: 'Test User',
                email: 'test@test.com',
                profileImage: null,
            })
        )
    });
    test ('returns 200 when user already exists', async () => {
        mockGet.mockResolvedValue({ exists: true });

        const res = await request(app)
            .post('/api/auth/register')
            .set(authHeader)
            .send({ displayName: 'Test User', email: 'test@test.com'});

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('User already registered');
        expect(mockSet).not.toHaveBeenCalled();    
    });

    test('returns 401 with no token', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ displayName: 'Test User', email: 'test@test.com'});

        expect(res.status).toBe(401);    
    });

    test('returns 500 when Firestore throws', async () => {
        mockGet.mockRejectedValue(new Error('Firestore error'));
        jest.spyOn(console, 'error').mockImplementation(() => {}); // suppress error logging in test output

        const res = await request(app)
            .post('/api/auth/register')
            .set(authHeader)
            .send({ displayName: 'Test User', email: 'test@test.com' });
        expect(res.status).toBe(500); 
        console.error.mockRestore();  
        });
});