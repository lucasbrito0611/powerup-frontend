import { z } from "zod";

export const editPedidoSchema = z.object({
  status: z.enum(['1', '2', '3', '4', '5'], {
    message: "Status inválido",
  }),
});

export type EditPedidoSchemaType = z.infer<typeof editPedidoSchema>;
