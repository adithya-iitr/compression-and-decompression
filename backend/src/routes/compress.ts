import express from 'express';
import fs from 'fs';
import path from 'path';
import { compressFile } from '../utils/compress';
const router = express.Router();

router.post('/compress', async (req, res:any) => {
  const { filePath, algorithm } = req.body;

  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(400).json({ message: 'Invalid or missing file path.' });
  }

  try {
    const { compressedSize, compressionTime, compressedPath } = await compressFile(filePath, algorithm);

    const downloadsDir = path.join(__dirname, '..', 'downloads');
    if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir);

    const finalFilename = path.basename(compressedPath);
    const destinationPath = path.join(downloadsDir, finalFilename);
    await fs.promises.copyFile(compressedPath, destinationPath);

    res.status(200).json({
      compressedFilePath: finalFilename,
      compressedSize,
      compressionTime,
    });
  } catch (err) {
    console.error('[COMPRESSION ERROR]', err);
    res.status(500).json({ message: 'Compression failed.' });
  }
});

export default router;
