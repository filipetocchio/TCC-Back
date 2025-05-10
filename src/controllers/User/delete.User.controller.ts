import { prisma } from '../../utils/prisma';
import { Request, Response } from 'express';
import { z } from 'zod';

const deleteUserSchema = z.object({
  userId: z
    .string({ required_error: 'O parâmetro userId é obrigatório.' })
    .regex(/^\d+$/, { message: 'ID do usuário deve ser um número válido.' })
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0, { message: 'ID do usuário inválido.' }),
});

const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = deleteUserSchema.parse(req.params);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado.',
        error: 'Usuário não encontrado.',
      });
    }

    if (user.excludedAt) {
      return res.status(400).json({
        success: false,
        message: 'Usuário já foi deletado.',
        error: 'Usuário já foi deletado.',
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { excludedAt: new Date() },
    });

    return res.status(200).json({
      success: true,
      message: 'Usuário deletado com sucesso.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
        error: error.errors[0].message,
      });
    }

    console.error(`Erro ao deletar usuário ${req.params.userId}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor.',
      error: 'Ocorreu um erro ao processar a solicitação.',
    });
  }
};

export { deleteUser };