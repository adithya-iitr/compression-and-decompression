import express from 'express';
import fs from 'fs';
import path from 'path';
import { compressAndDecompressFile } from '../utils/compress'; // Unified handler

const router = express.Router();

router.post('/compress', async (req, res:any) => {
  const { filePath, algorithm, originalExtension } = req.body;

  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(400).json({ message: 'Invalid or missing file path.' });
  }

  try {
    const start = Date.now();
    const {
      compressedSize,
      compressionTime,
      decompressedPath,
      decompressionTime
    } = await compressAndDecompressFile(filePath, algorithm, originalExtension);

    const downloadsDir = path.join(__dirname, '..', 'downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir);
    }

    const finalFilename = path.basename(decompressedPath);
    const destinationPath = path.join(downloadsDir, finalFilename);
    await fs.promises.copyFile(decompressedPath, destinationPath);

    const stats = fs.statSync(destinationPath);
    const end = Date.now();

    res.status(200).json({
      compressedSize,
      compressionTime,
      decompressedFilePath: finalFilename,
      decompressedSize: stats.size,
      decompressionTime,
    });

  } catch (err) {
    console.error('[COMPRESSION+DECOMPRESSION ERROR]', err);
    res.status(500).json({ message: 'Compression-Decompression failed.' });
  }
});

export default router;
