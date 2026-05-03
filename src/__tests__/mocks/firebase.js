const mockVerifyIdToken = jest.fn();
const mockGet = jest.fn();
const mockSet = jest.fn();
const mockUpdate = jest.fn();
const mockDoc = jest.fn();
const mockCollection = jest.fn();
const mockDelete = jest.fn();
const mockFile = jest.fn();
const mockCreateWriteStream = jest.fn();
const mockMakePublic = jest.fn();

const mockDocRef = {
    get: mockGet,
    set: mockSet,
    update: mockUpdate
};

mockCollection.mockReturnValue({ doc: mockDoc });
mockDoc.mockReturnValue(mockDocRef);

const mockBlobStream = {
    on: jest.fn((event, cb) => {
        if (event === 'finish') {
            // store callback to trigger manually in tests
            mockBlobStream._finishCb = cb;
        }
        return mockBlobStream;
    }),
    end: jest.fn(() => {
        if (mockBlobStream._finishCb) mockBlobStream._finishCb(); 
    })
};

const mockFileRef = {
    createWriteStream: mockCreateWriteStream.mockReturnValue(mockBlobStream),
    makePublic: mockMakePublic.mockResolvedValue(true),
    delete: mockDelete.mockResolvedValue(true),
    name: 'profile-pictures/uid123/test-file.jpg',
};

mockFile.mockReturnValue(mockFileRef);

jest.mock('firebase-admin', () => ({
    initializeApp: jest.fn(),
    credential: { cert: jest.fn()},
    auth: () => ({ verifyIdToken: mockVerifyIdToken }),
    firestore: () => ({ collection: mockCollection }),
    storage: () => ({ bucket: () => ({ file: mockFile, name: 'test-bucket' }) }),
}));

module.exports = {
    mockVerifyIdToken,
    mockGet,
    mockSet,
    mockUpdate,
    mockDoc,
    mockCollection,
    mockDelete,
    mockFile,
    mockBlobStream,
    mockMakePublic,
    mockDocRef,
};