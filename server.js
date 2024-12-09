const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const tesseract = require('tesseract.js');
const bodyParser = require('body-parser');
const fs = require('fs');
const mongoose = require('mongoose');

// Initialize app and middleware
const app = express();
const upload = multer({ dest: 'uploads/' }); // Temporary folder for uploads
app.use(bodyParser.json());

// MongoDB connection
const connectDB = async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect('mongodb://localhost/names_review_app', { useNewUrlParser: true, useUnifiedTopology: true });
    }
};

connectDB().then(() => console.log('MongoDB connected')).catch(err => console.error('MongoDB connection error:', err));

// Models
const Name = mongoose.model('Name', new mongoose.Schema({
    name: String,
    category: String,
    source: String
}));

const Category = mongoose.model('Category', new mongoose.Schema({
    name: String
}));

// Basic route for testing
app.get('/', (req, res) => {
    res.send('Names Review App is running!');
});

// Add a name manually
app.post('/add-name', async (req, res) => {
    try {
        const { name, category } = req.body;
        const newName = new Name({ name, category, source: 'manual' });
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
                const names = results.map(row => ({ name: row.name, category: row.category || 'Uncategorized', source: 'csv' }));
                await Name.insertMany(names);
                res.status(201).send(names);
            } catch (error) {
                res.status(500).send({ error: 'Failed to process CSV' });
            }
        });
});

// Upload and process image with OCR
app.post('/upload/image', upload.single('file'), (req, res) => {
    tesseract.recognize(req.file.path, 'eng')
        .then(async ({ data: { text } }) => {
            const names = text.split('\n').map(name => ({ name: name.trim(), category: 'Uncategorized', source: 'ocr' }));
            await Name.insertMany(names);
            res.status(201).send(names);
        })
        .catch(error => {
            res.status(500).send({ error: 'Failed to process image' });
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

// Add and fetch categories
app.post('/categories', async (req, res) => {
    try {
        const { name } = req.body;
        const newCategory = new Category({ name });
        await newCategory.save();
        res.status(201).send(newCategory);
    } catch (error) {
        res.status(500).send({ error: 'Failed to add category' });
    }
});

app.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).send(categories);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch categories' });
    }
});

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;