import { GoldPurity } from './rate.model';

export type MetalType = 'gold' | 'silver';
export type LabourChargeType = 'percentage' | 'perGram' | 'none';
export type GstChargeType = 'percentage' | 'perGram' | 'none';

export type GoldProductCategory = 'jewellery' | 'bullion';

export const GOLD_JEWELLERY_OPTIONS = [
  'Chain',
  'Ring',
  'Bangle',
  'Bracelet',
  'Necklace',
  'Earrings',
  'Pendant',
  'Mangalsutra',
  'Kada',
  'Other Jewellery'
] as const;

export const GOLD_BULLION_OPTIONS = [
  'Gold Bar',
  'Gold Coin',
  'Gold Ladi',
  'Other Bullion'
] as const;

export const SILVER_PRODUCT_OPTIONS = [
  'Silver Jewellery',
  'Silver Chain',
  'Silver Ring',
  'Silver Bracelet',
  'Silver Anklet (Payal)',
  'Silver Coin',
  'Silver Bar',
  'Silver Ladi',
  'Silver Utensil (Bartan)',
  'Silver Murti / Idol',
  'Other Silver Item'
] as const;

export type GoldJewelleryType = typeof GOLD_JEWELLERY_OPTIONS[number];
export type GoldBullionType = typeof GOLD_BULLION_OPTIONS[number];
export type SilverProductType = typeof SILVER_PRODUCT_OPTIONS[number];

export interface GoldCalculationInput {
  purity: GoldPurity;
  isJewellery: boolean;
  productType: string;
  weightGrams: number;
  ratePerGram: number;
  labourType: LabourChargeType;
  labourValue: number;
  gstType?: GstChargeType;
  gstValue?: number;
  gstPercentage?: number;
}

export interface SilverCalculationInput {
  productType: string;
  weightGrams: number;
  ratePerGram: number;
  labourType: LabourChargeType;
  labourValue: number;
  gstType?: GstChargeType;
  gstValue?: number;
  gstPercentage?: number;
}

export interface CalculationResult {
  id: string;
  timestamp: number;
  metal: MetalType;
  purity?: GoldPurity;
  productTitle: string;
  weightGrams: number;
  ratePerGram: number;
  metalValue: number;
  labourType: LabourChargeType;
  labourInput: number;
  makingCharge: number;
  taxableValue: number;
  gstType: GstChargeType;
  gstInput: number;
  gstPercentage: number;
  gstAmount: number;
  finalPrice: number;
  formattedDate: string;
}
