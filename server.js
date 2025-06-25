const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

// Use path.join() for cross-platform compatibility
const uploadsDir = path.join(__dirname, 'uploads');

// Create uploads directory if it doesn't exist (with recursive option)
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Uploads directory created successfully.');
}

const PORT = 3000;

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir); // Use the absolute path
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

// Upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf') {
      return cb(new Error('Only PDFs are allowed!'));
    }
    cb(null, true);
  },
});

// Serve frontend
app.use(express.static('public'));

// Upload endpoint with better error handling
app.post('/upload', upload.single('paper'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file was uploaded.');
  }
  res.send('File uploaded successfully!');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(err.message);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
  console.log(`Uploads directory: ${uploadsDir}`);
});