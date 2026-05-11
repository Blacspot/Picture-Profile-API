const request = require('supertest');
const {
    mockVerifyIdToken,
    mockGet,
    mockSet,
    mockUpdate,
    mockDelete,
    mockMakePublic,
} = require('./mocks/firebase');
const app = require('../app');

const authHeader = { Authorization: 'Bearer validtoken' };
beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyIdToken.mockResolvedValue({ uid: 'uid123' });
});

describe('GET /api/users/me', () => {
    test('returns 200 with user data when user exists', async () =>  {
        mockGet.mockResolvedValue({
            exists: true,
            data: () => ({ uid: 'uid123', email: 'test@test.com', profileImage: null}),
        });

        const res = await request(app)
            .get('/api/users/me')
            .set(authHeader);
        expect(res.status).toBe(200);
        expect(res.body.user.uid).toBe('uid123');    
    });
    test('returns 404 when user does not exist', async () => {
        mockGet.mockResolvedValue({ exists: false });
        const res = await request(app)
            .get('/api/users/me')
            .set(authHeader);
        expect(res.status).toBe(404);    
    });
    test('returns 401 with no token', async () => {
        const res = await request(app).get('/api/users/me');
        expect(res.status).toBe(401);
    });
});
describe('POST /api/users/profile-picture', () => {
    test('returns 400 when no file is uploaded', async () => {
        const res = await request(app)
            .post('/api/users/profile-picture')
            .set(authHeader);
        expect(res.status).toBe(400);    
    });
    test('uploads file and returns 200 with profileImage data', async () => {
        mockGet.mockResolvedValue({ exists: true, data: () => ({profileImage: null})});
        mockSet.mockResolvedValue(true);
        mockMakePublic.mockResolvedValue(true);

        const res = await request(app)
            .post('/api/users/profile-picture')
            .set(authHeader)
            .attach('profileImage', Buffer.from('fake image data'),
            {
                filename: 'test.jpg',
                contentType: 'image/jpeg',
            });
        expect(res.status).toBe(200);
        expect(res.body.profileImage).toHaveProperty('url');
        expect(res.body.profileImage).toHaveProperty('filePath');
        expect(res.body.profileImage.mimeType).toBe('image/jpeg');                     
    });
    test('deletes old file when replacing existing picture', async () => {
        mockGet.mockResolvedValue({
            exists: true,
            data: () => ({
                profileImage: {
                    filePath: 'profile-pictures/uid123/old-file.jpg',
                },
            }),
        });
        mockSet.mockResolvedValue(true);
        mockDelete.mockResolvedValue(true);

        await request(app)
            .post('/api/users/profile-picture')
            .set(authHeader)
            .attach('profileImage', Buffer.from('fake image data'), {
                filename: 'new.jpg',
                contentType: 'image/jpeg',
            });
        expect(mockDelete).toHaveBeenCalled();
    });
    test('rejects files over 2MB', async () => {
        const largeBuffer = Buffer.alloc(3 * 1024 * 1024); // 3MB
        const res = await request(app)
            .post('/api/users/profile-picture')
            .set(authHeader)
            .attach('profileImage', largeBuffer, {
                filename: 'large.jpg',
                contentType: 'image/jpeg',
            });
        expect(res.status).toBe(400);
    });
    test('rejects non-image files', async () => {
        const res = await request(app)
            .post('/api/users/profile-picture')
            .set(authHeader)
            .attach('profileImage', Buffer.from('fake pdf'), {
                filename: 'doc.pdf',
                contentType: 'application/pdf',
            });
        expect(res.status).toBe(400);
    });
});
describe('DELETE /api/users/profile-picture', () => {

    test('returns 404 when user does not exist', async () => {
        mockGet.mockResolvedValue({ exists: false });

        const res = await request(app)
            .delete('/api/users/profile-picture')
            .set(authHeader);

        expect(res.status).toBe(404);
    });

    test('returns 400 when user has no profile picture', async () => {
        mockGet.mockResolvedValue({
            exists: true,
            data: () => ({ profileImage: null }),
        });

        const res = await request(app)
            .delete('/api/users/profile-picture')
            .set(authHeader);

        expect(res.status).toBe(400);
    });

    test('deletes file and returns 200', async () => {
        mockGet.mockResolvedValue({
            exists: true,
            data: () => ({
                profileImage: {
                    filePath: 'profile-pictures/uid123/test.jpg'
                }
            }),
        });
        mockDelete.mockResolvedValue(true);
        mockUpdate.mockResolvedValue(true);

        const res = await request(app)
            .delete('/api/users/profile-picture')
            .set(authHeader);

        expect(res.status).toBe(200);
        expect(mockDelete).toHaveBeenCalled();
        expect(mockUpdate).toHaveBeenCalledWith({ profileImage: null });
    });

    test('returns 401 with no token', async () => {
        const res = await request(app)
            .delete('/api/users/profile-picture');

        expect(res.status).toBe(401);
    });
});