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

Two places to touch:

1. **`mantineTheme.ts`** → `components.<Name>` for prop defaults and inline styles that don't need pseudo-classes.
2. **`componentPolish.css`** → for `:hover`, `:active`, `:focus-visible`, `[data-variant=...]`-specific rules. Wrap in `@layer strapi-components`.

### Mantine Styles overview reference

Mantine docs on its styles system: <https://mantine.dev/styles/styles-overview/>. The key concepts:

- **Styles API**: every Mantine component exposes element-level class names like `mantine-Button-root`, `mantine-Button-section`, `mantine-Button-label`. These are stable contract names — safe to target from CSS.
- **CSS variables**: per-instance variables (`--button-bg`, `--button-height`) set on the rendered element. Override them via `style`, `styles`, or `vars` props/configs.
- **`theme.components.<Name>`**: app-wide defaults for any Mantine component.
