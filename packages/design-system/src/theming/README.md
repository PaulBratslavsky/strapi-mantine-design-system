# Theming

Everything that makes a Strapi-branded visual decision lives here.

## Files

| File | What it owns |
|---|---|
| `tokens.css` | `--strapi-*` CSS custom properties (colors, spaces, radii, font sizes, shadows, z-indices). Both light and dark themes via `[data-theme='dark']`. |
| `layers.css` | Cascade-layer declaration (`@layer reset, mantine, strapi-tokens, strapi-components, app;`) and `@import url('@mantine/core/styles.layer.css')`. |
| `componentPolish.css` | Per-component CSS overrides — interaction states (`:hover`, `:active`), refinements to Mantine's defaults. Wrapped in `@layer strapi-components`. |
| `mantineTheme.ts` | The Mantine `createTheme(...)` config. Maps Mantine palette names to Strapi token CSS vars, sets `theme.components.*` overrides. |

## Override hierarchy (consumers)

Six surfaces, finest to coarsest. Use the lightest one that does what you need.

| # | Surface | Use when |
|---|---|---|
| 1 | `className` / `style` prop on one render | One-off styling |
| 2 | `styles` prop (Mantine Styles API) | One-off, with access to internal Mantine elements (root, section, label) |
| 3 | Polymorphic `component=` prop | Change rendered element (e.g. `<Button component={Link}>`) |
| 4 | `theme.components.Button` in your own Mantine theme | Tune every Button app-wide |
| 5 | Override CSS vars on `:root` or a scoped class | Re-theme tokens (brand color, radius) — flows into everything |
| 6 | `<DSProvider components={...}>` | Completely swap the component implementation for a subtree |

Surfaces 1-5 are Mantine-native. Surface 6 is the resolver — the WordPress-style escape hatch when nothing finer fits.

## Extending the theme (consumer guide)

### Re-brand the color palette

The simplest customization. Override CSS vars on `:root` or a scoped class in your own stylesheet:

```css
:root.my-brand {
  --strapi-color-primary600: #FF6B00;
  --strapi-color-primary700: #CC5500;
}
```

Every Mantine component instance using `primary` color reflects the change immediately — no JS, no rebuild. Tokens propagate through the Mantine theme by reference (`var(...)`).

### Tune all Buttons (or all Inputs, etc.)

Compose your own Mantine theme on top:

```tsx
import { mantineTheme as strapiMantineTheme } from '@strapi/design-system';
import { mergeMantineTheme, MantineProvider } from '@mantine/core';

const myTheme = mergeMantineTheme(strapiMantineTheme, {
  components: {
    Button: {
      defaultProps: { radius: 'xl' },
    },
  },
});

<MantineProvider theme={myTheme}>
  {/* your app */}
</MantineProvider>
```

### Swap a component entirely (WordPress-style)

When Mantine's surfaces 1-5 aren't enough:

```tsx
import { DSProvider } from '@strapi/design-system';

<DSProvider components={{ Button: { default: MyCustomButton } }}>
  {/* every <Button> in this subtree renders MyCustomButton */}
</DSProvider>
```

See `notes/ds-migration/principles.md` in the parent repo for the full rationale ("defaults never get removed; consumers can substitute anything").

## Extending the theme (DS maintainer guide)

### Adding a new Strapi token

1. Add the CSS variable to `tokens.css` under both `:root` and `[data-theme='dark']`.
2. Update the corresponding entry in `mantineTheme.ts` if Mantine should know about it (e.g. add a stop to a color tuple).
3. **Do not remove** existing tokens — they're part of the public API. Aliasing is fine, deletion is not.

### Adding a per-component override

The split rule (Option A — slightly stricter than Mantine's docs literally prescribe, but operationally clearer):

1. **`mantineTheme.ts`** owns **Mantine wiring** only — things only JS can do:
   - `defaultProps` (no other place sets these)
   - `classNames` assignment (if you want to use class-based selectors)
   - `vars: (theme, props) => ({...})` callbacks (the only mechanism that reads React props)

2. **`componentPolish.css`** (DS-default) or **`app-theme.css`** (consumer override) owns **all visuals** — anything you could express with a stylesheet:
   - All `:hover`, `:active`, `:focus-visible`, `:disabled` states
   - `[data-variant=...]`-specific rules
   - `color-mix()`, `:has()`, any modern CSS feature
   - Static visuals too (fontWeight, letterSpacing) — keeps all visual rules in one mental category

**Why this strict split** (when Mantine's docs allow small inline `styles` objects too):

- One mental model: "is this a Mantine prop / wiring concern? → JS. Is this how it looks? → CSS."
- All visual changes happen in a single file you can scan. No "wait, which file wins?" moments.
- Refactors don't move rules between languages.
- CSS file is the obvious place a designer or styling-focused dev looks.

### This is an internal convention, not a consumer constraint

Option A applies to **how the DS itself and the Strapi admin write rules in this repo**. Consumers can use any Mantine API they want:

```tsx
// All of these continue to work for consumers — Mantine APIs are not blocked
<Button styles={{ root: { background: 'red' } }} />          // surface 2
<Button className="my-utility" />                            // surface 1
<Button component={Link} to="/x">…</Button>                  // surface 3

// Compose your own Mantine theme on top of ours
import { mantineTheme as strapiTheme } from '@strapi/design-system';
import { mergeMantineTheme } from '@mantine/core';
const myTheme = mergeMantineTheme(strapiTheme, {
  components: {
    Button: Button.extend({ defaultProps: { size: 'lg' } }),
  },
});

// Swap the implementation entirely (resolver — surface 6)
<DSProvider components={{ Button: { default: MyCustomButton } }}>
```

Option A is just our **maintenance rule** for keeping the DS + admin codebases consistent. A third-party plugin author or app developer is free to use whatever Mantine API fits their use case.

**Where polish goes:**

| Polish type | Where it lives |
|---|---|
| Strapi-default for every consumer (e.g. bold button labels) | `componentPolish.css` (`@layer strapi-components`) |
| This-installation only (e.g. brand halo, custom padding) | `app-theme.css` in the consuming app (`@layer app`) |
| Tied to a React prop value | `Button.extend({ vars: (theme, { color }) => ({ root: {...} }) })` in JS, then CSS rule that reads the var |
| Mantine's prop default (e.g. `size: 'md'`) | `Button.extend({ defaultProps: {...} })` in JS — only place this works |

### Mantine Styles overview reference

Mantine docs on its styles system: <https://mantine.dev/styles/styles-overview/>. The key concepts:

- **Styles API**: every Mantine component exposes element-level class names like `mantine-Button-root`, `mantine-Button-section`, `mantine-Button-label`. These are stable contract names — safe to target from CSS.
- **CSS variables**: per-instance variables (`--button-bg`, `--button-height`) set on the rendered element. Override them via `style`, `styles`, or `vars` props/configs.
- **`theme.components.<Name>`**: app-wide defaults for any Mantine component.

Mantine's docs hierarchy ranks the four APIs as: (1) component props → (2) CSS Modules → (3) style props (max 3-4) → (4) inline `style`. Our Option A simplification: combine 2-4 into "CSS Modules / external stylesheet for visuals; component props via `defaultProps` for wiring."
