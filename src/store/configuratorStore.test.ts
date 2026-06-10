import { describe, it, expect } from 'vitest';
import { 
  calculateTotalPrice, 
  calculateInstallment, 
  formatPrice,
  CarConfiguration 
} from './configuratorStore';

describe('configuratorStore functions', () => {
  describe('calculateTotalPrice', () => {
    it('should calculate base price correctly', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
        optionals: [],
      };
      expect(calculateTotalPrice(config)).toBe(40000);
    });

    it('should calculate price with sport wheels', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'sport',
        optionals: [],
      };
      // Base (40000) + Sport Wheels (2000)
      expect(calculateTotalPrice(config)).toBe(42000);
    });

    it('should calculate price with optionals', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
        optionals: ['precision-park', 'flux-capacitor'],
      };
      // Base (40000) + Precision Park (5500) + Flux Capacitor (5000)
      expect(calculateTotalPrice(config)).toBe(50500);
    });

    it('should calculate price with sport wheels and optionals', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'sport',
        optionals: ['flux-capacitor'],
      };
      // Base (40000) + Sport Wheels (2000) + Flux Capacitor (5000)
      expect(calculateTotalPrice(config)).toBe(47000);
    });
  });

  describe('calculateInstallment', () => {
    it('should calculate 12x installment with 2% compound interest correctly', () => {
      // Installment = (40000 * 0.02 * (1.02)^12) / ((1.02)^12 - 1) = ~ 3782.39
      expect(calculateInstallment(40000)).toBe(3782.38);
    });
  });

  describe('formatPrice', () => {
    it('should format number to BRL currency string', () => {
      const formatted = formatPrice(40000);
      // Different Node versions might use different non-breaking spaces for formatting
      const normalized = formatted.replace(/\s/g, ' ').replace(/\u00A0/g, ' ');
      // Handle possible variations: 'R$ 40.000,00' or 'R$ 40.000,00'
      expect(normalized).toMatch(/R\$\s?40\.000,00/);
    });
  });
});
