// src/lib/validators.ts

/**
 * Remove all non‑numeric characters from a string.
 */
export function onlyDigits(value: string): string {
  return value.replace(/\D+/g, "");
}

/**
 * Basic CPF validation (Brazilian tax ID).
 * It strips formatting, checks length, rejects repeated digits, and verifies checksum.
 */
export function isValidCpf(cpf: string): boolean {
  const numbers = onlyDigits(cpf);
  if (numbers.length !== 11) return false;
  // Reject sequences like 111.111.111‑11
  if (/^(\d)\1{10}$/.test(numbers)) return false;

  const calcCheck = (factor: number) => {
    let sum = 0;
    for (let i = 0; i < factor - 1; i++) {
      sum += Number(numbers[i]) * (factor - i);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  const digit1 = calcCheck(10);
  const digit2 = calcCheck(11);
  return digit1 === Number(numbers[9]) && digit2 === Number(numbers[10]);
}

/**
 * Strict e‑mail validation using a simple RFC‑5322‑compatible regex.
 */
export function isValidEmailStrict(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  return re.test(email);
}
