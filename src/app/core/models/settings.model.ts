import { LabourChargeType } from './calculator.model';
import { GoldPurity, RateUnit } from './rate.model';

export interface GstSettings {
  goldGst: number;
  silverGst: number;
  jewelleryGst: number;
  goldBarGst: number;
  silverJewelleryGst: number;
  silverBarGst: number;
  otherGst: number;
}

export interface LabourSettings {
  goldLabourType: LabourChargeType;
  goldLabourGram: number;
  goldLabourPercent: number;
  silverLabourType: LabourChargeType;
  silverLabourGram: number;
  silverLabourPercent: number;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  defaultGoldPurity: GoldPurity;
  defaultRateUnit: RateUnit;
  soundEffects: boolean;
  haptics: boolean;
}
