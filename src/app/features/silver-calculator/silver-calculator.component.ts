import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MarketRateService } from '../../core/services/market-rate.service';
import { CalculatorService } from '../../core/services/calculator.service';
import { SettingsService } from '../../core/services/settings.service';
import {
  CalculationResult,
  SILVER_PRODUCT_OPTIONS,
  LabourChargeType
} from '../../core/models/calculator.model';
import { InrCurrencyPipe } from '../../shared/pipes/inr-currency.pipe';
import { InvoiceCardComponent } from '../../shared/components/invoice-card/invoice-card.component';

@Component({
  selector: 'app-silver-calculator',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InrCurrencyPipe,
    InvoiceCardComponent
  ],
  template: `
    <div class="silver-calculator-container">
      <div class="calc-card-wrapper">
        <!-- Calculator Form Card -->
        <div class="app-card silver-card calc-form-card">
          <div class="card-title-bar">
            <div class="title-wrap">
              <span class="material-symbols-outlined silver-icon">shopping_bag</span>
              <div>
                <h3>Silver Price & Making Charge Calculator</h3>
                <span class="subtitle">Anklets, Utensils, Coins & Bars Calculation</span>
              </div>
            </div>
            <button class="btn-reset" (click)="resetForm()" title="Reset Calculator">
              <span class="material-symbols-outlined">restart_alt</span>
              <span>Reset</span>
            </button>
          </div>

          <form [formGroup]="calcForm" (ngSubmit)="calculate()" class="calculator-form">
            <!-- Step 1: Silver Product Type -->
            <div class="form-step">
              <div class="step-num silver-step">1</div>
              <div class="step-body">
                <label class="step-label">Select Silver Product Item</label>
                <div class="form-group">
                  <select class="form-control select-control" formControlName="productType">
                    @for (item of silverProducts; track item) {
                      <option [value]="item">{{ item }}</option>
                    }
                  </select>
                </div>
              </div>
            </div>

            <!-- Step 2: Weight (Grams) -->
            <div class="form-step">
              <div class="step-num silver-step">2</div>
              <div class="step-body">
                <div class="form-group">
                  <label>
                    <span>Net Weight (Grams)</span>
                    <span class="hint">16.700g, 50g, 100g, 1000g (1 Kg)</span>
                  </label>
                  <div class="input-with-suffix">
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      class="form-control weight-input"
                      formControlName="weightGrams"
                      placeholder="e.g. 16.700, 50.000, 250.000"
                    />
                    <span class="suffix">Grams</span>
                  </div>
                  @if (calcForm.get('weightGrams')?.invalid && (calcForm.get('weightGrams')?.touched || submitted())) {
                    <span class="error-text">Please enter a valid weight greater than 0 grams.</span>
                  }
                </div>

                <!-- Quick Weight Preset Chips -->
                <div class="quick-weight-chips">
                  @for (w of quickSilverWeights; track w.label) {
                    <button type="button" class="weight-chip" (click)="setWeight(w.value)">
                      {{ w.label }}
                    </button>
                  }
                </div>
              </div>
            </div>

            <!-- Step 3: Silver Rate (per gram) -->
            <div class="form-step">
              <div class="step-num silver-step">3</div>
              <div class="step-body">
                <div class="form-group">
                  <label>
                    <span>Silver Base Rate (per Gram)</span>
                    <span class="hint">1 Kg = {{ (calcForm.get('ratePerGram')?.value * 1000) | inrCurrency }}</span>
                  </label>
                  <div class="input-with-symbol">
                    <span class="symbol">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      class="form-control"
                      formControlName="ratePerGram"
                    />
                    <span class="suffix-text">/ gram</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 4: Labour / Making Charges -->
            <div class="form-step">
              <div class="step-num silver-step">4</div>
              <div class="step-body">
                <div class="labour-header">
                  <label class="step-label">Labour / Making Charge</label>
                  <div class="mini-pills">
                    <button
                      type="button"
                      class="mini-pill"
                      [class.active-silver]="calcForm.get('labourType')?.value === 'none'"
                      (click)="setLabourType('none')"
                    >
                      No Labour (₹0)
                    </button>
                    <button
                      type="button"
                      class="mini-pill"
                      [class.active-silver]="calcForm.get('labourType')?.value === 'perGram'"
                      (click)="setLabourType('perGram')"
                    >
                      Per Gram (₹/g)
                    </button>
                    <button
                      type="button"
                      class="mini-pill"
                      [class.active-silver]="calcForm.get('labourType')?.value === 'percentage'"
                      (click)="setLabourType('percentage')"
                    >
                      Percentage (%)
                    </button>
                  </div>
                </div>

                @if (calcForm.get('labourType')?.value !== 'none') {
                  <div class="form-group">
                    <label>
                      @if (calcForm.get('labourType')?.value === 'perGram') {
                        <span>Labour Charge Rate (₹ / Gram)</span>
                      } @else {
                        <span>Making Charge Percentage (%)</span>
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

            <!-- Step 5: GST % -->
            <div class="form-step">
              <div class="step-num silver-step">5</div>
              <div class="step-body">
                <div class="form-group">
                  <label>
                    <span>Applicable Silver GST (%)</span>
                    <span class="hint">Standard Indian GST is 3%</span>
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
              <button type="submit" class="btn-primary btn-silver btn-calculate">
                <span class="material-symbols-outlined">payments</span>
                <span>Calculate Total Silver Price</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Result Invoice Card (Right / Bottom) -->
        <div class="result-section">
          @if (currentResult(); as res) {
            <app-invoice-card [result]="res" [showSaveBtn]="true"></app-invoice-card>
          } @else {
            <div class="app-card placeholder-card silver-placeholder">
              <div class="placeholder-content">
                <div class="placeholder-icon silver-icon-wrap">
                  <span class="material-symbols-outlined">receipt_long</span>
                </div>
                <h4>Price Summary Preview</h4>
                <p>Select your silver item type, enter weight in grams and click <strong>Calculate</strong> to inspect the exact price and GST calculation.</p>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .silver-calculator-container {
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

        .silver-icon {
          color: var(--silver-300);
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
          color: var(--text-silver);
          border-color: rgba(148, 163, 184, 0.4);
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
        border: 1px solid rgba(148, 163, 184, 0.3);
        color: var(--silver-300);
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

        &.active-silver {
          background: var(--silver-gradient);
          color: #0F172A;
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
        color: var(--text-secondary);
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
          border-color: rgba(148, 163, 184, 0.4);
          color: var(--silver-200);
        }
      }
    }

    .form-actions {
      margin-top: 0.5rem;
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
          background: rgba(148, 163, 184, 0.1);
          border: 1px dashed rgba(148, 163, 184, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--silver-300);

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
export class SilverCalculatorComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  readonly marketService = inject(MarketRateService);
  readonly calculatorService = inject(CalculatorService);
  readonly settingsService = inject(SettingsService);

  readonly silverProducts = SILVER_PRODUCT_OPTIONS;

  readonly submitted = signal<boolean>(false);
  readonly currentResult = signal<CalculationResult | null>(null);

  readonly quickSilverWeights = [
    { label: '10.0g', value: 10.0 },
    { label: '16.700g (Payal)', value: 16.7 },
    { label: '25.0g', value: 25.0 },
    { label: '50.0g (Coin)', value: 50.0 },
    { label: '100.0g (10 Tolas)', value: 100.0 },
    { label: '250.0g (Bar)', value: 250.0 },
    { label: '500.0g (Thali)', value: 500.0 },
    { label: '1000.0g (1 Kg)', value: 1000.0 }
  ];

  calcForm!: FormGroup;

  ngOnInit(): void {
    const labourDefaults = this.settingsService.labourSettings();
    const gstDefaults = this.settingsService.gstSettings();
    const perGramRate = this.marketService.silverBreakdown().perGram;

    this.calcForm = this.fb.group({
      productType: ['Silver Anklet (Payal)', Validators.required],
      weightGrams: [16.700, [Validators.required, Validators.min(0.001)]],
      ratePerGram: [perGramRate, [Validators.required, Validators.min(0.01)]],
      labourType: ['none', Validators.required], // default no labour for example
      labourValue: [0, [Validators.required, Validators.min(0)]],
      gstPercentage: [gstDefaults.silverGst, [Validators.required, Validators.min(0), Validators.max(100)]]
    });

    this.route.queryParams.subscribe(params => {
      if (params['weight']) {
        const w = parseFloat(params['weight']);
        if (!isNaN(w) && w > 0) {
          this.setWeight(w);
        }
      }
    });

    // Run initial calculation
    this.calculate();
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
      ? labourDefaults.silverLabourPercent
      : (type === 'perGram' ? labourDefaults.silverLabourGram : 0);

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
    const result = this.calculatorService.calculateSilver({
      productType: formVal.productType,
      weightGrams: parseFloat(formVal.weightGrams),
      ratePerGram: parseFloat(formVal.ratePerGram),
      labourType: formVal.labourType,
      labourValue: parseFloat(formVal.labourValue || 0),
      gstPercentage: parseFloat(formVal.gstPercentage)
    });

    this.currentResult.set(result);
  }

  resetForm(): void {
    const gstDefaults = this.settingsService.gstSettings();
    const perGramRate = this.marketService.silverBreakdown().perGram;

    this.calcForm.reset({
      productType: 'Silver Anklet (Payal)',
      weightGrams: 16.700,
      ratePerGram: perGramRate,
      labourType: 'none',
      labourValue: 0,
      gstPercentage: gstDefaults.silverGst
    });
    this.calculate();
  }
}
