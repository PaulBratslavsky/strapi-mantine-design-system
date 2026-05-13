/**
 * MantineTypography — Mantine-backed implementation of Strapi's <Typography>.
 *
 * Composes through Strapi `<Box>` (which routes to MantineBox), so all 60+
 * Box-inherited style props (margin, padding, fontSize override, etc.)
 * translate via the shared `translateBoxProps` helper without duplication.
 *
 * Typography-specific concerns:
 *   - `variant`  → emitted as `data-strapi-typography-variant=<name>` and
 *     styled via a per-variant CSS rule in `theming/componentPolish.css`
 *     (font-size + line-height + font-weight + media queries — drop-in for
 *     what the legacy styled-components Typography emitted).
 *   - `textColor` → mapped to Box's `color` prop (token resolution shared
 *     across the DS).
 *   - `textDecoration` → emitted as inline style (Mantine Box has no slot
 *     for it; legacy used styled-components for this too).
 *   - `ellipsis` → emits `data-strapi-typography-ellipsis` hook; CSS rule
 *     applies the legacy `display: block; white-space: nowrap; overflow:
 *     hidden; text-overflow: ellipsis` block.
 *
 * Why CSS rules instead of dispatching to Mantine's `<Title>` / `<Text>`:
 * Mantine's typography components apply their own font-weight/line-height
 * defaults that don't match Strapi's per-variant pixel values. Dispatching
 * would push us into a translation-table-with-overrides which inevitably
 * leaks (e.g. Mantine `<Title order={1}>` ships its own h1 reset that fights
 * with Strapi's exact 2.8rem/3.2rem responsive pair). A data-attribute + CSS
 * rule preserves the legacy emission byte-for-byte and keeps the cascade
 * compatible with consumer styled(Typography) wrappers.
 *
 * Default tag is 'span' (matches legacy). Consumers pass `tag` for headings.
 */
import * as React from 'react';

import { Box } from '../Box';

import type { TypographyProps, TransientTypographyProps } from './legacy/LegacyTypography';

type MantineTypographyProps = TypographyProps & {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

const MantineTypography = React.forwardRef<HTMLElement, MantineTypographyProps>((props, ref) => {
  const {
    variant = 'omega',
    textColor,
    textDecoration,
    ellipsis,
    style,
    tag,
    ...rest
  } = props as MantineTypographyProps & TransientTypographyProps;

  // Pull textDecoration into inline style; Mantine Box has no slot for it.
  // (legacy emitted it via styled-components handleResponsiveValues, which
  // collapsed to inline CSS in the generated class.)
  const inlineStyle: React.CSSProperties = { ...style };
  if (textDecoration != null) {
    if (typeof textDecoration === 'object' && 'initial' in textDecoration) {
      inlineStyle.textDecoration = (textDecoration as { initial?: string })
        .initial as React.CSSProperties['textDecoration'];
    } else {
      inlineStyle.textDecoration = textDecoration as React.CSSProperties['textDecoration'];
    }
  }

  // textColor maps onto Box's `color` prop (string-token resolution shared).
  // If consumer didn't pass textColor we default to 'currentcolor' so headings
  // inherit from their context — matches legacy behavior.
  const colorProp = textColor ?? 'currentcolor';

  return (
    <Box
      ref={ref}
      tag={tag ?? 'span'}
      color={colorProp}
      style={inlineStyle}
      data-strapi-typography=""
      data-strapi-typography-variant={variant}
      data-strapi-typography-ellipsis={ellipsis ? '' : undefined}
      {...(rest as Record<string, unknown>)}
    />
  );
});

MantineTypography.displayName = 'MantineTypography';

export { MantineTypography };
export type { TypographyProps, TransientTypographyProps };
