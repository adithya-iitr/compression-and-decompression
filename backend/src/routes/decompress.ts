import express from 'express';
import fs from 'fs';
import path from 'path';
import { decompressFile } from '../utils/compress';
const router = express.Router();

router.post('/decompress', async (req, res:any) => {
  const { filePath, algorithm, originalExtension } = req.body;

  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(400).json({ message: 'Invalid or missing file path.' });
  }

  try {
    const { decompressedPath, decompressionTime } = await decompressFile(filePath, algorithm, originalExtension);

    const downloadsDir = path.join(__dirname, '..', 'downloads');
    if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir);

    const finalFilename = path.basename(decompressedPath);
    const destinationPath = path.join(downloadsDir, finalFilename);
    await fs.promises.copyFile(decompressedPath, destinationPath);

    const stats = fs.statSync(destinationPath);

    res.status(200).json({
      decompressedFilePath: finalFilename,
      decompressedSize: stats.size,
      decompressionTime,
    });
  } catch (err) {
    console.error('[DECOMPRESSION ERROR]', err);
    res.status(500).json({ message: 'Decompression failed.' });
  }
});

export default router;
