# Picture Profile API

A RESTful backend API for managing user profile pictures built with Node.js, Express, and Firebase.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js + Express | HTTP server and routing |
| Firebase Admin SDK | Firestore and Cloud Storage |
| Firebase Authentication | JWT token verification |
| Multer | File upload handling |
| UUID | Unique filename generation |
| Jest + Supertest | Testing |

---

## Project Structure

```
src/
├── config/
│   └── firebase.js           # Firebase Admin initialisation
├── controllers/
│   ├── auth.controller.js    # Registration logic
│   └── user.controller.js    # Upload, delete, get profile
├── middleware/
│   ├── auth.middleware.js    # JWT verification
│   └── upload.middleware.js  # File type and size validation
├── routes/
│   ├── auth.routes.js
│   └── user.routes.js
├── services/
│   └── storage.service.js    # Firebase Storage operations
├── __tests__/
│   ├── mocks/firebase.js     # Firebase Admin mock
│   ├── auth.test.js
│   ├── middleware.test.js
│   └── user.test.js
└── app.js
server.js
```

---



## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Resource created |
| 400 | Bad request — missing file, wrong type, or file too large |
| 401 | Missing or invalid token |
| 404 | User or resource not found |
| 500 | Server error |

---

## Running Tests

```bash
npm test
```

```
PASS  src/__tests__/middleware.test.js
PASS  src/__tests__/auth.test.js
PASS  src/__tests__/user.test.js

Test Suites: 3 passed
Tests:       20 passed
```

Tests use a full Firebase Admin mock — no real Firebase calls are made during testing.

---

## Known Limitations

- Images are made permanently public via `makePublic()` — signed URLs with expiry are the safer alternative for production
- Files are held in memory by Multer before upload — not suitable for very large files or high concurrency
- No rate limiting on upload endpoints

---

## Future Improvements

- Replace `makePublic()` with expiring signed URLs
- Add rate limiting on upload endpoints
- Migrate from Render free tier to Azure App Service to eliminate cold start timeouts
- Server-side image resizing to standardise avatar dimensions

