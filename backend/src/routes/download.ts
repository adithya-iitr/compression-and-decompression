// routes/download.ts
import express from 'express';
import path from 'path';
import fs from 'fs';
import mime from 'mime-types';

const router = express.Router();
const uploadsDir = path.resolve(__dirname, '../../uploads');

router.get('/download/:filename', (req, res:any) => {
  const { filename } = req.params;
  console.log(filename)
  const filePath = path.resolve(uploadsDir, filename);

  // Prevent path traversal
  if (!filePath.startsWith(uploadsDir)) {
    return res.status(400).send('Invalid file path');
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  const mimeType = mime.lookup(filePath) || 'application/octet-stream';

  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.sendFile(filePath);
});

export default router;
