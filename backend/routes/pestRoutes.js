const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pestDetectionService = require('../services/pestDetectionService');
const { protect } = require('../middleware/auth');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/pests');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'pest-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// POST /api/pest/detect - Upload and analyze image for pests
router.post('/detect', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }

    const { language = 'en' } = req.body;
    const imagePath = req.file.path;

    console.log(`🐛 Analyzing image for pests: ${imagePath}`);

    // Call pest detection service
    const result = await pestDetectionService.detectPests(
      imagePath,
      req.user._id,
      language
    );

    res.json({
      success: true,
      ...result,
      imageUrl: `/uploads/pests/${req.file.filename}`
    });
  } catch (error) {
    console.error('Pest Detection Error:', error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to analyze image',
      error: error.message
    });
  }
});

// GET /api/pest/history - Get detection history
router.get('/history', protect, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const history = await pestDetectionService.getDetectionHistory(
      req.user._id,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching pest history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch detection history',
      error: error.message
    });
  }
});

// GET /api/pest/:id - Get specific detection
router.get('/:id', protect, async (req, res) => {
  try {
    const PestDetection = require('../models/PestDetection');
    
    const detection = await PestDetection.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!detection) {
      return res.status(404).json({
        success: false,
        message: 'Detection not found'
      });
    }

    res.json({
      success: true,
      data: detection
    });
  } catch (error) {
    console.error('Error fetching detection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch detection',
      error: error.message
    });
  }
});

// DELETE /api/pest/:id - Delete detection record
router.delete('/:id', protect, async (req, res) => {
  try {
    const PestDetection = require('../models/PestDetection');
    
    const detection = await PestDetection.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!detection) {
      return res.status(404).json({
        success: false,
        message: 'Detection not found'
      });
    }

    // Delete image file if exists
    if (detection.imageUrl && fs.existsSync(detection.imageUrl)) {
      fs.unlinkSync(detection.imageUrl);
    }

    res.json({
      success: true,
      message: 'Detection deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting detection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete detection',
      error: error.message
    });
  }
});

module.exports = router;
