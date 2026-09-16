export type GoldPurity = '24K' | '22K' | '18K';
export type RateUnit = 'gram' | '10gram' | '100gram' | 'kg';

export interface GoldRates {
  '24K': number; // Base rate per gram
  '22K': number; // Base rate per gram
  '18K': number; // Base rate per gram
}

export interface GoldPurityCardData {
  purity: GoldPurity;
  name: string;
  fineness: string;
  perGram: number;
  per10g: number;
  perKg: number;
  changePercent?: number;
  isUp?: boolean;
}

export interface SilverBreakdown {
  perGram: number;
  per10g: number;
  per100g: number;
  perKg: number;
  changePercent?: number;
  isUp?: boolean;
}

export interface MarketRateState {
  isLive: boolean;
  lastUpdated: string;
  goldRates: GoldRates; // in per gram
  silverRatePerKg: number; // in per kg
  source: 'MANUAL' | 'LIVE';
  goldTrendPercent?: number;
  silverTrendPercent?: number;
}

export interface HistoricalRateItem {
  year: number;
  rate24kPer10g?: number;
  rate22kPer10g?: number;
  rate18kPer10g?: number;
  rate24kPerGram?: number;
  rate22kPerGram?: number;
  rate18kPerGram?: number;
  ratePerKg?: number;
  ratePerGram?: number;
  ratePer10g?: number;
  ratePer100g?: number;
  changePercent: number;
  highPer10g?: number;
  lowPer10g?: number;
  highPerKg?: number;
  lowPerKg?: number;
  note?: string;
}
