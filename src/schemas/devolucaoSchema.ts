import { z } from "zod";

const ALLOWED_TYPES_DEVOLUCAO = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/quicktime", // .mov
    "video/webm",
];

const MAX_SIZE_DEVOLUCAO = 50 * 1024 * 1024; // 50MB

export const devolucaoSchema = z.object({
  motivo: z
    .string()
    .min(1, "O motivo da devolução é obrigatório")
    .max(1000, "O motivo deve ter no máximo 1000 caracteres"),

  arquivo: z
    .custom<FileList>((val) => val instanceof FileList, {
      message: "Arquivo inválido",
    })
    .refine(
      (files) => !files || files.length === 0 || files[0].size <= MAX_SIZE_DEVOLUCAO,
      { message: "Arquivo muito grande. Máximo 50MB." }
    )
    .refine(
      (files) => !files || files.length === 0 || ALLOWED_TYPES_DEVOLUCAO.includes(files[0].type),
      { message: "Tipo não permitido. Envie uma foto (JPG, PNG, WEBP) ou vídeo (MP4, MOV, WEBM)." }
    )
    .optional(),

  itens: z
    .record(
        z.string(), 
        z.object({
            selected: z.boolean(),
            quantity: z
            .number("A quantidade deve ser um número")
            .min(0, "A quantidade mínima é 0"),
        })
    )
    .refine(
        (itens) => Object.values(itens).some((i) => i.selected),
        { message: "Selecione ao menos um item para devolução" }
    )
    .refine(
        (itens) =>
            Object.values(itens).every(
                (i) => !i.selected || i.quantity > 0
            ),
        { message: "Itens selecionados devem ter quantidade maior que 0" }
    ),
});

export type DevolucaoSchemaType = z.infer<typeof devolucaoSchema>;