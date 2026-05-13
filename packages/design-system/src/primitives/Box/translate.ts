/**
 * Shared Strapi-Box-prop → Mantine-prop translation.
 *
 * Extracted so MantineBox AND MantineFlex (and any future Mantine-backed
 * primitive that inherits Box's prop surface) can map Strapi's named style
 * props onto Mantine's StyleProps in one place.
 *
 * Output split:
 *   - `mantineProps` — slots Mantine accepts natively (m/mt/p/c/bg/fz/lh/...).
 *     Strapi responsive objects (`{ initial, small, medium, large }`) pass
 *     through here because Mantine handles them natively via the breakpoint
 *     types we augmented in `theming/mantine-augmentation.ts`.
 *   - `inlineStyle`  — props Mantine has no slot for (cursor, transition,
 *     transform, etc.). Responsive form collapses to the `initial` value
 *     since inline style has no media-query mechanism.
 *   - `rest`         — everything left over (HTML attributes, refs, etc.) to
 *     be spread onto the underlying element.
 */
import type * as React from 'react';

import type { TransientBoxProps } from './legacy/LegacyBox';

/* -------------------------------------------------------------------------- */
/* Resolvers                                                                  */
/* -------------------------------------------------------------------------- */

type Resolver = (value: unknown) => string | undefined;

function isResponsive(v: unknown): v is Record<string, unknown> {
  return (
    v !== null &&
    typeof v === 'object' &&
    !Array.isArray(v) &&
    ('initial' in v || 'small' in v || 'medium' in v || 'large' in v)
  );
}

/**
 * Run `resolver` over a bare value or each entry of a responsive object.
 * Returns the same shape — Mantine accepts both in its StyleProp slots.
 */
