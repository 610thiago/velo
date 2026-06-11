import { describe, it, expect } from 'vitest';
import { decideCreditStatus } from './creditDecision';

const BASE_PRICE = 40000;

describe('decideCreditStatus — Regras de Análise de Crédito', () => {

  // ── REGRA 1: Entrada Alta (≥ 50%) ──────────────────────────────────────
  describe('Regra 1 — Entrada Alta com Score Baixo (precedência máxima)', () => {
    it('deve retornar APROVADO quando entrada = 50% e score = 600 (< 700)', () => {
      expect(decideCreditStatus({ score: 600, totalPrice: BASE_PRICE, entryValue: 20000 }))
        .toBe('APROVADO');
    });

    it('deve retornar APROVADO quando entrada = 60% e score = 300 (muito baixo)', () => {
      expect(decideCreditStatus({ score: 300, totalPrice: BASE_PRICE, entryValue: 24000 }))
        .toBe('APROVADO');
    });

    it('deve retornar APROVADO na entrada exata de 50% com score = 499', () => {
      expect(decideCreditStatus({ score: 499, totalPrice: BASE_PRICE, entryValue: 20000 }))
        .toBe('APROVADO');
    });

    it('NÃO deve aplicar regra 1 quando entrada é 49% — deve cair em REPROVADO (score 499)', () => {
      expect(decideCreditStatus({ score: 499, totalPrice: BASE_PRICE, entryValue: 19600 }))
        .toBe('REPROVADO');
    });

    it('NÃO deve aplicar regra 1 quando score = 700 (limite é score < 700)', () => {
      // score 700 com entrada 50% → NÃO ativa regra 1; cai na regra 3 → EM_ANALISE
      expect(decideCreditStatus({ score: 700, totalPrice: BASE_PRICE, entryValue: 20000 }))
        .toBe('EM_ANALISE');
    });
  });

  // ── REGRA 2: Score Alto (> 700) ────────────────────────────────────────
  describe('Regra 2 — Score Alto (APROVADO)', () => {
    it('deve retornar APROVADO com score = 701 (um ponto acima do limiar)', () => {
      expect(decideCreditStatus({ score: 701, totalPrice: BASE_PRICE, entryValue: 0 }))
        .toBe('APROVADO');
    });

    it('deve retornar APROVADO com score = 900 (score excelente)', () => {
      expect(decideCreditStatus({ score: 900, totalPrice: BASE_PRICE, entryValue: 0 }))
        .toBe('APROVADO');
    });

    it('NÃO deve retornar APROVADO com score = 700 exato (limiar é > 700, não >=)', () => {
      expect(decideCreditStatus({ score: 700, totalPrice: BASE_PRICE, entryValue: 0 }))
        .toBe('EM_ANALISE');
    });
  });

  // ── REGRA 3: Score Médio (501–700) ────────────────────────────────────
  describe('Regra 3 — Score Médio (EM_ANALISE)', () => {
    it('deve retornar EM_ANALISE com score = 600 sem entrada', () => {
      expect(decideCreditStatus({ score: 600, totalPrice: BASE_PRICE, entryValue: 0 }))
        .toBe('EM_ANALISE');
    });

    it('deve retornar EM_ANALISE no limite inferior: score = 501', () => {
      expect(decideCreditStatus({ score: 501, totalPrice: BASE_PRICE, entryValue: 0 }))
        .toBe('EM_ANALISE');
    });

    it('deve retornar EM_ANALISE no limite superior: score = 700', () => {
      expect(decideCreditStatus({ score: 700, totalPrice: BASE_PRICE, entryValue: 0 }))
        .toBe('EM_ANALISE');
    });
  });

  // ── REGRA 4: Score Baixo (≤ 500) ──────────────────────────────────────
  describe('Regra 4 — Score Baixo (REPROVADO)', () => {
    it('deve retornar REPROVADO com score = 500 (limite superior da faixa baixa)', () => {
      expect(decideCreditStatus({ score: 500, totalPrice: BASE_PRICE, entryValue: 0 }))
        .toBe('REPROVADO');
    });

    it('deve retornar REPROVADO com score = 100 (mínimo)', () => {
      expect(decideCreditStatus({ score: 100, totalPrice: BASE_PRICE, entryValue: 0 }))
        .toBe('REPROVADO');
    });

    it('deve retornar REPROVADO com score = 0', () => {
      expect(decideCreditStatus({ score: 0, totalPrice: BASE_PRICE, entryValue: 0 }))
        .toBe('REPROVADO');
    });
  });

  // ── CASOS DE BORDA ─────────────────────────────────────────────────────
  describe('Casos de Borda', () => {
    it('deve lidar com entrada = 0 e score alto → APROVADO', () => {
      expect(decideCreditStatus({ score: 800, totalPrice: BASE_PRICE, entryValue: 0 }))
        .toBe('APROVADO');
    });

    it('deve lidar com entrada = 100% do totalPrice (pagamento completo na entrada)', () => {
      expect(decideCreditStatus({ score: 200, totalPrice: BASE_PRICE, entryValue: BASE_PRICE }))
        .toBe('APROVADO');
    });

    it('deve retornar REPROVADO quando totalPrice = 0 (evitar divisão por zero)', () => {
      expect(decideCreditStatus({ score: 300, totalPrice: 0, entryValue: 0 }))
        .toBe('REPROVADO');
    });
  });
});
