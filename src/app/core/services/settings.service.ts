import { Injectable, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { GstSettings, LabourSettings, AppSettings } from '../models/settings.model';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly storage = inject(StorageService);

  private readonly DEFAULT_GST: GstSettings = {
    goldGst: 3.0,
    silverGst: 3.0,
    jewelleryGst: 3.0,
    goldBarGst: 3.0,
    silverJewelleryGst: 3.0,
    silverBarGst: 3.0,
    otherGst: 3.0
  };

  private readonly DEFAULT_LABOUR: LabourSettings = {
    goldLabourType: 'percentage',
    goldLabourGram: 350,
    goldLabourPercent: 10,
    silverLabourType: 'perGram',
    silverLabourGram: 50,
    silverLabourPercent: 8
  };

  private readonly DEFAULT_APP_SETTINGS: AppSettings = {
    theme: 'dark',
    defaultGoldPurity: '22K',
    defaultRateUnit: '10gram',
    soundEffects: true,
    haptics: true
  };

  readonly gstSettings = signal<GstSettings>(
    this.storage.getItem<GstSettings>('gst_settings', this.DEFAULT_GST)
  );

  readonly labourSettings = signal<LabourSettings>(
    this.storage.getItem<LabourSettings>('labour_settings', this.DEFAULT_LABOUR)
  );

  readonly appSettings = signal<AppSettings>(
    this.storage.getItem<AppSettings>('app_settings', this.DEFAULT_APP_SETTINGS)
  );

  updateGstSettings(settings: Partial<GstSettings>): void {
    const updated = { ...this.gstSettings(), ...settings };
    this.gstSettings.set(updated);
    this.storage.setItem('gst_settings', updated);
  }

  updateLabourSettings(settings: Partial<LabourSettings>): void {
    const updated = { ...this.labourSettings(), ...settings };
    this.labourSettings.set(updated);
    this.storage.setItem('labour_settings', updated);
  }

  updateAppSettings(settings: Partial<AppSettings>): void {
    const updated = { ...this.appSettings(), ...settings };
    this.appSettings.set(updated);
    this.storage.setItem('app_settings', updated);
  }

  resetAllSettings(): void {
    this.gstSettings.set(this.DEFAULT_GST);
    this.labourSettings.set(this.DEFAULT_LABOUR);
    this.appSettings.set(this.DEFAULT_APP_SETTINGS);
    this.storage.setItem('gst_settings', this.DEFAULT_GST);
    this.storage.setItem('labour_settings', this.DEFAULT_LABOUR);
    this.storage.setItem('app_settings', this.DEFAULT_APP_SETTINGS);
  }
}
