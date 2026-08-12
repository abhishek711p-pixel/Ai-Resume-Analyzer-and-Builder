import express, { Request, Response } from 'express';
import multer from 'multer';
const pdfParse = require('pdf-parse');

const router = express.Router();

// Configure multer to store files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// POST /api/upload/parse-pdf
router.post('/parse-pdf', upload.single('resume'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const isPdf = req.file.mimetype.includes('pdf') || req.file.originalname.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      return res.status(400).json({ error: 'Uploaded file must be a PDF document.' });
    }

    const data = await pdfParse(req.file.buffer);
    
    // Return extracted text
    res.status(200).json({ text: data.text });
  } catch (error) {
    console.error('Error parsing PDF:', error);
    res.status(500).json({ error: 'Failed to parse PDF file' });
  }
});

export default router;
