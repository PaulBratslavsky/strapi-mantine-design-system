/**
 * Theming public API.
 *
 * The `theming/` module owns every place where Strapi makes a brand or
 * cross-cutting visual decision:
 *
 *   - tokens.css            — CSS custom properties (--strapi-*) for light/dark
 *   - layers.css            — Cascade-layer order + Mantine @import
 *   - componentPolish.css   — Per-component CSS overrides (hover, focus, etc.)
 *   - mantineTheme.ts       — Mantine `createTheme(...)` config
 *
 * Consumers wanting to extend the theme:
 *   - Override CSS vars on `:root` or a scoped class (re-brand cheaply)
 *   - Re-export `mantineTheme` and merge with their own additions via
 *     `mergeMantineTheme(mantineTheme, { ... })` then wrap with their own
 *     <MantineProvider> further down the tree
 *   - For per-subtree component swaps, see the resolver (`../resolver`)
 *
 * See `theming/README.md` for the full override hierarchy and examples.
 */
// Side-effect import: brings the @mantine/core breakpoint type augmentation
// into scope wherever the design-system is consumed.
import './mantine-augmentation';

export { mantineTheme } from './mantineTheme';
