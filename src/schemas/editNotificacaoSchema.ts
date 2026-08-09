import { z } from "zod";

export const editNotificacaoSchema = z.object({
    categoria: z.enum(
        ['status_pedido', 'status_devolucao', 'mensagem_personalizada', 'promocao', 'seguranca'],
        { message: "Categoria inválida" }
    ),
    titulo: z.string().min(1, "Título é obrigatório").max(100, "Máximo 100 caracteres"),
    texto: z.string().min(1, "Texto é obrigatório"),
});

export type EditNotificacaoSchemaType = z.infer<typeof editNotificacaoSchema>;
