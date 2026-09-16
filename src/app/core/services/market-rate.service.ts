import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { StorageService } from './storage.service';
import { GoldPurity, GoldRates, GoldPurityCardData, SilverBreakdown, MarketRateState, HistoricalRateItem, RateUnit } from '../models/rate.model';

@Injectable({
  providedIn: 'root'
})
export class MarketRateService {
  private readonly storage = inject(StorageService);
  private readonly http = inject(HttpClient);

  // Default benchmark Indian rates
  private readonly DEFAULT_GOLD_RATES: GoldRates = {
    '24K': 14800, // ₹14,800 / gram (₹1,48,000 / 10g)
    '22K': 13566.67, // ₹13,566.67 / gram (₹1,35,666.70 / 10g)
    '18K': 11100 // ₹11,100 / gram (₹1,11,000 / 10g)
  };

  private readonly DEFAULT_SILVER_RATE_PER_KG = 230000; // ₹2,30,000 / kg (₹230 / gram)

  // Reactive State Signals
  readonly goldRates = signal<GoldRates>(
    this.storage.getItem<GoldRates>('gold_rates', this.DEFAULT_GOLD_RATES)
  );

  readonly silverRatePerKg = signal<number>(
    this.storage.getItem<number>('silver_rate_kg', this.DEFAULT_SILVER_RATE_PER_KG)
  );

  readonly isLive = signal<boolean>(
    this.storage.getItem<boolean>('is_live_mode', false)
  );

