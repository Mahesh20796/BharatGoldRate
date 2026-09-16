import { Injectable } from '@angular/core';
import {
  CalculationResult,
  GoldCalculationInput,
  SilverCalculationInput,
  LabourChargeType
} from '../models/calculator.model';

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {

  /**
   * Helper to round monetary amounts to 2 decimal places with decimal-safety
   */
  round(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  // --- Gold Calculations ---

  calculateGoldValue(weightGrams: number, ratePerGram: number): number {
    if (weightGrams <= 0 || ratePerGram <= 0) return 0;
    return this.round(weightGrams * ratePerGram);
  }

  calculateMakingCharge(
    goldValue: number,
    weightGrams: number,
    labourType: LabourChargeType,
    labourValue: number
  ): number {
    if (labourType === 'none' || labourValue <= 0) return 0;
    if (labourType === 'percentage') {
      return this.round((goldValue * labourValue) / 100);
    }
    if (labourType === 'perGram') {
      return this.round(weightGrams * labourValue);
    }
    return 0;
  }

  calculateTaxableValue(metalValue: number, makingCharge: number): number {
    return this.round(metalValue + makingCharge);
  }

  calculateGST(taxableValue: number, gstPercentage: number): number {
    if (taxableValue <= 0 || gstPercentage <= 0) return 0;
    return this.round((taxableValue * gstPercentage) / 100);
  }

  calculateFinalPrice(taxableValue: number, gstAmount: number): number {
    return this.round(taxableValue + gstAmount);
  }

  // --- Silver Calculations ---

  calculateSilverValue(weightGrams: number, ratePerGram: number): number {
    if (weightGrams <= 0 || ratePerGram <= 0) return 0;
    return this.round(weightGrams * ratePerGram);
  }

  calculateSilverMakingCharge(
    silverValue: number,
    weightGrams: number,
    labourType: LabourChargeType,
    labourValue: number
  ): number {
    return this.calculateMakingCharge(silverValue, weightGrams, labourType, labourValue);
  }

  calculateSilverGST(taxableValue: number, gstPercentage: number): number {
    return this.calculateGST(taxableValue, gstPercentage);
  }

  calculateSilverFinalPrice(taxableValue: number, gstAmount: number): number {
    return this.calculateFinalPrice(taxableValue, gstAmount);
  }

  // --- Master Full Calculation Flows ---

  calculateGold(input: GoldCalculationInput): CalculationResult {
    const metalValue = this.calculateGoldValue(input.weightGrams, input.ratePerGram);
    const makingCharge = this.calculateMakingCharge(
      metalValue,
      input.weightGrams,
      input.labourType,
      input.labourValue
    );
    const taxableValue = this.calculateTaxableValue(metalValue, makingCharge);
    const gstAmount = this.calculateGST(taxableValue, input.gstPercentage);
    const finalPrice = this.calculateFinalPrice(taxableValue, gstAmount);

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return {
      id: 'calc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
      metal: 'gold',
      purity: input.purity,
      productTitle: input.productType,
      weightGrams: input.weightGrams,
      ratePerGram: input.ratePerGram,
      metalValue,
      labourType: input.labourType,
      labourInput: input.labourValue,
      makingCharge,
      taxableValue,
      gstPercentage: input.gstPercentage,
      gstAmount,
      finalPrice,
      formattedDate
    };
  }

  calculateSilver(input: SilverCalculationInput): CalculationResult {
    const metalValue = this.calculateSilverValue(input.weightGrams, input.ratePerGram);
    const makingCharge = this.calculateSilverMakingCharge(
      metalValue,
      input.weightGrams,
      input.labourType,
      input.labourValue
    );
    const taxableValue = this.calculateTaxableValue(metalValue, makingCharge);
    const gstAmount = this.calculateSilverGST(taxableValue, input.gstPercentage);
    const finalPrice = this.calculateSilverFinalPrice(taxableValue, gstAmount);

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return {
      id: 'calc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
      metal: 'silver',
      productTitle: input.productType,
      weightGrams: input.weightGrams,
      ratePerGram: input.ratePerGram,
      metalValue,
      labourType: input.labourType,
      labourInput: input.labourValue,
      makingCharge,
      taxableValue,
      gstPercentage: input.gstPercentage,
      gstAmount,
      finalPrice,
      formattedDate
    };
  }
}
