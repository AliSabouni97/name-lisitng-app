const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const bodyParser = require('body-parser');
const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors'); // Import the cors package

// Initialize app and middleware
const app = express();
const upload = multer({ dest: 'uploads/' }); // Temporary folder for uploads
app.use(bodyParser.json());
app.use(cors()); // Enable CORS

// MongoDB connection
const connectDB = async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect('mongodb://localhost/names_review_app', { useNewUrlParser: true, useUnifiedTopology: true });
    }
};

connectDB().then(() => console.log('MongoDB connected')).catch(err => console.error('MongoDB connection error:', err));

// Models
const Name = mongoose.model('Name', new mongoose.Schema({
    id: Number,
    area: String,
    code: Number,
    name: String,
    mothersName: String,
    status: String,
    source: String
}));

// Basic route for testing
app.get('/', (req, res) => {
    res.send('Names Review App is running!');
});

// Add a name manually
app.post('/add-name', async (req, res) => {
    try {
        const { id, area, code, name, mothersName, status } = req.body;
        const newName = new Name({ id, area, code, name, mothersName, status, source: 'manual' });
        await newName.save();
        res.status(201).send(newName);
    } catch (error) {
        res.status(500).send({ error: 'Failed to add name' });
    }
});

// Upload and process CSV
app.post('/upload/csv', upload.single('file'), (req, res) => {
    const results = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                const names = results.map(row => ({
                    id: parseInt(row.id, 10),
                    area: row.area,
                    code: parseInt(row.code, 10),
                    name: row.name,
                    mothersName: row.mothersName,
                    status: row.status,
                    source: 'csv'
                }));
                await Name.insertMany(names);
                res.status(201).send(names);
            } catch (error) {
                res.status(500).send({ error: 'Failed to process CSV' });
            }
        });
});

// Fetch all pending names
app.get('/pending', async (req, res) => {
    try {
        const pendingNames = await Name.find({ source: { $ne: 'verified' } });
        res.status(200).send(pendingNames);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch pending names' });
    }
});

// Verify names
app.post('/verify', async (req, res) => {
    try {
        const { ids } = req.body;
        await Name.updateMany({ _id: { $in: ids } }, { source: 'verified' });
        res.status(200).send({ message: 'Names verified' });
    } catch (error) {
        res.status(500).send({ error: 'Failed to verify names' });
    }
});

// Fetch all verified names
app.get('/names', async (req, res) => {
    try {
        const verifiedNames = await Name.find({ source: 'verified' });
        res.status(200).send(verifiedNames);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch verified names' });
    }
});

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;