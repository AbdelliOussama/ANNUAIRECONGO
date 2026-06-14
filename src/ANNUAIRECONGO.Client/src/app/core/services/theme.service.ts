import { Injectable, signal } from '@angular/core';

/**
 * ThemeService — manages the light / dark mode toggle.
 *
 * - Persists the user's preference in `localStorage` (key: `ac-theme`).
 * - Falls back to `prefers-color-scheme: dark` media query when no preference is saved.
 * - Applies a `.dark` CSS class on `<html>` to drive CSS variable overrides.
 *
 * The FOUC-prevention inline script in `index.html` applies the `.dark` class
 * synchronously before Angular bootstraps, so the visual state is consistent
 * even before this service initialises.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** `true` when dark mode is active. */
  readonly isDarkMode = signal(false);

  private static readonly STORAGE_KEY = 'ac-theme';

  constructor() {
    const saved = localStorage.getItem(ThemeService.STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = saved ? saved === 'dark' : prefersDark;
    this.applyTheme(dark);
  }

  /** Toggle between light and dark mode. */
  toggle(): void {
    this.applyTheme(!this.isDarkMode());
  }

  private applyTheme(dark: boolean): void {
    this.isDarkMode.set(dark);
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem(ThemeService.STORAGE_KEY, dark ? 'dark' : 'light');
  }
}
