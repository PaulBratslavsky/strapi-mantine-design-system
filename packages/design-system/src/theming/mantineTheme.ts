/**
 * Mantine theme — the JS-side configuration that pairs with `tokens.css`.
 *
 * Together with the CSS layers (`layers.css`), the tokens (`tokens.css`),
 * and the component polish (`componentPolish.css`), this file is the
 * complete Strapi theming surface. Anything you'd want to tune
 * app-wide — brand color, default radius, per-component overrides — lives
 * in one of these four files.
 *
 * See `theming/README.md` for the override hierarchy and how consumers
 * should extend.
 */
import { Button, createTheme, type MantineColorsTuple } from '@mantine/core';

/*
 * Strapi palettes ship roughly 5 stops (100, 200, 500, 600, 700). Mantine
 * expects 10. We pad missing positions with neighbour vars — reasonable
 * approximations for the 'subtle' / 'light' / 'filled' variants. Phase 8
 * can fill in proper intermediate values.
 */
const tupleFromStrapi = (name: string): MantineColorsTuple => [
  `var(--strapi-color-${name}100)`,
  `var(--strapi-color-${name}200)`,
  `var(--strapi-color-${name}200)`,
  `var(--strapi-color-${name}200)`,
  `var(--strapi-color-${name}500)`,
  `var(--strapi-color-${name}500)`,
  `var(--strapi-color-${name}600)`,
  `var(--strapi-color-${name}700)`,
  `var(--strapi-color-${name}700)`,
  `var(--strapi-color-${name}700)`,
];

export const mantineTheme = createTheme({
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
  // Single source of truth for radius across every Mantine component
  // (Button, Input, Card, etc.). 10px = brand-confident without being a pill.
  defaultRadius: '10px',
  primaryColor: 'primary',
  primaryShade: 6,
  colors: {
    primary: tupleFromStrapi('primary'),
    secondary: tupleFromStrapi('secondary'),
    success: tupleFromStrapi('success'),
    warning: tupleFromStrapi('warning'),
    danger: tupleFromStrapi('danger'),
    alternative: tupleFromStrapi('alternative'),
    neutral: [
      'var(--strapi-color-neutral0)',
      'var(--strapi-color-neutral100)',
      'var(--strapi-color-neutral150)',
      'var(--strapi-color-neutral200)',
      'var(--strapi-color-neutral300)',
      'var(--strapi-color-neutral400)',
      'var(--strapi-color-neutral500)',
      'var(--strapi-color-neutral600)',
      'var(--strapi-color-neutral700)',
      'var(--strapi-color-neutral800)',
    ],
  },
  spacing: {
    xs: 'var(--strapi-space-1)',
    sm: 'var(--strapi-space-2)',
    md: 'var(--strapi-space-4)',
    lg: 'var(--strapi-space-7)',
    xl: 'var(--strapi-space-9)',
  },
  fontSizes: {
    xs: 'var(--strapi-font-size-0)',
    sm: 'var(--strapi-font-size-1)',
    md: 'var(--strapi-font-size-2)',
    lg: 'var(--strapi-font-size-3)',
    xl: 'var(--strapi-font-size-4)',
  },
  lineHeights: {
    xs: 'var(--strapi-line-height-0)',
    sm: 'var(--strapi-line-height-2)',
    md: 'var(--strapi-line-height-3)',
    lg: 'var(--strapi-line-height-4)',
    xl: 'var(--strapi-line-height-6)',
  },
  radius: {
    xs: 'var(--strapi-radius)',
    sm: 'var(--strapi-radius)',
    md: 'var(--strapi-radius)',
    lg: 'var(--strapi-radius)',
    xl: 'var(--strapi-radius)',
  },
  shadows: {
    xs: 'var(--strapi-shadow-table)',
    sm: 'var(--strapi-shadow-filter)',
    md: 'var(--strapi-shadow-popup)',
    lg: 'var(--strapi-shadow-popup)',
    xl: 'var(--strapi-shadow-popup)',
  },
  /*
   * Component-level theming — applies to every Mantine component instance.
   * Override-surface 4 (theme.components.<Name>) per principles.md.
   *
   * Split rule (Option A):
   *   - JS (here) owns **Mantine wiring** that only the JS theme can do:
   *     defaultProps, classNames assignment, vars callbacks that read
   *     React props.
   *   - CSS (componentPolish.css, app-theme.css) owns **all visuals** —
   *     anything you could express with a stylesheet. That includes
   *     pseudo-classes, layered overrides, color-mix, and static visual
   *     touches like fontWeight.
   *
   * Why split it this way: Mantine's docs recommend CSS Modules as the
   * primary styling mechanism. Keeping JS focused on the things only JS
   * can do (defaultProps, prop-driven vars) gives one clear answer to
   * "where does this rule live?".
   *
   * Currently no Mantine component needs prop defaults — Mantine's own
   * defaults are sensible enough. This block stays as a template for
   * future phases when, e.g., TextInput wants `defaultProps: { size: 'md' }`.
   */
  components: {
    Button: Button.extend({}),
  },
});
