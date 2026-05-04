import { EnvironmentProviders, isDevMode, makeEnvironmentProviders } from '@angular/core';

/**
 * Service-worker registration provider.
 *
 * The Angular SW package is **not yet installed** — registration is wired up
 * defensively so that the app keeps booting whether or not the package is
 * present. To activate the PWA layer:
 *
 *   1. `npm i @angular/service-worker@^19.2.0`
 *   2. Replace the body of `provideAnnuaireServiceWorker()` with the
 *      commented snippet below (so it actually calls `provideServiceWorker`
 *      from the package).
 *   3. Re-build for production — the SW will be bundled from
 *      `ngsw-config.json` (already present at the repo root).
 *
 *   import { provideServiceWorker } from '@angular/service-worker';
 *   return makeEnvironmentProviders([
 *     provideServiceWorker('ngsw-worker.js', {
 *       enabled: !isDevMode(),
 *       registrationStrategy: 'registerWhenStable:30000',
 *     }),
 *   ]);
 */
export function provideAnnuaireServiceWorker(): EnvironmentProviders {
  // Until the SW package is installed we return an empty provider set so
  // app.config.ts can keep referencing this helper unconditionally.
  void isDevMode;
  return makeEnvironmentProviders([]);
}
