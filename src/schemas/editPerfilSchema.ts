import { z } from "zod";

export const editPerfilSchema = z.object({
    nome: z.string().min(1, "O nome é obrigatório"),
    email: z.email("Email inválido"),
    cpf: z
        .string()
        .max(15, "O CPF deve ter no máximo 15 caracteres")
        .refine(
            (val) => !val || val.replace(/\D/g, '').length === 11,
            "O CPF deve conter 11 dígitos"
        )
        .optional()
        .or(z.literal("")),
    telefone_celular: z
        .string()
        .refine(
            (val) => {
                if (!val) return true;
                const len = val.replace(/\D/g, '').length;
                return len >= 10 && len <= 11;
            },
            "O telefone deve ter DDD e no mínimo 10 dígitos"
        )
        .optional()
        .or(z.literal("")),
});

export type EditPerfilSchemaType = z.infer<typeof editPerfilSchema>;