import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'inrCurrency',
  standalone: true
})
export class InrCurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined, showDecimals = true, symbol = '₹'): string {
    if (value === null || value === undefined || isNaN(value)) {
      return `${symbol}0.00`;
    }

    try {
      const minDec = showDecimals ? (value % 1 === 0 ? 0 : 2) : 0;
      const maxDec = showDecimals ? 2 : 0;

      const formatted = new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: minDec,
        maximumFractionDigits: maxDec
      }).format(value);

      return `${symbol}${formatted}`;
    } catch {
      return `${symbol}${value.toFixed(2)}`;
    }
  }
}
