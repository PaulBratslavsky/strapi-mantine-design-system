/**
 * MantineFlex — Mantine-backed implementation of Strapi's <Flex>.
 *
 * Composes through Strapi's `<Box>` resolver shell, which routes to MantineBox
 * by default. That means:
 *   - All Box-inherited style props (margin, padding, color, background, etc.)
 *     flow through MantineBox's translation untouched. No duplication.
 *   - Flex-specific props (alignItems, justifyContent, direction, wrap, gap,
 *     inline) are translated to CSS at this layer and merged into `style`.
 *
 * Default behavior matches the legacy Strapi <Flex>:
 *   display: flex; align-items: center; flex-direction: row.
 * That's load-bearing — many consumers rely on implicit centering.
 *
 * Responsive Flex props (alignItems={{ initial: 'center', large: 'flex-start' }})
 * are not exercised by any in-tree consumer today; for v1 they fall back to
 * the `initial` value. Box-inherited responsive props (margin/padding/etc.)
 * still work via Mantine StyleProps because MantineBox handles them natively.
 */
import * as React from 'react';

import { Box } from '../Box';

import type { FlexProps, TransientFlexProps } from './legacy/LegacyFlex';

/* -------------------------------------------------------------------------- */
/* Local resolvers                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Take a Flex-specific value (which may be the responsive object form) and
 * collapse to a single CSS-string value for inline-style emission. Responsive
 * form uses only the `initial` value as a fallback — see file-header note.
 *
 * Widely typed because callers pass values from `styled-components`-styled
 * `ResponsiveProperty<...>` unions whose generic parameter trips TS inference
 * when we try to thread it through. Output is always a string-or-undefined
 * suitable for `style.foo`.
 */
function pickFlexValue(v: unknown): string | undefined {
  if (v == null) return undefined;
  if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
    const initial = (v as Record<string, unknown>).initial;
    return initial == null ? undefined : String(initial);
  }
  return String(v);
}

/** Numeric gap index → space CSS var; pass strings through. */
function resolveGap(v: unknown): string | undefined {
  if (v == null) return undefined;
  if (typeof v === 'number') return `var(--strapi-space-${v})`;
  if (typeof v === 'object' && v !== null) {
    const initial = (v as { initial?: unknown }).initial;
    if (typeof initial === 'number') return `var(--strapi-space-${initial})`;
    if (initial != null) return String(initial);
    return undefined;
  }
  return String(v);
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

type MantineFlexProps = FlexProps & {
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
};

const MantineFlex = React.forwardRef<HTMLElement, MantineFlexProps>((props, ref) => {
  const {
    alignItems = 'center',
    justifyContent,
    direction = 'row',
    wrap,
    gap,
    inline,
    style,
    ...rest
  } = props as MantineFlexProps & TransientFlexProps;

  // Merge Flex-specific concerns into inline style. The user's own `style`
  // wins (spread last) — matches how the legacy Box+styled-components stacked.
  // `as React.CSSProperties[...]` casts let us hand string-typed values to
  // csstype's strict union without losing the runtime correctness — Mantine's
  // own Box does the same thing for its style passthrough.
  const flexStyle: React.CSSProperties = {
    flexDirection: pickFlexValue(direction) as React.CSSProperties['flexDirection'],
    alignItems: pickFlexValue(alignItems) as React.CSSProperties['alignItems'],
    justifyContent: pickFlexValue(justifyContent) as React.CSSProperties['justifyContent'],
    flexWrap: pickFlexValue(wrap) as React.CSSProperties['flexWrap'],
    gap: resolveGap(gap),
    ...style,
  };

  // The explicit `display` on Box's resolver wins over our default. If the
  // consumer passes `display={...}` on Flex, that gets stripped by Box's
  // destructure and we emit our default; if they want both, they pass via
  // `style`.
  const display = inline ? 'inline-flex' : 'flex';

  // Composing through Strapi `<Box>` (the resolver shell). Box translates the
  // remaining margin/padding/color/etc. via MantineBox.
  // @ts-expect-error — `rest` keeps Strapi's wide Box prop surface; Box's
  // typed entry is intentionally narrower at this composition seam.
  return <Box ref={ref} display={display} style={flexStyle} data-strapi-flex="" {...rest} />;
});

MantineFlex.displayName = 'MantineFlex';

export { MantineFlex };
export type { FlexProps, TransientFlexProps };