export function resolve(
  value: unknown,
  resolver: Resolver,
): string | Record<string, string | undefined> | undefined {
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

export const resolveSpacing: Resolver = (v) => {
  if (v == null) return undefined;
  if (typeof v === 'number') return `var(--strapi-space-${v})`;
  return String(v);
};

export const resolveColor: Resolver = (v) => {
  if (v == null) return undefined;
  if (typeof v !== 'string') return String(v);
  if (/^[a-zA-Z][a-zA-Z0-9]*$/.test(v)) return `var(--strapi-color-${v})`;
  return v;
};

export const resolveShadow: Resolver = (v) => {
  if (v == null) return undefined;
  if (typeof v !== 'string') return String(v);
  const m = /^([a-z]+)Shadow$/.exec(v);
  if (m) return `var(--strapi-shadow-${m[1]})`;
  return v;
};

export const resolveFontSize: Resolver = (v) => {
  if (v == null) return undefined;
  if (typeof v === 'number') return `var(--strapi-font-size-${v})`;
  return String(v);
};

export const resolveLineHeight: Resolver = (v) => {
  if (v == null) return undefined;
  if (typeof v === 'number') return `var(--strapi-line-height-${v})`;
  return String(v);
};

export const resolveFontWeight: Resolver = (v) => {
  if (v == null) return undefined;
  if (typeof v === 'string' && /^[a-zA-Z]/.test(v)) {
    const kebab = v.replace(/([A-Z])/g, '-$1').toLowerCase();
    return `var(--strapi-font-weight-${kebab})`;
  }
  return String(v);
};

export const resolveBorderRadius: Resolver = (v) => {
  if (v == null) return undefined;
  if (typeof v === 'number') return `var(--strapi-space-${v})`;
  return String(v);
};

export const resolveRaw: Resolver = (v) => (v == null ? undefined : String(v));

/* -------------------------------------------------------------------------- */
/* translateBoxProps                                                          */
/* -------------------------------------------------------------------------- */

export interface TranslatedBoxProps {
  mantineProps: Record<string, unknown>;
  inlineStyle: React.CSSProperties;
  /** Any prop that wasn't a Strapi Box style prop — pass through to the element. */
  rest: Record<string, unknown>;
}

/**
 * Take a bag of Strapi-style props and split them into:
 *   - Mantine StyleProps (m, mt, ms, me, p, pt, w, c, bg, fz, fw, lh, etc.)
 *   - inline-style entries for props Mantine doesn't expose
 *   - everything else (HTML attrs, etc.)
 *
 * Logical-vs-physical mapping: `marginLeft`/`marginRight` map to `ms`/`me`
 * (inline-start/end, RTL-aware), matching the legacy Box's `margin-inline-*`
 * emission. Same for paddings.
 *
 * `hasRadius` resolves to `var(--strapi-radius)` and wins over an explicit
 * `borderRadius` (legacy parity).
 *
 * Auto-applied when `borderColor` is set: `border-style: solid` and
 * `border-width: 1px` (legacy parity).
 */
export function translateBoxProps(props: TransientBoxProps & Record<string, unknown>): TranslatedBoxProps {
  const {
    // Spacing
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
    // Container
    style,
    ...rest
  } = props;

  const mantineProps: Record<string, unknown> = {
    m: resolve(margin, resolveSpacing),
    mt: resolve(marginTop ?? marginBlockStart, resolveSpacing),
    mb: resolve(marginBottom ?? marginBlockEnd, resolveSpacing),
    my: resolve(marginBlock, resolveSpacing),
    mx: resolve(marginInline, resolveSpacing),
    ms: resolve(marginInlineStart ?? marginLeft, resolveSpacing),
    me: resolve(marginInlineEnd ?? marginRight, resolveSpacing),
    p: resolve(padding, resolveSpacing),
    pt: resolve(paddingTop ?? paddingBlockStart, resolveSpacing),
    pb: resolve(paddingBottom ?? paddingBlockEnd, resolveSpacing),
    py: resolve(paddingBlock, resolveSpacing),
    px: resolve(paddingInline, resolveSpacing),
    ps: resolve(paddingInlineStart ?? paddingLeft, resolveSpacing),
    pe: resolve(paddingInlineEnd ?? paddingRight, resolveSpacing),
    w: resolve(width, resolveSpacing),
    h: resolve(height, resolveSpacing),
    miw: resolve(minWidth, resolveSpacing),
    mih: resolve(minHeight, resolveSpacing),
    maw: resolve(maxWidth, resolveSpacing),
    mah: resolve(maxHeight, resolveSpacing),
    pos: resolve(position, resolveRaw),
    top: resolve(top, resolveSpacing),
    bottom: resolve(bottom, resolveSpacing),
    left: resolve(left, resolveSpacing),
    right: resolve(right, resolveSpacing),
    c: resolve(color, resolveColor),
    bg: resolve(background, resolveColor),
    fz: resolve(fontSize, resolveFontSize),
    fw: resolve(fontWeight, resolveFontWeight),
    lh: resolve(lineHeight, resolveLineHeight),
    ta: resolve(textAlign, resolveRaw),
    display: resolve(display, resolveRaw),
    flex: resolve(flex, resolveRaw),
  };

  const inlineStyle: React.CSSProperties = { ...((style as React.CSSProperties | undefined) ?? {}) };

  const assignStyle = (
    key: keyof React.CSSProperties,
    value: string | Record<string, string | undefined> | undefined,
  ) => {
    if (value === undefined) return;
    if (typeof value === 'string') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (inlineStyle as any)[key] = value;
    } else if (value && typeof value === 'object' && 'initial' in value) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (inlineStyle as any)[key] = value.initial;
    }
  };

  assignStyle('borderColor', resolve(borderColor, resolveColor));
  assignStyle('borderStyle', resolve(borderStyle, resolveRaw));
  assignStyle('borderWidth', resolve(borderWidth, resolveSpacing));

  if (hasRadius) {
    inlineStyle.borderRadius = 'var(--strapi-radius)';
  } else {
    assignStyle('borderRadius', resolve(borderRadius, resolveBorderRadius));
  }
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

  return {
    mantineProps,
    inlineStyle,
    rest: rest as Record<string, unknown>,
  };
}
