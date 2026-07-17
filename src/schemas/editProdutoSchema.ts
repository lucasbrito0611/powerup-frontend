import { z } from "zod";

export const editProdutoSchema = z.object({
    nome: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
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
        .optional()
        .refine(
            (files) => !files || files.length === 0 || files[0].size <= 5 * 1024 * 1024,
            { message: "Imagem deve ter no máximo 5MB" }
        )
        .refine(
            (files) => !files || files.length === 0 || ["image/jpeg", "image/png", "image/webp"].includes(files[0].type),
            { message: "Formato inválido. Use JPG, PNG ou WEBP" }
        ),
});

export type EditProdutoSchemaType = z.infer<typeof editProdutoSchema>;
