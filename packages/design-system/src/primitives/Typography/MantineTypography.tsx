/**
 * MantineTypography — translation layer over Mantine's <Text> and <Title>.
 *
 * Each Strapi `variant` dispatches to the appropriate Mantine native:
 *   alpha   → <Title order={1}>
 *   beta    → <Title order={2}>
 *   delta   → <Title order={3}>
 *   epsilon → <Title order={4}>
 *   omega   → <Text>                 (default body)
 *   pi      → <Text size="xs" fw={700} tt="uppercase">
 *   sigma   → <Text size="xs">
 *
 * Strapi's exact legacy pixel sizes are NOT recreated here — Mantine's
 * defaults win. If a specific consumer install needs to match legacy
 * pixels exactly, configure `headings` and `fontSizes` in
 * `theming/mantineTheme.ts` so every Mantine consumer picks up the
 * change in one place. We deliberately do NOT do per-variant CSS
 * overrides here (see project-true-mantine-intent: "if Mantine ships
 * it, configure Mantine, don't shadow with custom CSS").
 *
 * Strapi prop API preserved:
 *   - All Box-inherited props (margin, padding, w, h, etc.) translate
 *     through the shared translateBoxProps and flow onto Mantine Text/
 *     Title (which extend Mantine's Box style-prop surface).
 *   - textColor      → Mantine `c` (takes precedence over inherited Box color)
 *   - textDecoration → Mantine `td`
 *   - ellipsis       → Mantine `truncate="end"`
 *   - tag            → Mantine `component`
 *
 * Strapi props with no Mantine equivalent fall through to inline style
 * via translateBoxProps (cursor, pointerEvents, transition, etc.).
 */
import * as React from 'react';

import { Text, Title, type TextProps, type TitleProps } from '@mantine/core';

import { resolveColor, translateBoxProps } from '../Box/translate';

import type { TypographyProps, TransientTypographyProps } from './legacy/LegacyTypography';

type MantineTypographyProps = TypographyProps & {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

const TITLE_ORDER: Partial<Record<string, 1 | 2 | 3 | 4 | 5 | 6>> = {
  alpha: 1,
  beta: 2,
  delta: 3,
  epsilon: 4,
};

const TEXT_VARIANT: Partial<Record<string, { size?: string; fw?: number | string; tt?: string }>> = {
  omega: {}, // Mantine default body
  pi: { size: 'xs', fw: 700, tt: 'uppercase' },
  sigma: { size: 'xs' },
};

const MantineTypography = React.forwardRef<HTMLElement, MantineTypographyProps>((props, ref) => {
  const {
    variant = 'omega',
    textColor,
    textDecoration,
    ellipsis,
    tag,
    ...rest
  } = props as MantineTypographyProps & TransientTypographyProps;

  // Run all Box-inherited props through the shared translation. Returns
  // Mantine-named style props (m, p, c, bg…), inline-style fallbacks for
  // Strapi-only props (cursor, pointerEvents…), and remaining unknowns.
  const { mantineProps, inlineStyle, rest: boxRest } = translateBoxProps(rest as Record<string, unknown>);

  // Typography-specific overrides — textColor takes precedence over any
  // Box-inherited color resolution.
  const typographyOverrides: Record<string, unknown> = {};
  if (typeof textColor === 'string') {
    typographyOverrides.c = resolveColor(textColor);
  }
  if (typeof textDecoration === 'string') {
    typographyOverrides.td = textDecoration;
  }

  const component = tag as React.ElementType | undefined;
  const order = TITLE_ORDER[variant];

  if (order != null) {
    return (
      <Title
        ref={ref as React.Ref<HTMLHeadingElement>}
        order={order}
        component={component}
        {...(mantineProps as Partial<TitleProps>)}
        {...(typographyOverrides as Partial<TitleProps>)}
        style={inlineStyle}
        {...(boxRest as Record<string, unknown>)}
      />
    );
  }

  const textConfig = TEXT_VARIANT[variant] ?? {};

  return (
    <Text
      ref={ref as React.Ref<HTMLParagraphElement>}
      size={textConfig.size}
      fw={textConfig.fw}
      tt={textConfig.tt as TextProps['tt']}
      truncate={ellipsis ? 'end' : undefined}
      component={component}
      {...(mantineProps as Partial<TextProps>)}
      {...(typographyOverrides as Partial<TextProps>)}
      style={inlineStyle}
      {...(boxRest as Record<string, unknown>)}
    />
  );
});

MantineTypography.displayName = 'MantineTypography';

export { MantineTypography };
export type { TypographyProps, TransientTypographyProps };
