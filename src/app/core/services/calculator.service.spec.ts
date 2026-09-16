import { describe, it, expect, beforeEach } from 'vitest';
import { CalculatorService } from './calculator.service';

describe('CalculatorService', () => {
  let service: CalculatorService;

  beforeEach(() => {
    service = new CalculatorService();
  });

  it('should calculate gold value accurately', () => {
    // 0.500g at ₹14,800/g = ₹7,400
    const goldValue = service.calculateGoldValue(0.5, 14800);
    expect(goldValue).toBe(7400);
  });

  it('should calculate per-gram making charge accurately', () => {
    // 0.500g at ₹350/g = ₹175
    const makingCharge = service.calculateMakingCharge(7400, 0.5, 'perGram', 350);
    expect(makingCharge).toBe(175);
  });

  it('should calculate percentage making charge accurately', () => {
    // 10% on ₹7,400 = ₹740
    const makingCharge = service.calculateMakingCharge(7400, 0.5, 'percentage', 10);
    expect(makingCharge).toBe(740);
  });

  it('should calculate full gold invoice with making charge and GST (Example in Prompt)', () => {
    const result = service.calculateGold({
      purity: '22K',
      isJewellery: true,
      productType: 'Gold Chain',
      weightGrams: 0.5,
      ratePerGram: 14800,
      labourType: 'perGram',
      labourValue: 350,
      gstPercentage: 3
    });

    expect(result.metalValue).toBe(7400);
    expect(result.makingCharge).toBe(175);
    expect(result.taxableValue).toBe(7575);
    expect(result.gstAmount).toBe(227.25);
    expect(result.finalPrice).toBe(7802.25);
  });

  it('should calculate silver example accurately (Prompt Section 13)', () => {
    // Silver Rate = ₹230/g (₹2,30,000/Kg), Weight = 16.700g, Labour = 0
    const result = service.calculateSilver({
      productType: 'Silver Anklet',
      weightGrams: 16.7,
      ratePerGram: 230,
      labourType: 'none',
      labourValue: 0,
      gstPercentage: 3
    });

    expect(result.metalValue).toBe(3841);
    expect(result.makingCharge).toBe(0);
    expect(result.taxableValue).toBe(3841);
    expect(result.gstAmount).toBe(115.23);
    expect(result.finalPrice).toBe(3956.23);
  });
});
