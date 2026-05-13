/**
 * MantineFlex — Mantine-backed implementation of Strapi's <Flex>.
 *
 * Routes through Mantine's native `<Flex>` (which extends Mantine `<Box>`),
 * so:
 *   - Flex-specific Strapi props (alignItems, justifyContent, direction,
 *     wrap, gap) pass through to Mantine's `align`/`justify`/`direction`/
 *     `wrap`/`gap` StyleProps — which support the responsive
 *     `{ initial, small, medium, large }` object form natively because the
 *     theme augmentation in `theming/mantine-augmentation.ts` registered
 *     those keys as Mantine breakpoints. Mantine emits real `@media` queries
 *     for them.
 *   - Box-inherited Strapi props (margin, padding, color, etc.) are translated
 *     via the shared `translateBoxProps` helper exported from
 *     `primitives/Box/translate.ts`.
 *
 * Default behavior matches the legacy Strapi <Flex>:
 *   display: flex; align-items: center; flex-direction: row.
 * That's load-bearing — many consumers rely on implicit centering.
 *
 * The Strapi-experimental admin uses `direction={{ initial: 'column',
 * large: 'row' }}` for its top-level layout — that's the regression that
 * triggered routing through Mantine `<Flex>` instead of inline style.
 */
import * as React from 'react';

import { Flex as MantineFlexBase } from '@mantine/core';

import { resolveSpacing, translateBoxProps } from '../Box/translate';

import type { FlexProps, TransientFlexProps } from './legacy/LegacyFlex';

/* -------------------------------------------------------------------------- */
/* Resolvers — Flex-specific                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Map Strapi's gap (a number indexing `theme.spaces` OR a CSS string OR a
 * responsive object) onto Mantine's `gap` shape: a bare string or a
 * `{ initial?, small?, medium?, large? }` object.
 */
function translateGap(gap: unknown): string | Record<string, string | undefined> | undefined {
  if (gap == null) return undefined;
  if (typeof gap === 'number') return resolveSpacing(gap);
  if (typeof gap === 'object' && gap !== null && !Array.isArray(gap)) {
    const out: Record<string, string | undefined> = {};
    for (const [bp, v] of Object.entries(gap)) {
      out[bp] = resolveSpacing(v);
    }
    return out;
  }
  return String(gap);
}

/**
 * Pass-through for direction/align/justify/wrap. The bare value or the full
 * responsive object flows straight to Mantine. Typed wide (`unknown`) on
 * input because csstype's strict `FlexDirection | AlignItems | …` unions
 * trip TS inference when threaded through a generic.
 */
function passThrough(v: unknown): unknown {
  return v ?? undefined;
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

// Mantine's <Flex> has a strict polymorphic type. Strapi's `tag` accepts any
// ElementType, so we widen the JSX type. Runtime behavior is unchanged.
const MantineFlexPermissive = MantineFlexBase as unknown as React.ComponentType<
  Record<string, unknown> & { ref?: React.Ref<HTMLElement> }
>;

type MantineFlexComponentProps = FlexProps & {
  tag?: React.ElementType;
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
};

const MantineFlex = React.forwardRef<HTMLElement, MantineFlexComponentProps>((props, ref) => {
  const { alignItems, justifyContent, direction, wrap, gap, inline, tag, children, ...rawBoxProps } =
    props as MantineFlexComponentProps & TransientFlexProps;

  // Translate Box-inherited Strapi props (margin/padding/color/etc.) via the
  // shared helper. `rest` contains HTML attrs that need to pass through to
  // the DOM.
  const { mantineProps, inlineStyle, rest } = translateBoxProps(rawBoxProps);

  // Flex-specific Strapi → Mantine name mapping. Responsive shapes are
  // preserved so Mantine emits real media queries.
  //
  // CRITICAL: do NOT default direction/alignItems here. Mantine writes bare
  // values to the element's inline `style` attribute, which beats every
  // styled(Flex)-extending wrapper's class-level override (e.g.
  // `Column = styled(Flex)\`flex-direction: column\``, `MenuDetails`'s
  // breakpoint-scoped `flex-direction: column`). The Strapi default of
  // `align-items: center` lives in `theming/componentPolish.css` as a
  // `[data-strapi-flex]` rule — same specificity as a styled() class, source
  // order then determines the winner, matching the legacy cascade behavior.
  // `flex-direction: row` is the CSS default, so no rule needed there.
  const flexProps = {
    direction: direction !== undefined ? passThrough(direction) : undefined,
    align: alignItems !== undefined ? passThrough(alignItems) : undefined,
    justify: justifyContent !== undefined ? passThrough(justifyContent) : undefined,
    wrap: wrap !== undefined ? passThrough(wrap) : undefined,
    gap: gap !== undefined ? translateGap(gap) : undefined,
  };

  // CRITICAL: do NOT default `display: flex` to inline style.
  // Mantine's `<Flex>` already sets `display: flex` via its `mantine-Flex-root`
  // class (`@mantine/core/styles.css`). Setting it inline as well beats every
  // styled(Flex) wrapper that overrides display via class (e.g.
  // `SideNavContainer = styled(Flex)\`display: none / display: block\`` in
  // `Layouts/Layout.tsx`), turning what should be a block/none container into
  // a flex container — which then cascades through `[data-strapi-flex] {
  // align-items: center }` and visually centers the child where it shouldn't.
  //
  // Only emit `inline-flex` inline when the consumer explicitly opts in via
  // the `inline` prop — that case genuinely needs to override Mantine's class
  // default and inline is the right cascade level for that.
  if (inline) {
    inlineStyle.display = 'inline-flex';
  }

  return (
    <MantineFlexPermissive
      ref={ref}
      component={tag as React.ElementType | undefined}
      style={inlineStyle}
      data-strapi-flex=""
      data-strapi-box=""
      {...mantineProps}
      {...flexProps}
      {...rest}
    >
      {children}
    </MantineFlexPermissive>
  );
});

MantineFlex.displayName = 'MantineFlex';

export { MantineFlex };
export type { FlexProps, TransientFlexProps };
