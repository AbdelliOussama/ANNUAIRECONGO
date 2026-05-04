import { Pipe, PipeTransform, inject, LOCALE_ID } from '@angular/core';
import { formatCurrency, formatNumber } from '@angular/common';

/**
 * Format a numeric amount as XAF (Central African CFA franc).
 *
 * Usage in templates:
 *   {{ 25000 | xaf }}            → 25 000 XAF
 *   {{ 25000 | xaf:'symbol' }}   → 25 000 FCFA
 *   {{ 0     | xaf:'code':'—' }} → —      (custom empty placeholder)
 *
 * Note: per project decision the user-facing display uses XAF (ISO code).
 * `symbol` mode is provided for screens (e.g. payment receipts) where
 * "FCFA" is expected.
 */
@Pipe({
  name: 'xaf',
  standalone: true,
})
export class XafPipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);

  transform(
    value: number | string | null | undefined,
    display: 'code' | 'symbol' = 'code',
    emptyPlaceholder = '—'
  ): string {
    if (value === null || value === undefined || value === '') {
      return emptyPlaceholder;
    }

    const num = typeof value === 'string' ? Number(value) : value;
    if (Number.isNaN(num)) {
      return emptyPlaceholder;
    }

    if (display === 'symbol') {
      const formatted = formatNumber(num, this.locale, '1.0-0');
      return `${formatted} FCFA`;
    }

    // Use Angular's formatCurrency — passes the ISO code as the symbol
    // so the output reads like "25 000 XAF".
    return formatCurrency(num, this.locale, 'XAF', 'XAF', '1.0-0');
  }
}
