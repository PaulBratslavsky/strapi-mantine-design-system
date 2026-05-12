/**
 * MantineBox — Mantine-backed implementation of Strapi's <Box>.
 *
 * Box is the structural primitive every layout component is built on (Flex,
 * Typography, BaseLink, SubNav, Card, etc.). This wrapper translates Strapi's
 * 60+ style props onto Mantine's `<Box>` while preserving the exact public
 * API consumers depend on.
 *
 * Translation strategy ("drop-in"):
 *   1. **Mantine has a direct prop** → pass through under its Mantine name:
 *      margin → m, marginTop → mt, padding → p, color → c, background → bg,
 *      width → w, fontSize → fz, etc. Mantine accepts arbitrary strings here
 *      (via its `(string & {})` branch), so we hand it CSS-variable values.
 *   2. **No direct Mantine prop** → emit on `style={...}`:
 *      cursor, pointerEvents, transition, transform, animation, overflow,
 *      borderColor/Style/Width/Radius, shadow, flex basis/grow/shrink, order,
 *      zIndex, textTransform.
 *   3. **Token resolution** — Strapi values are CSS variables:
 *      - numeric spacing (`padding={2}`) → `var(--strapi-space-2)`
 *      - color tokens (`color="primary600"`) → `var(--strapi-color-primary600)`
 *      - shadow tokens (`shadow="filterShadow"`) → `var(--strapi-shadow-filter)`
 *      - font-size/line-height numeric indices → matching CSS vars
 *      - font-weight names → `var(--strapi-font-weight-regular)` etc.
 *      - raw strings (`width="100%"`) pass through unchanged
 *   4. **Responsive objects** (`padding={{ initial: 1, large: 3 }}`) are
 *      resolved per-key; Mantine handles the media queries natively because
 *      the theme's `breakpoints` declares `initial|small|medium|large` keys
 *      at Strapi's original pixel boundaries (Option A, set in
 *      `theming/mantineTheme.ts`).
 *
 * The `BoxProps` and `TransientBoxProps` types are re-exported from
 * `./legacy/LegacyBox` — single source of truth for the public surface so
 * every consumer's prop math stays untouched.
 */
import * as React from 'react';

import { Box as MantineBoxBase } from '@mantine/core';

import type { BoxProps, TransientBoxProps } from './legacy/LegacyBox';

/* -------------------------------------------------------------------------- */
/* Value resolution                                                           */
/* -------------------------------------------------------------------------- */

/** Resolve a single non-responsive value via `resolver`. Pass through everything else. */
type Resolver = (value: unknown) => string | undefined;

/** Returns true if `v` looks like the `{ initial, small, medium, large }` form. */
function isResponsive(v: unknown): v is Record<string, unknown> {
  return (
    v !== null &&
    typeof v === 'object' &&
    !Array.isArray(v) &&
    // The four breakpoint keys Strapi uses. Any object that has at least one
    // of them and no other shape is the responsive form.
    ('initial' in v || 'small' in v || 'medium' in v || 'large' in v)
  );
}

/**
 * Run `resolver` over either a single value or each entry of a responsive
 * object. Returns the same shape — bare for bare input, object for object.
 * Mantine accepts both shapes in its StyleProp slots.
 */
function resolve(value: unknown, resolver: Resolver): string | Record<string, string | undefined> | undefined {
  if (value == null) return undefined;
  if (isResponsive(value)) {
    const out: Record<string, string | undefined> = {};
    for (const [bp, v] of Object.entries(value)) {
      out[bp] = resolver(v);
    }
    return out;
  }
  return resolver(value);
}

/** Spacing: numeric index (0..11) → `var(--strapi-space-N)`. Strings pass through. */
const resolveSpacing: Resolver = (v) => {
  if (v == null) return undefined;
  if (typeof v === 'number') return `var(--strapi-space-${v})`;
  return String(v);
};

/** Color token (`primary600`, `neutral200`) → CSS var. Plain CSS colors pass through. */
const resolveColor: Resolver = (v) => {
  if (v == null) return undefined;
  if (typeof v !== 'string') return String(v);
  // Tokens are alphanumeric (`primary600`, `neutral0`); CSS colors contain
  // `(`, `#`, or are keyword colors. Conservative heuristic: if the value is
  // a single alphanumeric word, treat it as a token.
  if (/^[a-zA-Z][a-zA-Z0-9]*$/.test(v)) return `var(--strapi-color-${v})`;
  return v;
};

/**
 * Shadow tokens use camelCase in Strapi (`filterShadow`, `popupShadow`,
 * `tableShadow`) but kebab-case in the CSS variables (`--strapi-shadow-filter`).
 * The kebab name is the camel name minus the literal `Shadow` suffix.
 */
