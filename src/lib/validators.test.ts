import { describe, it, expect } from 'vitest';
import { isValidCpf, onlyDigits, isValidEmailStrict } from './validators';

// ── onlyDigits ────────────────────────────────────────────────────────────
describe('onlyDigits', () => {
  it('deve remover pontos e hífen de CPF formatado', () => {
    expect(onlyDigits('529.982.247-25')).toBe('52998224725');
  });

  it('deve remover parênteses, espaços e hífen de telefone', () => {
    expect(onlyDigits('(11) 98765-4321')).toBe('11987654321');
  });

  it('deve retornar string vazia quando não há dígitos', () => {
    expect(onlyDigits('abc-def')).toBe('');
  });

  it('deve manter string já composta só de dígitos intacta', () => {
    expect(onlyDigits('12345')).toBe('12345');
  });

  it('deve retornar string vazia para input vazio', () => {
    expect(onlyDigits('')).toBe('');
  });
});

// ── isValidCpf — CPFs Válidos ─────────────────────────────────────────────
describe('isValidCpf — CPFs válidos', () => {
  it('deve aceitar CPF válido com pontuação: 529.982.247-25', () => {
    expect(isValidCpf('529.982.247-25')).toBe(true);
  });

  it('deve aceitar CPF válido sem pontuação: 52998224725', () => {
    expect(isValidCpf('52998224725')).toBe(true);
  });

  it('deve aceitar CPF válido: 111.444.777-35', () => {
    expect(isValidCpf('111.444.777-35')).toBe(true);
  });

  it('deve aceitar CPF válido sem formatação: 11144477735', () => {
    expect(isValidCpf('11144477735')).toBe(true);
  });
});

// ── isValidCpf — Sequências Repetidas ────────────────────────────────────
describe('isValidCpf — CPFs com dígitos repetidos (bloqueados)', () => {
  const repeatedCpfs = [
    '000.000.000-00',
    '111.111.111-11',
    '222.222.222-22',
    '333.333.333-33',
    '444.444.444-44',
    '555.555.555-55',
    '666.666.666-66',
    '777.777.777-77',
    '888.888.888-88',
    '999.999.999-99',
  ];

  it.each(repeatedCpfs)('deve rejeitar CPF com todos os dígitos iguais: %s', (cpf) => {
    expect(isValidCpf(cpf)).toBe(false);
  });
});

// ── isValidCpf — Formato Inválido ────────────────────────────────────────
describe('isValidCpf — formato inválido', () => {
  it('deve rejeitar CPF com menos de 11 dígitos', () => {
    expect(isValidCpf('123.456.789')).toBe(false);
  });

  it('deve rejeitar CPF com mais de 11 dígitos', () => {
    expect(isValidCpf('123.456.789-001')).toBe(false);
  });

  it('deve rejeitar string vazia', () => {
    expect(isValidCpf('')).toBe(false);
  });

  it('deve rejeitar CPF composto só de letras', () => {
    expect(isValidCpf('abc.def.ghi-jk')).toBe(false);
  });
});

// ── isValidCpf — Dígitos Verificadores ────────────────────────────────────
describe('isValidCpf — dígitos verificadores incorretos', () => {
  it('deve rejeitar CPF com 1º dígito verificador errado: 529.982.247-35', () => {
    expect(isValidCpf('529.982.247-35')).toBe(false);
  });

  it('deve rejeitar CPF com 2º dígito verificador errado: 529.982.247-26', () => {
    expect(isValidCpf('529.982.247-26')).toBe(false);
  });

  it('deve rejeitar CPF com ambos os dígitos trocados: 529.982.247-52', () => {
    expect(isValidCpf('529.982.247-52')).toBe(false);
  });

  it('deve rejeitar CPF com último dígito incrementado: 529.982.247-26', () => {
    expect(isValidCpf('529.982.247-26')).toBe(false);
  });
});

// ── isValidEmailStrict ────────────────────────────────────────────────────
describe('isValidEmailStrict', () => {
  describe('Emails válidos', () => {
    it('deve aceitar email simples: usuario@dominio.com', () => {
      expect(isValidEmailStrict('usuario@dominio.com')).toBe(true);
    });

    it('deve aceitar email com subdomínio: user@mail.empresa.com.br', () => {
      expect(isValidEmailStrict('user@mail.empresa.com.br')).toBe(true);
    });

    it('deve aceitar email com números no nome: user123@dominio.com.br', () => {
      expect(isValidEmailStrict('user123@dominio.com.br')).toBe(true);
    });
  });

  describe('Emails inválidos', () => {
    it('deve rejeitar email sem @: usuariodominio.com', () => {
      expect(isValidEmailStrict('usuariodominio.com')).toBe(false);
    });

    it('deve rejeitar email sem domínio: usuario@', () => {
      expect(isValidEmailStrict('usuario@')).toBe(false);
    });

    it('deve rejeitar email sem extensão de domínio: usuario@dominio', () => {
      expect(isValidEmailStrict('usuario@dominio')).toBe(false);
    });

    it('deve rejeitar email com espaço: usuario @dominio.com', () => {
      expect(isValidEmailStrict('usuario @dominio.com')).toBe(false);
    });

    it('deve rejeitar string vazia', () => {
      expect(isValidEmailStrict('')).toBe(false);
    });
  });
});
