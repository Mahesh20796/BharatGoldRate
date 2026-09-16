import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MarketRateService } from '../../core/services/market-rate.service';
import { CalculatorService } from '../../core/services/calculator.service';
import { SettingsService } from '../../core/services/settings.service';
import { GoldPurity } from '../../core/models/rate.model';
import {
  CalculationResult,
  GOLD_JEWELLERY_OPTIONS,
  GOLD_BULLION_OPTIONS,
  LabourChargeType
} from '../../core/models/calculator.model';
import { InrCurrencyPipe } from '../../shared/pipes/inr-currency.pipe';
import { InvoiceCardComponent } from '../../shared/components/invoice-card/invoice-card.component';

@Component({
  selector: 'app-gold-calculator',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InrCurrencyPipe,
    InvoiceCardComponent
  ],
  template: `
    <div class="gold-calculator-container">
      <div class="calc-card-wrapper">
        <!-- Calculator Form Card -->
        <div class="app-card gold-card calc-form-card">
          <div class="card-title-bar">
            <div class="title-wrap">
              <span class="material-symbols-outlined gold-icon">calculate</span>
              <div>
                <h3>Gold Price & GST Calculator</h3>
                <span class="subtitle">Step-by-step Indian Jewellery & Bullion Estimator</span>
              </div>
            </div>
            <button class="btn-reset" (click)="resetForm()" title="Reset Calculator">
              <span class="material-symbols-outlined">restart_alt</span>
              <span>Reset</span>
            </button>
          </div>

          <form [formGroup]="calcForm" (ngSubmit)="calculate()" class="calculator-form">
            <!-- Step 1: Gold Purity -->
            <div class="form-step">
              <div class="step-num">1</div>
              <div class="step-body">
                <label class="step-label">Select Gold Purity</label>
                <div class="pill-selector">
                  <button
                    type="button"
                    class="pill-btn"
                    [class.active]="calcForm.get('purity')?.value === '24K'"
                    (click)="setPurity('24K')"
                  >
                    24K (99.9% Pure)
                  </button>
                  <button
                    type="button"
                    class="pill-btn"
                    [class.active]="calcForm.get('purity')?.value === '22K'"
                    (click)="setPurity('22K')"
                  >
                    22K (91.6% Hallmark)
                  </button>
                  <button
                    type="button"
                    class="pill-btn"
                    [class.active]="calcForm.get('purity')?.value === '18K'"
                    (click)="setPurity('18K')"
                  >
                    18K (75.0% Gold)
                  </button>
                </div>
              </div>
            </div>

            <!-- Step 2: Product Category & Type -->
            <div class="form-step">
              <div class="step-num">2</div>
              <div class="step-body">
                <div class="category-toggle-row">
                  <label class="step-label">Select Product Type</label>
                  <div class="mini-pills">
                    <button
                      type="button"
                      class="mini-pill"
                      [class.active]="productCategory() === 'jewellery'"
                      (click)="setCategory('jewellery')"
                    >
                      Jewellery
                    </button>
                    <button
                      type="button"
                      class="mini-pill"
                      [class.active]="productCategory() === 'bullion'"
                      (click)="setCategory('bullion')"
                    >
                      Bar / Coin / Ladi
                    </button>
                  </div>
                </div>

                <div class="form-group">
                  <select class="form-control select-control" formControlName="productType">
                    @if (productCategory() === 'jewellery') {
                      @for (item of jewelleryOptions; track item) {
                        <option [value]="item">{{ item }}</option>
                      }
                    } @else {
                      @for (item of bullionOptions; track item) {
                        <option [value]="item">{{ item }}</option>
                      }
                    }
                  </select>
                </div>
              </div>
            </div>

            <!-- Step 3: Weight (in Grams) -->
            <div class="form-step">
              <div class="step-num">3</div>
              <div class="step-body">
                <div class="form-group">
                  <label>
                    <span>Net Gold Weight (Grams)</span>
                    <span class="hint">Allows decimals (e.g. 0.500)</span>
                  </label>
                  <div class="input-with-suffix">
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      class="form-control weight-input"
                      formControlName="weightGrams"
                      placeholder="e.g. 0.500, 8.000, 16.700"
                    />
                    <span class="suffix">Grams</span>
                  </div>
                  @if (calcForm.get('weightGrams')?.invalid && (calcForm.get('weightGrams')?.touched || submitted())) {
                    <span class="error-text">Please enter a valid weight greater than 0 grams.</span>
                  }
                </div>

                <!-- Quick Weight Preset Chips -->
                <div class="quick-weight-chips">
                  @for (w of quickWeights; track w.label) {
                    <button type="button" class="weight-chip" (click)="setWeight(w.value)">
                      {{ w.label }}
                    </button>
                  }
                </div>
              </div>
            </div>

            <!-- Step 4: Gold Rate (per gram) -->
            <div class="form-step">
              <div class="step-num">4</div>
              <div class="step-body">
                <div class="form-group">
                  <label>
                    <span>{{ calcForm.get('purity')?.value }} Gold Rate (per Gram)</span>
                    <span class="hint">10g = {{ (calcForm.get('ratePerGram')?.value * 10) | inrCurrency }}</span>
                  </label>
                  <div class="input-with-symbol">
                    <span class="symbol">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      class="form-control"
                      formControlName="ratePerGram"
                    />
                    <span class="suffix-text">/ gram</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 5: Labour / Making Charges -->
            <div class="form-step">
              <div class="step-num">5</div>
              <div class="step-body">
                <div class="labour-header">
                  <label class="step-label">Labour / Making Charges</label>
                  <div class="mini-pills">
                    <button
                      type="button"
                      class="mini-pill"
                      [class.active]="calcForm.get('labourType')?.value === 'percentage'"
                      (click)="setLabourType('percentage')"
                    >
                      Percentage (%)
                    </button>
                    <button
                      type="button"
                      class="mini-pill"
                      [class.active]="calcForm.get('labourType')?.value === 'perGram'"
                      (click)="setLabourType('perGram')"
                    >
                      Per Gram (₹/g)
                    </button>
                    <button
                      type="button"
                      class="mini-pill"
                      [class.active]="calcForm.get('labourType')?.value === 'none'"
                      (click)="setLabourType('none')"
                    >
                      No Labour
                    </button>
                  </div>
                </div>

                @if (calcForm.get('labourType')?.value !== 'none') {
                  <div class="form-group">
                    <label>
                      @if (calcForm.get('labourType')?.value === 'percentage') {
                        <span>Making Charge Percentage (%)</span>
                      } @else {
                        <span>Making Charge Rate (₹ / Gram)</span>
                      }
                    </label>
                    <div class="input-with-symbol">
                      <span class="symbol">{{ calcForm.get('labourType')?.value === 'percentage' ? '%' : '₹' }}</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        class="form-control"
                        formControlName="labourValue"
                      />
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Step 6: GST % -->
            <div class="form-step">
              <div class="step-num">6</div>
              <div class="step-body">
                <div class="form-group">
                  <label>
                    <span>Applicable GST (%)</span>
                    <span class="hint">Standard Indian Gold GST is 3%</span>
                  </label>
                  <div class="input-with-symbol">
                    <span class="symbol">%</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      class="form-control"
                      formControlName="gstPercentage"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="form-actions">
              <button type="submit" class="btn-primary btn-calculate">
                <span class="material-symbols-outlined">payments</span>
                <span>Calculate Total Gold Price</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Result Invoice Card (Right / Bottom) -->
        <div class="result-section">
          @if (currentResult(); as res) {
            <app-invoice-card [result]="res" [showSaveBtn]="true"></app-invoice-card>
          } @else {
            <div class="app-card placeholder-card">
              <div class="placeholder-content">
                <div class="placeholder-icon">
                  <span class="material-symbols-outlined">receipt_long</span>
                </div>
                <h4>Price Summary Preview</h4>
                <p>Enter the gold purity, product, weight, and making charge above then click <strong>Calculate</strong> to view the detailed invoice breakdown.</p>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .gold-calculator-container {
      width: 100%;
    }

    .calc-card-wrapper {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;

      @media (min-width: 900px) {
        grid-template-columns: 1.2fr 1fr;
        align-items: start;
      }
    }

    .calc-form-card {
      padding: 1.5rem;
    }

    .card-title-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-subtle);

      .title-wrap {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        .gold-icon {
          color: var(--gold-400);
          font-size: 28px;
        }

        h3 {
          font-size: 1.2rem;
          color: var(--text-primary);
        }

        .subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      }

      .btn-reset {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: transparent;
        border: 1px solid var(--border-subtle);
        color: var(--text-secondary);
        padding: 6px 10px;
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;

        span.material-symbols-outlined {
          font-size: 16px;
        }

        &:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-gold);
          border-color: var(--border-highlight);
        }
      }
    }

    .calculator-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-step {
      display: flex;
      gap: 0.85rem;
      align-items: flex-start;

      .step-num {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--bg-surface-elevated);
        border: 1px solid var(--border-highlight);
        color: var(--text-gold);
        font-weight: 800;
        font-size: 0.8rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .step-body {
        flex: 1;

        .step-label {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-secondary);
          margin-bottom: 0.4rem;
          display: block;
        }
      }
    }

    .category-toggle-row,
    .labour-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .mini-pills {
      display: flex;
      gap: 4px;
      background: var(--input-bg);
      padding: 3px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-subtle);

      .mini-pill {
        background: transparent;
        border: none;
        color: var(--text-muted);
        font-size: 0.72rem;
        font-weight: 600;
        padding: 4px 8px;
        border-radius: calc(var(--radius-sm) - 2px);
        cursor: pointer;
        transition: all 0.2s ease;

        &.active {
          background: var(--gold-500);
          color: #1A1200;
          font-weight: 700;
        }
      }
    }

    .select-control {
      appearance: none;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 1rem center;
      background-size: 1.2em;
      cursor: pointer;
    }

    .input-with-suffix,
    .input-with-symbol {
      position: relative;
      display: flex;
      align-items: center;

      .symbol {
        position: absolute;
        left: 1rem;
        font-weight: 700;
        color: var(--text-gold);
        font-size: 1rem;
      }

      .suffix,
      .suffix-text {
        position: absolute;
        right: 1rem;
        font-size: 0.78rem;
        color: var(--text-muted);
        font-weight: 600;
        pointer-events: none;
      }

      input {
        padding-left: 2rem;
        padding-right: 3.5rem;
        font-weight: 700;
        color: var(--text-primary);
        font-family: var(--font-heading);
      }

      &.input-with-suffix input {
        padding-left: 1rem;
        padding-right: 4.5rem;
      }
    }

    .weight-input {
      font-size: 1.15rem;
      color: var(--text-primary);
      font-weight: 700;
    }

    .quick-weight-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-top: 0.5rem;

      .weight-chip {
        background: var(--input-bg);
        border: 1px solid var(--border-subtle);
        color: var(--text-secondary);
        font-size: 0.72rem;
        font-weight: 600;
        padding: 4px 8px;
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: var(--bg-surface-elevated);
          border-color: var(--border-highlight);
          color: var(--text-gold);
        }
      }
    }

    .form-actions {
      margin-top: 0.5rem;

      .btn-calculate {
        span.material-symbols-outlined {
          font-size: 22px;
        }
      }
    }

    /* Placeholder Card */
    .placeholder-card {
      min-height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2rem;

      .placeholder-content {
        max-width: 320px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;

        .placeholder-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(212, 175, 55, 0.1);
          border: 1px dashed var(--border-highlight);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-gold);

          span {
            font-size: 32px;
          }
        }

        h4 {
          font-size: 1.1rem;
          color: var(--text-primary);
        }

        p {
          font-size: 0.82rem;
          color: var(--text-muted);
          line-height: 1.45;
        }
      }
    }
  `]
})
export class GoldCalculatorComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  readonly marketService = inject(MarketRateService);
  readonly calculatorService = inject(CalculatorService);
  readonly settingsService = inject(SettingsService);

  readonly jewelleryOptions = GOLD_JEWELLERY_OPTIONS;
  readonly bullionOptions = GOLD_BULLION_OPTIONS;

  readonly productCategory = signal<'jewellery' | 'bullion'>('jewellery');
  readonly submitted = signal<boolean>(false);
  readonly currentResult = signal<CalculationResult | null>(null);

  readonly quickWeights = [
    { label: '0.500g', value: 0.5 },
    { label: '1.000g', value: 1.0 },
    { label: '4.000g (1/2 Pavan)', value: 4.0 },
    { label: '8.000g (1 Pavan)', value: 8.0 },
    { label: '10.0g (1 Tola)', value: 10.0 },
    { label: '16.700g', value: 16.7 },
    { label: '50.0g', value: 50.0 },
    { label: '100.0g', value: 100.0 }
  ];

  calcForm!: FormGroup;

  ngOnInit(): void {
    const labourDefaults = this.settingsService.labourSettings();
    const gstDefaults = this.settingsService.gstSettings();
    const currentRates = this.marketService.goldRates();

    this.calcForm = this.fb.group({
      purity: ['22K', Validators.required],
      productType: ['Chain', Validators.required],
      weightGrams: [0.500, [Validators.required, Validators.min(0.001)]],
      ratePerGram: [currentRates['22K'], [Validators.required, Validators.min(1)]],
      labourType: [labourDefaults.goldLabourType, Validators.required],
      labourValue: [labourDefaults.goldLabourPercent, [Validators.required, Validators.min(0)]],
      gstPercentage: [gstDefaults.goldGst, [Validators.required, Validators.min(0), Validators.max(100)]]
    });

    // Check Query Params if navigated from card
    this.route.queryParams.subscribe(params => {
      if (params['purity'] && ['24K', '22K', '18K'].includes(params['purity'])) {
        this.setPurity(params['purity'] as GoldPurity);
      }
      if (params['weight']) {
        const w = parseFloat(params['weight']);
        if (!isNaN(w) && w > 0) {
          this.setWeight(w);
        }
      }
    });

    // Perform initial calculation for instant interactive preview
    this.calculate();
  }

  setPurity(purity: GoldPurity): void {
    this.calcForm.patchValue({
      purity,
      ratePerGram: this.marketService.goldRates()[purity]
    });
    if (this.calcForm.valid) {
      this.calculate();
    }
  }

  setCategory(cat: 'jewellery' | 'bullion'): void {
    this.productCategory.set(cat);
    const defaultProduct = cat === 'jewellery' ? 'Chain' : 'Gold Bar';
    this.calcForm.patchValue({ productType: defaultProduct });
    if (this.calcForm.valid) {
      this.calculate();
    }
  }

  setWeight(weight: number): void {
    this.calcForm.patchValue({ weightGrams: weight });
    if (this.calcForm.valid) {
      this.calculate();
    }
  }

  setLabourType(type: LabourChargeType): void {
    const labourDefaults = this.settingsService.labourSettings();
    const defaultVal = type === 'percentage'
      ? labourDefaults.goldLabourPercent
      : (type === 'perGram' ? labourDefaults.goldLabourGram : 0);

    this.calcForm.patchValue({
      labourType: type,
      labourValue: defaultVal
    });
    if (this.calcForm.valid) {
      this.calculate();
    }
  }

  calculate(): void {
    this.submitted.set(true);
    if (this.calcForm.invalid) {
      return;
    }

    const formVal = this.calcForm.value;
    const result = this.calculatorService.calculateGold({
      purity: formVal.purity,
      isJewellery: this.productCategory() === 'jewellery',
      productType: `Gold ${formVal.productType}`,
      weightGrams: parseFloat(formVal.weightGrams),
      ratePerGram: parseFloat(formVal.ratePerGram),
      labourType: formVal.labourType,
      labourValue: parseFloat(formVal.labourValue || 0),
      gstPercentage: parseFloat(formVal.gstPercentage)
    });

    this.currentResult.set(result);
  }

  resetForm(): void {
    const labourDefaults = this.settingsService.labourSettings();
    const gstDefaults = this.settingsService.gstSettings();
    const currentRates = this.marketService.goldRates();

    this.calcForm.reset({
      purity: '22K',
      productType: 'Chain',
      weightGrams: 0.500,
      ratePerGram: currentRates['22K'],
      labourType: labourDefaults.goldLabourType,
      labourValue: labourDefaults.goldLabourPercent,
      gstPercentage: gstDefaults.goldGst
    });
    this.productCategory.set('jewellery');
    this.calculate();
  }
}
