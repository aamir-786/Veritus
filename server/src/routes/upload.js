const express = require('express');
const router = express.Router();
const multer = require('multer');
const supabase = require('../config/supabase');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos and templates
  },
});

router.post('/', authenticateToken, requireAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file provided' });
  }

  const file = req.file;
  const originalName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const filePath = `${Date.now()}_${originalName}`;

  try {
    const { data, error } = await supabase.storage
      .from('assets')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from('assets')
      .getPublicUrl(filePath);

    return res.json({
      success: true,
      url: publicUrlData.publicUrl,
      path: filePath,
    });
  } catch (err) {
    console.error('Upload Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to upload file to storage.' });
  }
});

module.exports = router;
