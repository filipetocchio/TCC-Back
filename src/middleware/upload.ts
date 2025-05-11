// src/utils/upload.ts
import multer from 'multer';
import { join } from 'path';
import fs from 'fs';

const UPLOAD_DIR = join(__dirname, '../../uploads/profile');

// Garante que a pasta exista
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const ext = file.originalname.split('.').pop();
    cb(null, `user-${timestamp}.${ext}`);
  },
});

export const upload = multer({ storage });
