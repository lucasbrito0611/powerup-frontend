import { z } from "zod";

export const editDevolucaoSchema = z.object({
  status: z.enum(['1', '2', '3', '4', '5'], {
    message: "Status inválido",
  }),
});

export type EditDevolucaoSchemaType = z.infer<typeof editDevolucaoSchema>;
