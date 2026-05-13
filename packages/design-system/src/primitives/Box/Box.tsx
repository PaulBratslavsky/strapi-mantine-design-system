/**
 * Public Box entry — resolver-aware shell.
 *
 *   1. Looks up the resolved implementation via `useDSComponent('Box')`.
 *      Consumers can swap implementations per-subtree via <DSProvider>.
 *   2. The shipped default is `MantineBox` (registered below).
 *   3. The legacy styled-components implementation lives in `./legacy/LegacyBox`
 *      and can be opted into via the resolver for one-line rollback.
 *
 * Type-level: augments the resolver's `DSComponentRegistry` with `Box`.
 *
 * The shell uses the custom polymorphic `forwardRef` (utilities/forwardRef.ts)
 * so the public type matches what the legacy Box exported — letting
 * `styled(Box)<...>` wrappers across the DS (Typography, Flex, BaseLink,
 * SubNav, Card, etc.) keep their prop math identical.
 */
import * as React from 'react';

import { registerDSComponent, useDSComponent, DEFAULT as RESOLVER_DEFAULT } from '../../resolver';
import { PolymorphicRef } from '../../types';
import { forwardRef } from '../../utilities/forwardRef';

import { MantineBox } from './MantineBox';

import type { BoxProps, TransientBoxProps } from './legacy/LegacyBox';

/* -------------------------------------------------------------------------- */
/* Registry augmentation                                                      */
/* -------------------------------------------------------------------------- */

declare module '../../resolver/types' {
  interface DSComponentRegistry {
    Box: { props: BoxProps; variants: DSBoxVariants };
  }
  /**
   * Box has no semantic variants today — every per-shape override is just
   * styling. `default` is the only shipped key. Append-only via declaration
   * merging if a future shape needs variant tagging.
   */
  interface DSBoxVariants {
    default: true;
  }
}

/* -------------------------------------------------------------------------- */
/* Register the shipped default                                               */
/* -------------------------------------------------------------------------- */

registerDSComponent('Box', {
  default: MantineBox as unknown as React.ComponentType<BoxProps>,
});

/* -------------------------------------------------------------------------- */
/* Public shell                                                               */
/* -------------------------------------------------------------------------- */

const BoxShell = forwardRef(<C extends React.ElementType = 'div'>(props: BoxProps<C>, ref: PolymorphicRef<C>) => {
  const Resolved = useDSComponent('Box', RESOLVER_DEFAULT);
  // The resolver stores `Box` with its non-polymorphic prop shape (default
  // C='div'). Polymorphism is enforced at the public type but collapsed for
  // the inner createElement, which Mantine's `component` prop resolves at
  // runtime.
  return React.createElement(Resolved, { ...props, ref } as unknown as BoxProps & {
    ref: React.Ref<HTMLElement>;
  });
});

/**
 * The legacy `BoxComponent<C>` shape — kept as the public type so every
 * `styled<BoxComponent<X>>(Box)` wrapper across the DS (BaseLink, Card,
 * Carousel, Divider, etc.) keeps compiling unchanged. The runtime is the
 * forwardRef shell above; this cast is identical in spirit to what
 * `LegacyBox.tsx` did with `... as BoxComponent`.
 */
type BoxComponent<C extends React.ElementType = 'div'> = <T extends React.ElementType = C>(
  props: BoxProps<T>,
) => JSX.Element;

const Box = BoxShell as unknown as BoxComponent;

export { Box };
export type { BoxComponent, BoxProps, TransientBoxProps };
