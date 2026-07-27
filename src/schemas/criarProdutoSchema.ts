import { z } from "zod";

const MAX_SIZE_BYTES = 3 * 1024 * 1024 * 1024; // 3 GB

export const criarProdutoSchema = z.object({
    nome: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
    descricao: z.string().min(1, "Descrição é obrigatória"),
    preco: z
        .string()
        .min(1, "Preço é obrigatório")
        .refine((v) => !isNaN(Number(v.replace(",", "."))) && Number(v.replace(",", ".")) > 0, {
            message: "Preço deve ser um número positivo",
        }),
    porcentagem_desconto: z
        .string()
        .refine((v) => !isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100, {
            message: "Desconto deve ser entre 0 e 100",
        }),
    categoria: z.enum(["suplementos", "alimentos", "roupas", "acessorios"], {
        message: "Categoria inválida",
    }),
    imagem: z
        .instanceof(FileList)
        .refine((files) => files.length > 0, { message: "Imagem é obrigatória" })
        .refine(
            (files) => files[0]?.size <= MAX_SIZE_BYTES,
            { message: "Imagem deve ter no máximo 3 GB" }
        )
        .refine(
            (files) => ["image/jpeg", "image/png", "image/webp"].includes(files[0]?.type),
            { message: "Formato inválido. Use JPG, PNG ou WEBP" }
        ),
});

export type CriarProdutoSchemaType = z.infer<typeof criarProdutoSchema>;
