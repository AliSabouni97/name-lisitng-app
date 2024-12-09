const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const tesseract = require('tesseract.js');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(bodyParser.json());

let names = []; // Verified names
let pending = []; // Names pending review
let categories = ["Uncategorized"]; // Default category

// Add name manually
app.post('/add-name', (req, res) => {
    const { name, category } = req.body;
    names.push({ name, category: category || 'Uncategorized' });
    res.send({ message: 'Name added', names });
});

// Upload CSV for review
app.post('/upload/csv', upload.single('file'), (req, res) => {
    const filePath = req.file.path;
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            pending.push({ name: row.Name, category: row.Category || 'Uncategorized', source: 'csv' });
        })
        .on('end', () => {
            fs.unlinkSync(filePath); // Clean up
            res.send({ message: 'CSV processed for review', pending });
        });
});

// Upload Image (OCR) for review
app.post('/upload/image', upload.single('file'), (req, res) => {
    const filePath = req.file.path;
    tesseract.recognize(filePath, 'eng')
        .then(({ data: { text } }) => {
            text.split('\n').forEach((name) => {
                if (name.trim()) {
                    pending.push({ name: name.trim(), category: 'Uncategorized', source: 'ocr' });
                }
            });
            fs.unlinkSync(filePath); // Clean up
            res.send({ message: 'OCR processed for review', pending });
        })
        .catch((err) => res.status(500).send({ error: err.message }));
});

// Get pending names
app.get('/pending', (req, res) => {
    res.send(pending);
});

// Verify pending names
app.post('/verify', (req, res) => {
    const { verified } = req.body; // Expect an array of verified names with categories
    names = names.concat(verified); // Add verified names to the main list
    pending = pending.filter((p) => !verified.find((v) => v.name === p.name)); // Remove verified from pending
    res.send({ message: 'Verification complete', names });
});

// Get all names
app.get('/names', (req, res) => {
    res.send(names);
});

// Add category
app.post('/categories', (req, res) => {
    const { category } = req.body;
    categories.push(category);
    res.send({ message: 'Category added', categories });
});

// Get categories
app.get('/categories', (req, res) => {
    res.send(categories);
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
