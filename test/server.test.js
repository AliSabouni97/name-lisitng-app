const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); // Adjust the path as necessary

let server;

beforeAll(async () => {
    try {
        await mongoose.connect('mongodb://localhost/names_review_app_test', { useNewUrlParser: true, useUnifiedTopology: true });
        server = app.listen(4000);
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
    }
});

afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    }
    if (server) {
        server.close();
    }
});

describe('Names Review App API', () => {
    it('should add a name manually', async () => {
        const response = await request(server)
            .post('/add-name')
            .send({ name: 'John Doe', category: 'Test' });
        expect(response.status).toBe(201);
        expect(response.body.name).toBe('John Doe');
    });

    // Add more tests for other routes...
});