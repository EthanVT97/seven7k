process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-db';

// Mock external services
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');

// Global test setup
beforeAll(async () => {
    // Add any global setup here
});

afterAll(async () => {
    // Add any global cleanup here
}); 