const resolveShadow: Resolver = (v) => {
  if (v == null) return undefined;
  if (typeof v !== 'string') return String(v);
  // Token form: ends in `Shadow`.
  const m = /^([a-z]+)Shadow$/.exec(v);
  if (m) return `var(--strapi-shadow-${m[1]})`;
  return v;
};

/** Font size: numeric index (0..7) → CSS var. */
const resolveFontSize: Resolver = (v) => {
  if (v == null) return undefined;
  if (typeof v === 'number') return `var(--strapi-font-size-${v})`;
  return String(v);
};

/** Line height: numeric index (0..6) → CSS var. */
const resolveLineHeight: Resolver = (v) => {
  if (v == null) return undefined;
  if (typeof v === 'number') return `var(--strapi-line-height-${v})`;
  return String(v);
};

/** Font weight: token name → CSS var. Plain numeric weights pass through as strings. */
const resolveFontWeight: Resolver = (v) => {
  if (v == null) return undefined;
  if (typeof v === 'string' && /^[a-zA-Z]/.test(v)) {
    // `semiBold` → `semi-bold` (kebab-case in the CSS variable).
    const kebab = v.replace(/([A-Z])/g, '-$1').toLowerCase();
    return `var(--strapi-font-weight-${kebab})`;
  }
  return String(v);
};

/** Border radius: numeric → spacing token; otherwise pass through. */
const resolveBorderRadius: Resolver = (v) => {
  if (v == null) return undefined;
  if (typeof v === 'number') return `var(--strapi-space-${v})`;
  return String(v);
};

/** Pass-through resolver — no token translation. */
const resolveRaw: Resolver = (v) => (v == null ? undefined : String(v));

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

// Mantine Box has a strict polymorphic type for `component`. Strapi's `tag`
// accepts any ElementType (incl. custom components), so we widen the JSX
// type. Runtime behavior is unchanged.
const MantineBoxPermissive = MantineBoxBase as unknown as React.ComponentType<
  Record<string, unknown> & { ref?: React.Ref<HTMLElement> }
>;

type MantineBoxProps = TransientBoxProps & {
  tag?: React.ElementType;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: unknown;
};

