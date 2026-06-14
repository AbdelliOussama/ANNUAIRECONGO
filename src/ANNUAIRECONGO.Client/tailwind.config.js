/**
 * Annuaire Congo — Tailwind configuration
 * Mirrors the maquette's `assets/tw-config.js` so Angular components produce
 * the same visual output as the HTML reference.
 *
 * Sources: maquette/assets/tw-config.js + maquette/assets/styles.css
 * Audit refs: C2 (tokens), M4 (fonts), P2 (radius scale)
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{html,ts,scss}',
    './src/index.html',
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette — institutional dark green (Material 3)
        'primary': '#00943e',
        'primary-container': '#006847',
        'on-primary': '#ffffff',
        'on-primary-container': '#90e4ba',
        'primary-fixed': '#9ff4c9',
        'primary-fixed-dim': '#84d7ae',
        'on-primary-fixed': '#002114',
        'on-primary-fixed-variant': '#005237',
        'inverse-primary': '#84d7ae',

        // Secondary
        'secondary': '#515f74',
        'secondary-container': '#d5e3fc',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#57657a',
        'secondary-fixed': '#d5e3fc',
        'secondary-fixed-dim': '#b9c7df',
        'on-secondary-fixed': '#0d1c2e',
        'on-secondary-fixed-variant': '#3a485b',

        // Tertiary (gold/amber accents)
        'tertiary': '#564000',
        'tertiary-container': '#735600',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#fbd24b',
        'tertiary-fixed': '#ffdf9a',
        'tertiary-fixed-dim': '#fbd24b',
        'on-tertiary-fixed': '#251a00',
        'on-tertiary-fixed-variant': '#5a4300',

        // Errors
        'error': '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error': '#ffffff',
        'on-error-container': '#93000a',

        // Surfaces
        'background': '#f7f9fb',
        'on-background': '#191c1e',
        'surface': '#f7f9fb',
        'surface-dim': '#d8dadc',
        'surface-bright': '#f7f9fb',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f2f4f6',
        'surface-container': '#eceef0',
        'surface-container-high': '#e6e8ea',
        'surface-container-highest': '#e0e3e5',
        'surface-variant': '#e0e3e5',
        'on-surface': '#191c1e',
        'on-surface-variant': '#3f4943',

        // Outline
        'outline': '#6f7a72',
        'outline-variant': '#bec9c1',

        // Inverse
        'inverse-surface': '#2d3133',
        'inverse-on-surface': '#eff1f3',
        'surface-tint': '#096c4b',
      },
      borderRadius: {
        // Standardized radius scale (audit P2)
        DEFAULT: '6px',
        lg: '10px',
        xl: '14px',
        '2xl': '20px',
        full: '9999px',
      },
      fontFamily: {
        // Editorial pairing — DM Serif Display + DM Sans (audit M4)
        headline: ['"DM Serif Display"', 'Georgia', 'serif'],
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        label: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
};
