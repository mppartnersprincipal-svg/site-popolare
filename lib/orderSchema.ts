// Validação do formulário de encomenda. Importado sob demanda (no envio) para tirar o zod do bundle inicial.
import { z } from "zod";

const PHONE_DIGITS = /^\d{10,11}$/;

export const orderSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(100, "Nome muito longo"),
  telefone: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => PHONE_DIGITS.test(v), "Informe um telefone com DDD"),
  unidade: z.enum(["setor-sul", "eldorado"]),
  data: z.string().min(1, "Escolha a data de retirada"),
  itens: z.string().trim().min(3, "Conte o que você quer encomendar").max(600, "Resuma o pedido em até 600 caracteres"),
  refratario: z.boolean(),
  observacoes: z.string().max(500).optional(),
});

export type OrderFields = keyof z.infer<typeof orderSchema>;
