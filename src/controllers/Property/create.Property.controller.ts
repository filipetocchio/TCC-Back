import { prisma } from '../../utils/prisma';
import { Request, Response } from "express";
import { z } from "zod";

const createPropertySchema = z.object({
  nomePropriedade: z.string().min(1, { message: "O nome da propriedade é obrigatório." }).max(100, { message: "O nome da propriedade não pode exceder 100 caracteres." }),
  enderecoCep: z.string().optional().refine(val => !val || /^\d{8}$/.test(val), { message: "O CEP deve ter 8 dígitos." }),
  enderecoCidade: z.string().optional(),
  enderecoBairro: z.string().optional(),
  enderecoLogradouro: z.string().optional(),
  enderecoNumero: z.string().optional(),
  enderecoComplemento: z.string().optional(),
  enderecoPontoReferencia: z.string().optional(),
  tipo: z.enum(["Casa", "Apartamento", "Chacara", "Lote", "Outros"], { invalid_type_error: "Tipo de propriedade inválido." }),
  valorEstimado: z.number().positive({ message: "O valor estimado deve ser positivo." }).optional(),
  documento: z.string().optional(),
  userId: z.number().int().positive({ message: "ID do usuário inválido." }),
});

const createProperty = async (req: Request, res: Response) => {
  try {
    const {
      nomePropriedade,
      enderecoCep,
      enderecoCidade,
      enderecoBairro,
      enderecoLogradouro,
      enderecoNumero,
      enderecoComplemento,
      enderecoPontoReferencia,
      tipo,
      valorEstimado,
      documento,
      userId,
    } = createPropertySchema.parse(req.body);

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
        error: `Usuário está desativado (ID: ${userId}).`,
        message: "Não é possível criar uma propriedade para um usuário desativado.",
    });
    }

    const property = await prisma.propriedades.create({
      data: {
        nomePropriedade,
        enderecoCep,
        enderecoCidade,
        enderecoBairro,
        enderecoLogradouro,
        enderecoNumero,
        enderecoComplemento,
        enderecoPontoReferencia,
        tipo,
        valorEstimado,
        documento,
      },
    });

    await prisma.usuariosPropriedades.create({
      data: {
        idUsuario: userId,
        idPropriedade: property.id,
        permissao: "proprietario_master",
      },
    });

    return res.status(201).json({
      success: true,
      message: `Propriedade ${nomePropriedade} criada com sucesso.`,
      data: {
        id: property.id,
        nomePropriedade: property.nomePropriedade,
        tipo: property.tipo,
        dataCadastro: property.dataCadastro,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0].message,
        message: error.errors[0].message,
      });
    }
    console.error("Erro ao criar propriedade:", error);
    return res.status(500).json({
      success: false,
      error: "Erro interno do servidor.",
      message: "Erro interno do servidor.",
    });
  }
};

export { createProperty };