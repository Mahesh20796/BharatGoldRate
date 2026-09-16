import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'weightFormat',
  standalone: true
})
export class WeightFormatPipe implements PipeTransform {
  transform(grams: number | null | undefined, forceKg = false): string {
    if (grams === null || grams === undefined || isNaN(grams)) {
      return '0.000 g';
    }

    if (forceKg || grams >= 1000) {
      const kg = grams / 1000;
      return `${kg.toLocaleString('en-IN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} kg`;
    }

    return `${grams.toLocaleString('en-IN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} g`;
  }
}
