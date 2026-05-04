import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';

/**
 * Breakpoints aligned with Tailwind defaults so JS and CSS agree.
 *   xs  : <  640px
 *   sm  : >= 640px
 *   md  : >= 768px
 *   lg  : >= 1024px
 *   xl  : >= 1280px
 */
const BREAKPOINTS = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
} as const;

@Injectable({ providedIn: 'root' })
export class BreakpointService {
  private readonly observer    = inject(BreakpointObserver);
  private readonly destroyRef  = inject(DestroyRef);

  private readonly _gteSm = signal(false);
  private readonly _gteMd = signal(false);
  private readonly _gteLg = signal(false);
  private readonly _gteXl = signal(false);

  readonly gteSm = this._gteSm.asReadonly();
  readonly gteMd = this._gteMd.asReadonly();
  readonly gteLg = this._gteLg.asReadonly();
  readonly gteXl = this._gteXl.asReadonly();

  readonly isMobile  = computed(() => !this._gteMd());
  readonly isTablet  = computed(() =>  this._gteMd() && !this._gteLg());
  readonly isDesktop = computed(() =>  this._gteLg());

  constructor() {
    this.observer
      .observe(Object.values(BREAKPOINTS))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        this._gteSm.set(!!state.breakpoints[BREAKPOINTS.sm]);
        this._gteMd.set(!!state.breakpoints[BREAKPOINTS.md]);
        this._gteLg.set(!!state.breakpoints[BREAKPOINTS.lg]);
        this._gteXl.set(!!state.breakpoints[BREAKPOINTS.xl]);
      });
  }
}
