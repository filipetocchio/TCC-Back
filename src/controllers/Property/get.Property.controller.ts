import { prisma } from '../../utils/prisma';
import { Request, Response } from "express";
import { z } from "zod";

const getPropertySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 10))
    .refine(val => val > 0, { message: "Limit must be a positive number." }),
  page: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 1))
    .refine(val => val > 0, { message: "Page must be a positive number." }),
  search: z.string().optional(),
  showDeleted: z.enum(["true", "false", "only"]).optional().default("false"),
  sortBy: z
    .enum(["dataCadastro", "valorEstimado", "nomePropriedade"])
    .optional()
    .default("dataCadastro"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

const getProperty = async (req: Request, res: Response) => {
  try {
    const { limit, page, search, showDeleted, sortBy, sortOrder } = getPropertySchema.parse(req.query);

    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { nomePropriedade: { contains: search, mode: "insensitive" } },
        { enderecoCep: { contains: search, mode: "insensitive" } },
        { enderecoCidade: { contains: search, mode: "insensitive" } },
        { enderecoBairro: { contains: search, mode: "insensitive" } },
        { enderecoLogradouro: { contains: search, mode: "insensitive" } },
        { tipo: { contains: search, mode: "insensitive" } },
        { documento: { contains: search, mode: "insensitive" } },
      ];
    }

    if (showDeleted === "false") {
      where.excludedAt = null;
    } else if (showDeleted === "only") {
      where.excludedAt = { not: null };
    }

    const orderBy = { [sortBy]: sortOrder };

    const [properties, total] = await Promise.all([
      prisma.propriedades.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          nomePropriedade: true,
          enderecoCep: true,
          enderecoCidade: true,
          enderecoBairro: true,
          enderecoLogradouro: true,
          enderecoNumero: true,
          enderecoComplemento: true,
          enderecoPontoReferencia: true,
          tipo: true,
          valorEstimado: true,
          documento: true,
          dataCadastro: true,
          usuarios: {
            select: {
              usuario: { select: { id: true, nomeCompleto: true } },
              permissao: true,
            },
          },
          fotos: {
            select: { id: true, documento: true },
          },
          documentos: {
            select: { id: true, tipoDocumento: true, documento: true },
          },
        },
      }),
      prisma.propriedades.count({ where }),
    ]);

    const formattedProperties = properties.map(property => ({
      ...property,
      usuarios: property.usuarios.map(u => ({
        id: u.usuario.id,
        nomeCompleto: u.usuario.nomeCompleto,
        permissao: u.permissao,
      })),
      fotos: property.fotos,
      documentos: property.documentos,
    }));

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      message: "Propriedades recuperadas com sucesso.",
      data: {
        properties: formattedProperties,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
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
    console.error("Erro no getProperty:", error);
    return res.status(500).json({
      success: false,
      error: "Erro interno do servidor.",
      message: error instanceof Error ? error.message : "Erro interno do servidor.",
    });
  }
};

export { getProperty };