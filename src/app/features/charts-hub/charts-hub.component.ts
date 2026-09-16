import { Component, inject, signal, computed, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { MarketRateService } from '../../core/services/market-rate.service';
import { HistoricalRateItem, GoldPurity } from '../../core/models/rate.model';
import { InrCurrencyPipe } from '../../shared/pipes/inr-currency.pipe';

Chart.register(...registerables);

@Component({
  selector: 'app-charts-hub',
  standalone: true,
  imports: [CommonModule, RouterModule, InrCurrencyPipe],
  template: `
    <div class="page-container charts-page">
      <!-- Page Header -->
      <div class="page-header-row">
        <div>
          <h2 class="page-title">10-Year Historical Analysis (2017 – 2026)</h2>
          <p class="page-subtitle">Long-term precious metals growth trend and multi-year Indian market price performance</p>
        </div>
      </div>

      <!-- Metal Switcher Tabs -->
      <div class="tab-selector-bar">
        <button
          class="tab-pill gold-tab"
          [class.active]="activeMetal() === 'gold'"
          (click)="setMetal('gold')"
        >
          <span class="material-symbols-outlined">diamond</span>
          <span>Gold 10-Year Trend</span>
        </button>

        <button
          class="tab-pill silver-tab"
          [class.active]="activeMetal() === 'silver'"
          (click)="setMetal('silver')"
        >
          <span class="material-symbols-outlined">monetization_on</span>
          <span>Silver 10-Year Trend</span>
        </button>
      </div>

      <!-- Controls & Filter Bar -->
      <div class="app-card controls-card">
        <div class="controls-grid">
          @if (activeMetal() === 'gold') {
            <!-- Gold Purity Selector -->
            <div class="control-group">
              <label>Select Gold Purity</label>
              <div class="pill-selector">
                <button class="pill-btn" [class.active]="selectedGoldPurity() === '24K'" (click)="setGoldPurity('24K')">24K Pure</button>
                <button class="pill-btn" [class.active]="selectedGoldPurity() === '22K'" (click)="setGoldPurity('22K')">22K Standard</button>
                <button class="pill-btn" [class.active]="selectedGoldPurity() === '18K'" (click)="setGoldPurity('18K')">18K Hallmark</button>
              </div>
            </div>

            <!-- Gold Unit Selector -->
            <div class="control-group">
              <label>Price Metric</label>
              <div class="pill-selector">
                <button class="pill-btn" [class.active]="goldMetric() === '10g'" (click)="setGoldMetric('10g')">Per 10 Grams (1 Tola)</button>
                <button class="pill-btn" [class.active]="goldMetric() === '1g'" (click)="setGoldMetric('1g')">Per 1 Gram</button>
              </div>
            </div>
          } @else {
            <!-- Silver Metric Selector -->
            <div class="control-group full-width">
              <label>Select Silver Metric</label>
              <div class="pill-selector">
                <button class="pill-btn" [class.active-silver]="silverMetric() === 'kg'" (click)="setSilverMetric('kg')">Per 1 Kilogram (1000g)</button>
                <button class="pill-btn" [class.active-silver]="silverMetric() === '100g'" (click)="setSilverMetric('100g')">Per 100 Grams</button>
                <button class="pill-btn" [class.active-silver]="silverMetric() === '1g'" (click)="setSilverMetric('1g')">Per 1 Gram</button>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Interactive Line Chart Card -->
      <div class="app-card chart-container-card" [class.gold-card]="activeMetal() === 'gold'" [class.silver-card]="activeMetal() === 'silver'">
        <div class="chart-header">
          <div class="chart-title-wrap">
            <span class="material-symbols-outlined chart-icon">{{ activeMetal() === 'gold' ? 'show_chart' : 'analytics' }}</span>
            <div>
              <h3>{{ chartTitle() }}</h3>
              <span class="chart-subtitle">Historical Closing Prices (₹ INR) from 2017 to 2026</span>
            </div>
          </div>
          <div class="growth-pill">
            <span class="material-symbols-outlined">trending_up</span>
            <span>+{{ totalGrowthPercent() }}% 10-Yr Return</span>
          </div>
        </div>

        <div class="canvas-wrapper">
          <canvas #chartCanvas></canvas>
        </div>
      </div>

      <!-- 4 High-Impact Stat Metric Cards -->
      <div class="stats-cards-grid">
        <div class="app-card stat-metric-box">
          <span class="metric-label">2017 Base Price</span>
          <div class="metric-val">{{ startPrice() | inrCurrency }}</div>
          <span class="metric-sub">Starting benchmark in 2017</span>
        </div>

        <div class="app-card stat-metric-box">
          <span class="metric-label">10-Year Lowest</span>
          <div class="metric-val">{{ minPrice() | inrCurrency }}</div>
          <span class="metric-sub">Historic cycle bottom</span>
        </div>

        <div class="app-card stat-metric-box">
          <span class="metric-label">10-Year Highest</span>
          <div class="metric-val highlight-val">{{ maxPrice() | inrCurrency }}</div>
          <span class="metric-sub">Historic cycle high</span>
        </div>

        <div class="app-card stat-metric-box">
          <span class="metric-label">2026 Benchmark Price</span>
          <div class="metric-val primary-gold">{{ currentPrice() | inrCurrency }}</div>
          <span class="metric-sub">Total Growth: {{ (currentPrice() - startPrice()) | inrCurrency }}</span>
        </div>
      </div>

      <!-- Detailed Year-by-Year Historical Table -->
      <div class="app-card table-card">
        <div class="table-header">
          <div class="title-wrap">
            <span class="material-symbols-outlined">history_edu</span>
            <h3>Year-by-Year Historical Breakdown (2017 – 2026)</h3>
          </div>
        </div>

        <div class="table-responsive">
          <table class="history-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Price (INR)</th>
                <th>Annual Change</th>
                <th>Market Milestones & Events</th>
              </tr>
            </thead>
            <tbody>
              @for (row of tableRows(); track row.year) {
                <tr [class.latest-year]="row.year === 2026">
                  <td class="year-cell">
                    <span class="year-num">{{ row.year }}</span>
                    @if (row.year === 2026) {
                      <span class="current-tag">CURRENT</span>
                    }
                  </td>
                  <td class="price-cell">{{ row.price | inrCurrency }}</td>
                  <td class="change-cell" [class.positive]="row.changePercent >= 0" [class.negative]="row.changePercent < 0">
                    {{ row.changePercent >= 0 ? '+' : '' }}{{ row.changePercent }}%
                  </td>
                  <td class="notes-cell">{{ row.note || 'Standard market trade' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .charts-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header-row {
      .page-title {
        font-size: 1.4rem;
        font-weight: 800;
        color: var(--text-primary);
      }
      .page-subtitle {
        font-size: 0.85rem;
        color: var(--text-secondary);
        margin-top: 2px;
      }
    }

    .tab-selector-bar {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;

      .tab-pill {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.85rem;
        border-radius: var(--radius-lg);
        background: var(--bg-surface-elevated);
        border: 1px solid var(--border-subtle);
        color: var(--text-secondary);
        font-weight: 700;
        font-size: 0.95rem;
        cursor: pointer;
        transition: all 0.2s ease;

        span.material-symbols-outlined {
          font-size: 20px;
        }

        &.gold-tab.active {
          background: var(--card-gradient-gold);
          border-color: var(--border-highlight);
          color: var(--text-primary);
          box-shadow: var(--gold-glow);
          span.material-symbols-outlined { color: var(--gold-400); }
        }

        &.silver-tab.active {
          background: var(--card-gradient-silver);
          border-color: rgba(148, 163, 184, 0.4);
          color: var(--text-primary);
          box-shadow: var(--silver-glow);
          span.material-symbols-outlined { color: var(--silver-300); }
        }
      }
    }

    .controls-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;

      @media (min-width: 640px) {
        grid-template-columns: 1fr 1fr;
      }

      .control-group {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;

        &.full-width {
          grid-column: 1 / -1;
        }

        label {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
        }
      }
    }

    .chart-container-card {
      padding: 1.5rem;

      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-bottom: 1.5rem;

        .chart-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.75rem;

          .chart-icon {
            font-size: 26px;
            color: var(--text-gold);
          }

          h3 {
            font-size: 1.25rem;
            color: var(--text-primary);
          }

          .chart-subtitle {
            font-size: 0.75rem;
            color: var(--text-muted);
          }
        }

        .growth-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: var(--color-success-bg);
          color: var(--color-success);
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 6px 12px;
          border-radius: var(--radius-full);
          font-weight: 800;
          font-size: 0.85rem;

          span.material-symbols-outlined {
            font-size: 18px;
          }
        }
      }

      .canvas-wrapper {
        position: relative;
        width: 100%;
        height: 320px;

        @media (min-width: 768px) {
          height: 380px;
        }
      }
    }

    .stats-cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.85rem;

      @media (min-width: 768px) {
        grid-template-columns: repeat(4, 1fr);
      }

      .stat-metric-box {
        padding: 1rem;
        display: flex;
        flex-direction: column;

        .metric-label {
          font-size: 0.72rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 700;
        }

        .metric-val {
          font-size: 1.35rem;
          font-weight: 800;
          font-family: var(--font-heading);
          color: var(--text-primary);
          margin: 0.35rem 0 0.2rem;

          &.primary-gold {
            color: var(--text-gold);
          }
        }

        .metric-sub {
          font-size: 0.72rem;
          color: var(--text-secondary);
        }
      }
    }

    /* Table Styles */
    .table-card {
      padding: 1.25rem;

      .table-header {
        margin-bottom: 1rem;
        .title-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-gold);

          h3 {
            font-size: 1.1rem;
            color: var(--text-primary);
          }
        }
      }
    }

    .table-responsive {
      overflow-x: auto;
    }

    .history-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;

      th {
        padding: 0.75rem 0.85rem;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        border-bottom: 1px solid var(--border-subtle);
        background: rgba(255, 255, 255, 0.02);
      }

      td {
        padding: 0.85rem;
        border-bottom: 1px solid var(--border-subtle);
        font-size: 0.88rem;
      }

      .year-cell {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .year-num {
          font-weight: 800;
          color: var(--text-primary);
          font-family: var(--font-heading);
        }

        .current-tag {
          font-size: 0.6rem;
          font-weight: 800;
          background: var(--gold-gradient);
          color: #1A1200;
          padding: 2px 6px;
          border-radius: var(--radius-sm);
        }
      }

      .price-cell {
        font-family: var(--font-heading);
        font-weight: 700;
        color: var(--text-primary);
      }

      .change-cell {
        font-weight: 700;

        &.positive {
          color: var(--color-success);
        }
        &.negative {
          color: var(--color-danger);
        }
      }

      .notes-cell {
        color: var(--text-secondary);
        font-size: 0.82rem;
      }

      tr.latest-year {
        background: rgba(212, 175, 55, 0.08);
      }
    }
  `]
})
export class ChartsHubComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private readonly marketService = inject(MarketRateService);

  readonly activeMetal = signal<'gold' | 'silver'>('gold');
  readonly selectedGoldPurity = signal<GoldPurity>('24K');
  readonly goldMetric = signal<'10g' | '1g'>('10g');
  readonly silverMetric = signal<'kg' | '100g' | '1g'>('kg');

  readonly goldHistoryData = signal<HistoricalRateItem[]>([]);
  readonly silverHistoryData = signal<HistoricalRateItem[]>([]);

  private chartInstance: Chart | null = null;

  ngOnInit(): void {
    this.marketService.getGoldHistory().subscribe(data => {
      this.goldHistoryData.set(data);
      this.updateChart();
    });

    this.marketService.getSilverHistory().subscribe(data => {
      this.silverHistoryData.set(data);
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.renderChart();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }

  setMetal(metal: 'gold' | 'silver'): void {
    this.activeMetal.set(metal);
    this.updateChart();
  }

  setGoldPurity(purity: GoldPurity): void {
    this.selectedGoldPurity.set(purity);
    this.updateChart();
  }

  setGoldMetric(metric: '10g' | '1g'): void {
    this.goldMetric.set(metric);
    this.updateChart();
  }

  setSilverMetric(metric: 'kg' | '100g' | '1g'): void {
    this.silverMetric.set(metric);
    this.updateChart();
  }

  readonly chartTitle = computed<string>(() => {
    if (this.activeMetal() === 'gold') {
      const metricText = this.goldMetric() === '10g' ? 'Per 10 Grams (1 Tola)' : 'Per 1 Gram';
      return `Gold ${this.selectedGoldPurity()} Price Trend (${metricText})`;
    } else {
      const metricMap = { kg: 'Per 1 Kilogram', '100g': 'Per 100 Grams', '1g': 'Per 1 Gram' };
      return `Fine Silver 999 Price Trend (${metricMap[this.silverMetric()]})`;
    }
  });

  readonly tableRows = computed<{ year: number; price: number; changePercent: number; note?: string }[]>(() => {
    if (this.activeMetal() === 'gold') {
      const data = this.goldHistoryData();
      const purity = this.selectedGoldPurity();
      const is10g = this.goldMetric() === '10g';

      return data.map(item => {
        let price = 0;
        if (purity === '24K') price = is10g ? (item.rate24kPer10g || 0) : (item.rate24kPerGram || 0);
        else if (purity === '22K') price = is10g ? (item.rate22kPer10g || 0) : (item.rate22kPerGram || 0);
        else price = is10g ? (item.rate18kPer10g || 0) : (item.rate18kPerGram || 0);

        return {
          year: item.year,
          price,
          changePercent: item.changePercent,
          note: item.note
        };
      });
    } else {
      const data = this.silverHistoryData();
      const metric = this.silverMetric();

      return data.map(item => {
        let price = item.ratePerKg || 0;
        if (metric === '100g') price = item.ratePer100g || (item.ratePerKg || 0) / 10;
        else if (metric === '1g') price = item.ratePerGram || (item.ratePerKg || 0) / 1000;

        return {
          year: item.year,
          price,
          changePercent: item.changePercent,
          note: item.note
        };
      });
    }
  });

  readonly startPrice = computed<number>(() => {
    const rows = this.tableRows();
    return rows.length > 0 ? rows[0].price : 0;
  });

  readonly currentPrice = computed<number>(() => {
    const rows = this.tableRows();
    return rows.length > 0 ? rows[rows.length - 1].price : 0;
  });

  readonly minPrice = computed<number>(() => {
    const rows = this.tableRows();
    if (rows.length === 0) return 0;
    return Math.min(...rows.map(r => r.price));
  });

  readonly maxPrice = computed<number>(() => {
    const rows = this.tableRows();
    if (rows.length === 0) return 0;
    return Math.max(...rows.map(r => r.price));
  });

  readonly totalGrowthPercent = computed<number>(() => {
    const s = this.startPrice();
    const c = this.currentPrice();
    if (s <= 0) return 0;
    return Math.round(((c - s) / s) * 1000) / 10;
  });

  private renderChart(): void {
    if (!this.chartCanvas) return;
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const rows = this.tableRows();
    const labels = rows.map(r => r.year.toString());
    const dataPoints = rows.map(r => r.price);

    const isGold = this.activeMetal() === 'gold';
    const primaryColor = isGold ? '#F3C343' : '#CBD5E1';
    const gradientFill = ctx.createLinearGradient(0, 0, 0, 320);

    if (isGold) {
      gradientFill.addColorStop(0, 'rgba(243, 195, 67, 0.45)');
      gradientFill.addColorStop(1, 'rgba(243, 195, 67, 0.0)');
    } else {
      gradientFill.addColorStop(0, 'rgba(203, 213, 225, 0.45)');
      gradientFill.addColorStop(1, 'rgba(203, 213, 225, 0.0)');
    }

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: this.chartTitle(),
            data: dataPoints,
            borderColor: primaryColor,
            borderWidth: 3,
            backgroundColor: gradientFill,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: primaryColor,
            pointBorderColor: '#0A0D14',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#182030',
            titleColor: '#F8FAFC',
            bodyColor: '#F3C343',
            borderColor: 'rgba(212, 175, 55, 0.3)',
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: (context) => {
                const val = context.raw as number;
                return `Price: ₹${val.toLocaleString('en-IN')}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.06)'
            },
            ticks: {
              color: '#94A3B8',
              font: {
                weight: 'bold'
              }
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.06)'
            },
            ticks: {
              color: '#94A3B8',
              callback: (value) => `₹${Number(value).toLocaleString('en-IN')}`
            }
          }
        }
      }
    });
  }

  private updateChart(): void {
    setTimeout(() => {
      this.renderChart();
    }, 50);
  }
}
