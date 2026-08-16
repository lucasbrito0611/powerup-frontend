import { z } from "zod";

export const cadastroSchema = z
  .object({
    nome: z.string().min(1, "O nome é obrigatório"),
    email: z.email("Email inválido"),
    cpf: z
        .string()
        .min(1, "O CPF é obrigatório")
        .refine(
            (val) => val.replace(/\D/g, '').length === 11,
            "O CPF deve conter 11 dígitos"
        ),
    telefone: z
        .string()
        .min(1, "O telefone é obrigatório")
        .refine(
            (val) => {
                const len = val.replace(/\D/g, '').length;
                return len >= 10 && len <= 11;
            },
            "O telefone deve ter DDD e no mínimo 10 dígitos"
        ),
    senha: z
        .string()
        .min(8, "A senha deve ter no mínimo 8 caracteres"),
    confirmacaoSenha: z.string(),
  })
  .refine((data) => data.senha === data.confirmacaoSenha, {
    path: ["confirmacaoSenha"],
    message: "As senhas não coincidem",
  });

export type CadastroSchemaType = z.infer<typeof cadastroSchema>;