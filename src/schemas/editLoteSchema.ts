import { z } from "zod";

export const editLoteSchema = z.object({
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

export type EditLoteSchemaType = z.infer<typeof editLoteSchema>;
