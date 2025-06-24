import express, { Request, Response } from 'express';
import upload from '../middleware/multerConfig';
import fsPromises from 'fs/promises';
import fs from 'fs';

const router = express.Router();

router.post('/upload', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }

  const mime = file.mimetype;
  const isTextFile = mime.startsWith('text/') || ['application/json', 'application/xml', 'application/javascript'].includes(mime);

  try {
    let content: string | undefined = undefined;

    if (isTextFile) {
      content = await fsPromises.readFile(file.path, 'utf-8');
    }

    res.status(200).json({
      name: file.originalname,
      size: file.size,
      type: mime,
      content,
      path: file.path,
      message: 'File received successfully',
    });

    // Don't delete the file here — it's needed for compression
  } catch (err) {
    console.error('[UPLOAD ERROR]', err);
    res.status(500).send('File processing failed');
  }
});

export default router;
