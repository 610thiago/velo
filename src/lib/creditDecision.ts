// src/lib/creditDecision.ts

export type OrderStatus = 'APROVADO' | 'EM_ANALISE' | 'REPROVADO';

export interface CreditDecisionInput {
  score: number;
  totalPrice: number;
  entryValue: number;
}

/**
 * Aplica as regras de análise de crédito para financiamento.
 *
 * Ordem de avaliação (a precedência importa):
 *  1️⃣  Entrada ≥ 50% do total E score < 700  → APROVADO  (garantia real)
 *  2️⃣  Score > 700                           → APROVADO
 *  3️⃣  501 ≤ score ≤ 700                    → EM_ANALISE
 *  4️⃣  score ≤ 500                          → REPROVADO
 */
export function decideCreditStatus(input: CreditDecisionInput): OrderStatus {
  const { score, totalPrice, entryValue } = input;
  const entryPercentage = totalPrice > 0 ? entryValue / totalPrice : 0;

  // Regra 1: Entrada alta com score abaixo de 700 → aprovado por garantia real
  if (entryPercentage >= 0.5 && score < 700) return 'APROVADO';

  // Regra 2: Score alto → aprovado diretamente
  if (score > 700) return 'APROVADO';

  // Regra 3: Score médio → encaminhar para análise manual
  if (score >= 501 && score <= 700) return 'EM_ANALISE';

  // Regra 4: Score baixo → reprovado
  return 'REPROVADO';
}
