const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const bodyParser = require('body-parser');
const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const { authCheck, adminCheck } = require('./authMiddleware');
const authRoutes = require('./authRoutes');

// Initialize app and middleware
const app = express();
const upload = multer({ dest: 'uploads/' }); // Temporary folder for uploads
app.use(bodyParser.json());
app.use(cors());

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
    source: String,
    isApproved: { type: Boolean, default: false } // Add the isApproved field
}));

// Basic route for testing
app.get('/', (req, res) => {
    res.send('Names Review App is running!');
});

// Authentication routes
app.use('/auth', authRoutes);

// Add a name manually (admin only)
app.post('/add-name', adminCheck, async (req, res) => {
    try {
        const { id, area, code, name, mothersName, status } = req.body;
        const newName = new Name({ id, area, code, name, mothersName, status, source: 'manual' });
        await newName.save();
        res.status(201).send(newName);
    } catch (error) {
        res.status(500).send({ error: 'Failed to add name' });
    }
});

// Upload and process CSV (admin only)
app.post('/upload/csv', adminCheck, upload.single('file'), (req, res) => {
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

// Fetch all pending names (admin only)
app.get('/pending', adminCheck, async (req, res) => {
    try {
        const pendingNames = await Name.find({ isApproved: false });
        res.status(200).send(pendingNames);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch pending names' });
    }
});

// Verify names (admin only)
app.post('/verify', adminCheck, async (req, res) => {
    try {
        const { ids } = req.body;
        await Name.updateMany({ _id: { $in: ids } }, { isApproved: true });
        res.status(200).send({ message: 'Names verified' });
    } catch (error) {
        res.status(500).send({ error: 'Failed to verify names' });
    }
});

// Fetch all verified names (public)
app.get('/names', async (req, res) => {
    try {
        const verifiedNames = await Name.find({ isApproved: true });
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