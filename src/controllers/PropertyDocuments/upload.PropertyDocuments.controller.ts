import { prisma } from '../../utils/prisma';
import { Request, Response } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDocumentSchema = z.object({
  idPropriedade: z.number().int().positive('ID da propriedade deve ser um número inteiro positivo'),
  tipoDocumento: z.enum(['IPTU', 'Matricula', 'Conta de Luz', 'Outros'], {
    errorMap: () => ({ message: 'Tipo de documento inválido. Use "IPTU", "Matricula", "Conta de Luz" ou "Outros"' }),
  }),
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
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens (JPEG, PNG, GIF) ou PDFs são permitidos'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('documento');

const UploadPropertyDocuments = async (req: Request, res: Response) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Erro no upload: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
    }

    try {
      const parsedBody = uploadDocumentSchema.safeParse(req.body);
      if (!parsedBody.success) {
        return res.status(400).json({ error: parsedBody.success === false ? parsedBody.error.errors : [] });
      }

      const { idPropriedade, tipoDocumento } = parsedBody.data;

      const propriedade = await prisma.propriedades.findUnique({
        where: { id: idPropriedade },
      });
      if (!propriedade) {
        return res.status(404).json({ error: `Propriedade com ID ${idPropriedade} não encontrada` });
      }

      const documento = await prisma.documentosPropriedade.create({
        data: {
          idPropriedade,
          tipoDocumento,
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
        id: documento.id,
        idPropriedade: documento.idPropriedade,
        tipoDocumento: documento.tipoDocumento,
        documento: documento.documento,
        dataUpload: documento.dataUpload,
        propriedade: documento.propriedade,
      });
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });
};

export { UploadPropertyDocuments };