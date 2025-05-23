// lib/env.ts
import { z } from "zod";

// Define o schema esperado
const envSchema = z.object({
  GROQ_API_KEY: z.string().min(1, "A variável GROQ_API_KEY é obrigatória."), 
});

// Faz o parse + validação
const _env = envSchema.safeParse(process.env);

// Se inválido, encerra a aplicação com erro descritivo
if (!_env.success) {
  console.error("❌ Erro nas variáveis de ambiente:", _env.error.format());
  throw new Error("❌ Falha na validação das variáveis de ambiente.");
}

export const env = _env.data; 