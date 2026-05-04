import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeFrExtra from '@angular/common/locales/extra/fr';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { httpErrorInterceptor } from './core/interceptors/http-error.interceptor';
import { provideAnnuaireServiceWorker } from './core/sw/sw.providers';

// French locale registration — affects DatePipe, DecimalPipe, CurrencyPipe,
// and the XafPipe used across the app.
registerLocaleData(localeFr, 'fr', localeFrExtra);

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'fr' },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
      withComponentInputBinding(),
    ),
    provideHttpClient(withInterceptors([authInterceptor, httpErrorInterceptor])),
    // Animations for CDK Overlay (modal / toast) and our own component animations.
    provideAnimationsAsync(),
    // PWA service worker — no-op until @angular/service-worker is installed
    // (see core/sw/sw.providers.ts for the activation steps).
    provideAnnuaireServiceWorker(),
  ]
};
