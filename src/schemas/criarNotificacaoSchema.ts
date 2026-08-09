import { z } from "zod";

export const criarNotificacaoSchema = z.object({
    cliente: z.string().optional(),
    enviar_para_todos: z.boolean(),
    categoria: z.enum(
        ['status_pedido', 'status_devolucao', 'mensagem_personalizada', 'promocao', 'seguranca'],
        { message: "Categoria inválida" }
    ),
    titulo: z.string().min(1, "Título é obrigatório").max(100, "Máximo 100 caracteres"),
    texto: z.string().min(1, "Texto é obrigatório"),
}).refine((data) => {
    if (!data.enviar_para_todos && (!data.cliente || data.cliente.trim() === "")) {
        return false;
    }
    return true;
}, {
    message: "Selecione um cliente ou marque a opção de enviar para todos",
    path: ["cliente"],
});

export type CriarNotificacaoSchemaType = z.infer<typeof criarNotificacaoSchema>;
