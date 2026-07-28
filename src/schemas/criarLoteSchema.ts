import { z } from "zod";

export const criarLoteSchema = z.object({
    produto: z
        .string()
        .min(1, "Produto é obrigatório")
        .refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
            message: "ID de produto inválido",
        }),
    quantidade: z
        .string()
        .min(1, "Quantidade é obrigatória")
        .refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
            message: "Quantidade deve ser maior que zero",
        }),
    validade: z
        .string()
        .optional()
        .refine((v) => !v || !isNaN(Date.parse(v)), {
            message: "Data de validade inválida",
        }),
});

export type CriarLoteSchemaType = z.infer<typeof criarLoteSchema>;
