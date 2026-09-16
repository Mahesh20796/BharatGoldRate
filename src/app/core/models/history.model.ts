import { CalculationResult } from './calculator.model';

export interface CalculationFilter {
  metal?: 'all' | 'gold' | 'silver';
  searchQuery?: string;
  sortBy?: 'newest' | 'oldest' | 'amountHigh' | 'amountLow';
}

export type HistoryItem = CalculationResult;
