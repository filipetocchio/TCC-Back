import { prisma } from '../../utils/prisma';
import { Request, Response } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadPhotoSchema = z.object({
  idPropriedade: z.number().int().positive('ID da propriedade deve ser um número inteiro positivo'),
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `photo-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens (JPEG, PNG, GIF) são permitidas'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('foto');

const UploadPropertyPhoto = async (req: Request, res: Response) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Erro no upload: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma foto foi enviada' });
    }

    try {
      const parsedBody = uploadPhotoSchema.safeParse(req.body);
      if (!parsedBody.success) {
        return res.status(400).json({ error: parsedBody.success === false ? parsedBody.error.errors : [] });
      }

      const { idPropriedade } = parsedBody.data;

      const propriedade = await prisma.propriedades.findUnique({
        where: { id: idPropriedade },
      });
      if (!propriedade) {
        return res.status(404).json({ error: `Propriedade com ID ${idPropriedade} não encontrada` });
      }

      const foto = await prisma.fotosPropriedade.create({
        data: {
          idPropriedade,
          documento: `/uploads/${req.file.filename}`,
          dataUpload: new Date(),
        },
        include: {
          propriedade: {
            select: {
              id: true,
              nomePropriedade: true,
            },
          },
        },
      });

      return res.status(201).json({
        id: foto.id,
        idPropriedade: foto.idPropriedade,
        documento: foto.documento,
        dataUpload: foto.dataUpload,
        propriedade: foto.propriedade,
      });
    } catch (error) {
      console.error('Erro ao salvar foto:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });
};

export { UploadPropertyPhoto };