  readonly lastUpdated = signal<string>(
    this.storage.getItem<string>('rate_last_updated', new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }))
  );

  readonly source = computed<'MANUAL' | 'LIVE'>(() => (this.isLive() ? 'LIVE' : 'MANUAL'));

  // Computed Purity Breakdowns
  readonly goldPurityList = computed<GoldPurityCardData[]>(() => {
    const rates = this.goldRates();
    return [
      {
        purity: '24K',
        name: '24 Karat Pure Gold',
        fineness: '99.9% Pure (999)',
        perGram: rates['24K'],
        per10g: rates['24K'] * 10,
        perKg: rates['24K'] * 1000,
        changePercent: 0.65,
        isUp: true
      },
      {
        purity: '22K',
        name: '22 Karat Standard Jewellery',
        fineness: '91.6% Hallmark (916)',
        perGram: rates['22K'],
        per10g: rates['22K'] * 10,
        perKg: rates['22K'] * 1000,
        changePercent: 0.60,
        isUp: true
      },
      {
        purity: '18K',
        name: '18 Karat Diamond Jewellery',
        fineness: '75.0% Hallmark (750)',
        perGram: rates['18K'],
        per10g: rates['18K'] * 10,
        perKg: rates['18K'] * 1000,
        changePercent: 0.58,
        isUp: true
      }
    ];
  });

  readonly silverBreakdown = computed<SilverBreakdown>(() => {
    const kgRate = this.silverRatePerKg();
    const perGram = kgRate / 1000;
    return {
      perGram: perGram,
      per10g: perGram * 10,
      per100g: perGram * 100,
      perKg: kgRate,
      changePercent: 1.2,
      isUp: true
    };
  });

  /**
   * Get Gold Rates (API-ready observable / sync getter)
   */
  getGoldRates(): Observable<GoldRates> {
    return of(this.goldRates());
  }

  /**
   * Get Silver Rate in Per Kg
   */
  getSilverRate(): Observable<number> {
    return of(this.silverRatePerKg());
  }

  /**
   * Update manual Gold Rates
   */
  updateGoldRates(rates: GoldRates, isLiveSource = false): void {
    const rounded: GoldRates = {
      '24K': Math.round(rates['24K'] * 100) / 100,
      '22K': Math.round(rates['22K'] * 100) / 100,
      '18K': Math.round(rates['18K'] * 100) / 100
    };
    this.goldRates.set(rounded);
    this.storage.setItem('gold_rates', rounded);
    this.recordUpdateTime(isLiveSource);
  }

  /**
   * Auto-derive 22K and 18K from 24K base rate
   */
  deriveAndSetGoldFrom24k(rate24kPerGram: number): void {
    const rates: GoldRates = {
      '24K': rate24kPerGram,
      '22K': (rate24kPerGram * 22) / 24, // 91.6667%
      '18K': (rate24kPerGram * 18) / 24 // 75%
    };
    this.updateGoldRates(rates);
  }

  /**
   * Update Silver Rate per Kg
   */
  updateSilverRate(ratePerKg: number, isLiveSource = false): void {
    const rounded = Math.round(ratePerKg * 100) / 100;
    this.silverRatePerKg.set(rounded);
    this.storage.setItem('silver_rate_kg', rounded);
    this.recordUpdateTime(isLiveSource);
  }

  /**
   * Toggle between Manual and Live Sim mode
   */
  setLiveMode(isLive: boolean): void {
    this.isLive.set(isLive);
    this.storage.setItem('is_live_mode', isLive);
    this.recordUpdateTime(isLive);
  }

  private recordUpdateTime(isLive: boolean): void {
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    this.lastUpdated.set(timeStr);
    this.storage.setItem('rate_last_updated', timeStr);
  }

  /**
   * Load 10-Year Gold History from JSON asset (API-ready)
   */
  getGoldHistory(): Observable<HistoricalRateItem[]> {
    return this.http.get<HistoricalRateItem[]>('assets/data/gold-history.json').pipe(
      catchError(() => {
        return of([
          { year: 2017, rate24kPer10g: 29660, rate22kPer10g: 27188, rate18kPer10g: 22245, rate24kPerGram: 2966, rate22kPerGram: 2718.8, rate18kPerGram: 2224.5, changePercent: 4.2 },
          { year: 2018, rate24kPer10g: 31438, rate22kPer10g: 28818, rate18kPer10g: 23578, rate24kPerGram: 3143.8, rate22kPerGram: 2881.8, rate18kPerGram: 2357.8, changePercent: 6.0 },
          { year: 2019, rate24kPer10g: 35220, rate22kPer10g: 32285, rate18kPer10g: 26415, rate24kPerGram: 3522, rate22kPerGram: 3228.5, rate18kPerGram: 2641.5, changePercent: 12.0 },
          { year: 2020, rate24kPer10g: 48651, rate22kPer10g: 44597, rate18kPer10g: 36488, rate24kPerGram: 4865.1, rate22kPerGram: 4459.7, rate18kPerGram: 3648.8, changePercent: 38.1 },
          { year: 2021, rate24kPer10g: 48720, rate22kPer10g: 44660, rate18kPer10g: 36540, rate24kPerGram: 4872, rate22kPerGram: 4466, rate18kPerGram: 3654, changePercent: 0.1 },
          { year: 2022, rate24kPer10g: 52670, rate22kPer10g: 48280, rate18kPer10g: 39502, rate24kPerGram: 5267, rate22kPerGram: 4828, rate18kPerGram: 3950.2, changePercent: 8.1 },
          { year: 2023, rate24kPer10g: 65330, rate22kPer10g: 59885, rate18kPer10g: 48997, rate24kPerGram: 6533, rate22kPerGram: 5988.5, rate18kPerGram: 4899.7, changePercent: 24.0 },
          { year: 2024, rate24kPer10g: 78500, rate22kPer10g: 71960, rate18kPer10g: 58875, rate24kPerGram: 7850, rate22kPerGram: 7196, rate18kPerGram: 5887.5, changePercent: 20.2 },
          { year: 2025, rate24kPer10g: 112000, rate22kPer10g: 102660, rate18kPer10g: 84000, rate24kPerGram: 11200, rate22kPerGram: 10266, rate18kPerGram: 8400, changePercent: 42.7 },
          { year: 2026, rate24kPer10g: 148000, rate22kPer10g: 135666.67, rate18kPer10g: 111000, rate24kPerGram: 14800, rate22kPerGram: 13566.67, rate18kPerGram: 11100, changePercent: 32.1 }
        ]);
      })
    );
  }

  /**
   * Load 10-Year Silver History from JSON asset (API-ready)
   */
  getSilverHistory(): Observable<HistoricalRateItem[]> {
    return this.http.get<HistoricalRateItem[]>('assets/data/silver-history.json').pipe(
      catchError(() => {
        return of([
          { year: 2017, ratePerKg: 37825, ratePerGram: 37.82, ratePer10g: 378.25, ratePer100g: 3782.5, changePercent: 2.1 },
          { year: 2018, ratePerKg: 38500, ratePerGram: 38.50, ratePer10g: 385.00, ratePer100g: 3850.0, changePercent: 1.8 },
          { year: 2019, ratePerKg: 40400, ratePerGram: 40.40, ratePer10g: 404.00, ratePer100g: 4040.0, changePercent: 4.9 },
          { year: 2020, ratePerKg: 63435, ratePerGram: 63.44, ratePer10g: 634.35, ratePer100g: 6343.5, changePercent: 57.0 },
          { year: 2021, ratePerKg: 62500, ratePerGram: 62.50, ratePer10g: 625.00, ratePer100g: 6250.0, changePercent: -1.5 },
          { year: 2022, ratePerKg: 69400, ratePerGram: 69.40, ratePer10g: 694.00, ratePer100g: 6940.0, changePercent: 11.0 },
          { year: 2023, ratePerKg: 78600, ratePerGram: 78.60, ratePer10g: 786.00, ratePer100g: 7860.0, changePercent: 13.3 },
          { year: 2024, ratePerKg: 96000, ratePerGram: 96.00, ratePer10g: 960.00, ratePer100g: 9600.0, changePercent: 22.1 },
          { year: 2025, ratePerKg: 145000, ratePerGram: 145.00, ratePer10g: 1450.00, ratePer100g: 14500.0, changePercent: 51.0 },
          { year: 2026, ratePerKg: 230000, ratePerGram: 230.00, ratePer10g: 2300.00, ratePer100g: 23000.0, changePercent: 58.6 }
        ]);
      })
    );
  }

  /**
   * Rate Unit Conversion Utilities
   */
  convertGoldRateToGram(rateValue: number, unit: RateUnit): number {
    switch (unit) {
      case 'gram':
        return rateValue;
      case '10gram':
        return rateValue / 10;
      case '100gram':
        return rateValue / 100;
      case 'kg':
        return rateValue / 1000;
      default:
        return rateValue;
    }
  }

  convertSilverRateToKg(rateValue: number, unit: RateUnit): number {
    switch (unit) {
      case 'gram':
        return rateValue * 1000;
      case '10gram':
        return rateValue * 100;
      case '100gram':
        return rateValue * 10;
      case 'kg':
        return rateValue;
      default:
        return rateValue;
    }
  }
}
