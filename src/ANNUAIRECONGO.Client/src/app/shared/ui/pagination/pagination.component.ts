import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

/**
 * <ac-pagination> — accessible pagination with previous / next + page jump.
 * Emits the new 1-based page index.
 *
 *   <ac-pagination
 *     [currentPage]="1" [totalPages]="12"
 *     (pageChange)="loadPage($event)"
 *   />
 */
@Component({
  selector: 'ac-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (totalPages() > 1) {
      <nav class="pagination" [attr.aria-label]="ariaLabel()">
        <button
          type="button"
          class="page-btn"
          [disabled]="currentPage() === 1"
          (click)="go(currentPage() - 1)"
          aria-label="Page précédente"
        >
          <span class="material-symbols-outlined" aria-hidden="true">chevron_left</span>
        </button>

        @for (p of pages(); track p) {
          @if (p === '…') {
            <span class="page-ellipsis" aria-hidden="true">…</span>
          } @else {
            <button
              type="button"
              class="page-btn"
              [class.active]="p === currentPage()"
              [attr.aria-current]="p === currentPage() ? 'page' : null"
              [attr.aria-label]="'Page ' + p"
              (click)="go(+p)"
            >{{ p }}</button>
          }
        }

        <button
          type="button"
          class="page-btn"
          [disabled]="currentPage() === totalPages()"
          (click)="go(currentPage() + 1)"
          aria-label="Page suivante"
        >
          <span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>
        </button>
      </nav>
    }
  `,
  styles: [`
    :host { display: block; }
    .pagination { display: inline-flex; align-items: center; gap: 4px; }
    .page-btn {
      min-width: 36px;
      height: 36px;
      padding: 0 10px;
      border-radius: var(--radius-md);
      background: transparent;
      color: var(--color-on-secondary-container);
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s, color 0.15s;
    }
    .page-btn:hover:not(:disabled) { background: var(--color-surface-container); color: var(--color-primary); }
    .page-btn.active {
      background: var(--color-primary);
      color: var(--color-on-primary);
    }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .page-ellipsis {
      width: 24px;
      text-align: center;
      color: var(--color-outline);
    }
  `],
})
export class PaginationComponent {
  readonly currentPage = input.required<number>();
  readonly totalPages  = input.required<number>();
  readonly ariaLabel   = input<string>('Pagination');
  readonly pageChange  = output<number>();

  protected readonly pages = computed<(number | '…')[]>(() => {
    const total = this.totalPages();
    const cur   = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const out: (number | '…')[] = [1];
    if (cur > 4) out.push('…');
    for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) {
      out.push(p);
    }
    if (cur < total - 3) out.push('…');
    out.push(total);
    return out;
  });

  protected go(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    this.pageChange.emit(page);
  }
}
