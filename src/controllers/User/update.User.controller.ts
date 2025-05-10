import { prisma } from '../../utils/prisma';
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";

const updateUserSchema = z.object({
  email: z.string().email({ message: "Formato de e-mail inválido." }).optional(),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }).optional(),
  nomeCompleto: z.string().min(1, { message: "O nome completo é obrigatório." }).max(100, { message: "O nome completo não pode exceder 100 caracteres." }).optional(),
  telefone: z.string().optional().refine(val => !val || /^\d{10,11}$/.test(val), { message: "O número de telefone deve ter 10 ou 11 dígitos." }),
  userId: z.number().int().positive({ message: "ID do usuário inválido." }),
});

const updateUser = async (req: Request, res: Response) => {
  try {
    const { email, password, nomeCompleto, telefone, userId } = updateUserSchema.parse({
      ...req.body,
      userId: parseInt(req.params.id),
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Usuário não encontrado.",
        message: "Usuário não encontrado.",
      });
    }

    if (user.excludedAt) {
      return res.status(400).json({
        success: false,
        error: "Usuário já foi deletado.",
        message: "Usuário já foi deletado.",
      });
    }

    if (email) {
      const duplicateEmail = await prisma.user.findFirst({
        where: { email, id: { not: userId } },
      });
      if (duplicateEmail) {
        return res.status(409).json({
          success: false,
          error: "Este e-mail já está em uso.",
          message: "Este e-mail já está em uso.",
        });
      }
    }

    const updateData: any = {};
    if (email) updateData.email = email;
    if (nomeCompleto) updateData.nomeCompleto = nomeCompleto;
    if (telefone !== undefined) updateData.telefone = telefone;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        nomeCompleto: true,
        telefone: true,
        dataCadastro: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Usuário atualizado com sucesso.",
      data: updatedUser,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0].message,
        message: error.errors[0].message,
      });
    }
    return res.status(500).json({
      success: false,
      error: "Erro interno do servidor.",
      message: "Erro interno do servidor.",
    });
  }
};

export { updateUser };