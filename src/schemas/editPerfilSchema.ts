import { z } from "zod";

export const editPerfilSchema = z.object({
    nome: z.string().min(1, "O nome é obrigatório"),
    email: z.email("Email inválido"),
    cpf: z
        .string()
        .max(15, "O CPF deve ter no máximo 15 caracteres")
        .optional()
        .or(z.literal("")),
    telefone_celular: z
        .string()
        .refine(
            (val) => !val || (val.length >= 8 && val.length <= 15),
            "O telefone deve ter entre 8 e 15 caracteres"
        )
        .optional()
        .or(z.literal("")),
});

export type EditPerfilSchemaType = z.infer<typeof editPerfilSchema>;