const MantineBox = React.forwardRef<HTMLElement, MantineBoxProps>((props, ref) => {
  const {
    // Spacing — full margin/padding matrix
    margin,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    marginBlock,
    marginBlockStart,
    marginBlockEnd,
    marginInline,
    marginInlineStart,
    marginInlineEnd,
    padding,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    paddingBlock,
    paddingBlockStart,
    paddingBlockEnd,
    paddingInline,
    paddingInlineStart,
    paddingInlineEnd,
    // Sizing
    width,
    height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    // Position
    top,
    bottom,
    left,
    right,
    position,
    // Colors / borders
    color,
    background,
    borderColor,
    borderStyle,
    borderWidth,
    borderRadius,
    hasRadius,
    shadow,
    // Typography
    fontSize,
    fontWeight,
    lineHeight,
    textAlign,
    textTransform,
    // Behavioral
    display,
    flex,
    basis,
    grow,
    shrink,
    order,
    cursor,
    pointerEvents,
    overflow,
    transition,
    transform,
    animation,
    zIndex,
    // Pass-through / polymorphism
    tag,
    style,
    children,
    ...rest
  } = props;

  /* ------------------------------ Mantine props ----------------------------- */

  // Note on logical vs physical mapping: the legacy Box emitted
  // `margin-inline-start` for `marginLeft` (RTL-aware). For drop-in fidelity
  // we map `marginLeft`/`marginRight` to Mantine's `ms`/`me` (also inline-
  // logical), not `ml`/`mr` (physical). Same for paddings. Explicit
  // `marginInlineStart`/`marginInlineEnd` props take precedence over the
  // left/right aliases when both are provided.
  const mantineProps: Record<string, unknown> = {
    // Margins
    m: resolve(margin, resolveSpacing),
    mt: resolve(marginTop ?? marginBlockStart, resolveSpacing),
    mb: resolve(marginBottom ?? marginBlockEnd, resolveSpacing),
    my: resolve(marginBlock, resolveSpacing),
    mx: resolve(marginInline, resolveSpacing),
    ms: resolve(marginInlineStart ?? marginLeft, resolveSpacing),
    me: resolve(marginInlineEnd ?? marginRight, resolveSpacing),
    // Paddings
    p: resolve(padding, resolveSpacing),
    pt: resolve(paddingTop ?? paddingBlockStart, resolveSpacing),
    pb: resolve(paddingBottom ?? paddingBlockEnd, resolveSpacing),
    py: resolve(paddingBlock, resolveSpacing),
    px: resolve(paddingInline, resolveSpacing),
    ps: resolve(paddingInlineStart ?? paddingLeft, resolveSpacing),
    pe: resolve(paddingInlineEnd ?? paddingRight, resolveSpacing),
    // Sizing
    w: resolve(width, resolveSpacing),
    h: resolve(height, resolveSpacing),
    miw: resolve(minWidth, resolveSpacing),
    mih: resolve(minHeight, resolveSpacing),
    maw: resolve(maxWidth, resolveSpacing),
    mah: resolve(maxHeight, resolveSpacing),
    // Position
    pos: resolve(position, resolveRaw),
    top: resolve(top, resolveSpacing),
    bottom: resolve(bottom, resolveSpacing),
    left: resolve(left, resolveSpacing),
    right: resolve(right, resolveSpacing),
    // Colors
    c: resolve(color, resolveColor),
    bg: resolve(background, resolveColor),
    // Typography (Mantine names)
    fz: resolve(fontSize, resolveFontSize),
    fw: resolve(fontWeight, resolveFontWeight),
    lh: resolve(lineHeight, resolveLineHeight),
    ta: resolve(textAlign, resolveRaw),
    // Display / flex
    display: resolve(display, resolveRaw),
    flex: resolve(flex, resolveRaw),
  };

  /* ------------------------ Inline-style fallback props ---------------------- */

  // Props Mantine doesn't expose as StyleProps. Emit them on `style={...}`.
  // The fallback layer also handles the `hasRadius` boolean by translating
  // it to the default radius token. Mantine merges our `style` with whatever
  // it computes internally, so this composes cleanly.
  const inlineStyle: React.CSSProperties = { ...style };

  // Helper: assign only if defined; respect existing `style` user passed.
  const assignStyle = (
    key: keyof React.CSSProperties,
    value: string | Record<string, string | undefined> | undefined,
  ) => {
    if (value === undefined) return;
    if (typeof value === 'string') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (inlineStyle as any)[key] = value;
    }
    // Responsive objects from the fallback list aren't honored by inline
    // style — drop to the bare `initial` value if present. The Mantine-prop
    // path above handles responsive correctly because Mantine itself emits
    // the media queries.
    else if (value && typeof value === 'object' && 'initial' in value) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (inlineStyle as any)[key] = value.initial;
    }
  };

  assignStyle('borderColor', resolve(borderColor, resolveColor));
  assignStyle('borderStyle', resolve(borderStyle, resolveRaw));
  assignStyle('borderWidth', resolve(borderWidth, resolveSpacing));

  // hasRadius wins over an explicit borderRadius (matches legacy precedence
  // in LegacyBox: `props.$hasRadius ? theme.borderRadius : props.$borderRadius`).
  if (hasRadius) {
    inlineStyle.borderRadius = 'var(--strapi-radius)';
  } else {
    assignStyle('borderRadius', resolve(borderRadius, resolveBorderRadius));
  }

  // Auto-apply border-style/width when borderColor is set but those aren't
  // (legacy parity — LegacyBox does this).
  if (borderColor && !borderStyle) inlineStyle.borderStyle = 'solid';
  if (borderColor && !borderWidth) inlineStyle.borderWidth = '1px';

  assignStyle('boxShadow', resolve(shadow, resolveShadow));
  assignStyle('cursor', resolve(cursor, resolveRaw));
  assignStyle('pointerEvents', resolve(pointerEvents, resolveRaw));
  assignStyle('overflow', resolve(overflow, resolveRaw));
  assignStyle('transition', resolve(transition, resolveRaw));
  assignStyle('transform', resolve(transform, resolveRaw));
  assignStyle('animation', resolve(animation, resolveRaw));
  assignStyle('textTransform', resolve(textTransform, resolveRaw));
  assignStyle('flexBasis', resolve(basis, resolveSpacing));
  assignStyle('flexGrow', resolve(grow, resolveRaw));
  assignStyle('flexShrink', resolve(shrink, resolveRaw));
  assignStyle('order', resolve(order, resolveRaw));
  assignStyle('zIndex', resolve(zIndex, resolveRaw));

  /* -------------------------------- Render --------------------------------- */

  return (
    <MantineBoxPermissive
      ref={ref}
      component={tag as React.ElementType | undefined}
      style={inlineStyle}
      data-strapi-box=""
      {...mantineProps}
      {...(rest as Record<string, unknown>)}
    >
      {children}
    </MantineBoxPermissive>
  );
});

MantineBox.displayName = 'MantineBox';

export { MantineBox };
export type { BoxProps, TransientBoxProps };
