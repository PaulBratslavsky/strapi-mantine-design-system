/**
 * Divider — thin translation layer over Mantine's <Divider>.
 *
 * Strapi's legacy Divider was a styled <Box height={1px}>. Mantine's
 * <Divider> is the native equivalent — handles orientation, color, label,
 * and theming via Mantine's tokens.
 *
 * Strapi prop API preserved:
 *   - background (token name like "neutral150") → Mantine `color`
 *   - other Box-inherited props pass through Mantine's style-props surface
 *
 * Default orientation is horizontal (matches legacy).
 */
import * as React from 'react';

import { Divider as MantineDivider, type DividerProps as MantineDividerProps } from '@mantine/core';

import type { BoxProps } from '../../primitives/Box';
import { resolveColor } from '../../primitives/Box/translate';

type DividerElement = HTMLHRElement;

interface DividerProps extends Omit<BoxProps<'div'>, 'tag'> {}

const Divider = React.forwardRef<DividerElement, DividerProps>((props, forwardedRef) => {
  const { background, ...rest } = props as { background?: string } & Record<string, unknown>;

  return (
    <MantineDivider
      ref={forwardedRef as React.Ref<HTMLHRElement>}
      orientation="horizontal"
      color={typeof background === 'string' ? (resolveColor(background) as MantineDividerProps['color']) : undefined}
      {...(rest as Record<string, unknown>)}
    />
  );
});

Divider.displayName = 'Divider';

export { Divider };
export type { DividerElement, DividerProps };
