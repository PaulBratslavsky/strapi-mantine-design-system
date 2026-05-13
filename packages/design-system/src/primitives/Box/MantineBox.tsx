/**
 * MantineBox — Mantine-backed implementation of Strapi's <Box>.
 *
 * Box is the structural primitive every layout component is built on (Flex,
 * Typography, BaseLink, SubNav, Card, etc.). This wrapper translates Strapi's
 * 60+ style props onto Mantine's `<Box>` while preserving the exact public
 * API consumers depend on.
 *
 * Translation lives in `./translate.ts` so MantineFlex (and future
 * Mantine-backed primitives that inherit Box's prop surface) can share it.
 *
 * See `translate.ts` for the full mapping table.
 *
 * The `BoxProps` and `TransientBoxProps` types are re-exported from
 * `./legacy/LegacyBox` — single source of truth for the public surface so
 * every consumer's prop math stays untouched.
 */
import * as React from 'react';

import { Box as MantineBoxBase } from '@mantine/core';

import { translateBoxProps } from './translate';

import type { BoxProps, TransientBoxProps } from './legacy/LegacyBox';

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
  const { tag, children, ...rawProps } = props;
  const { mantineProps, inlineStyle, rest } = translateBoxProps(rawProps);

  return (
    <MantineBoxPermissive
      ref={ref}
      component={tag as React.ElementType | undefined}
      style={inlineStyle}
      data-strapi-box=""
      {...mantineProps}
      {...rest}
    >
      {children}
    </MantineBoxPermissive>
  );
});

MantineBox.displayName = 'MantineBox';

export { MantineBox };
export type { BoxProps, TransientBoxProps };
