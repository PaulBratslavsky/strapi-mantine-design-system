/**
 * Public Typography entry — resolver-aware shell.
 *
 *   1. Looks up the resolved implementation via `useDSComponent('Typography')`.
 *      Consumers can swap implementations per-subtree via <DSProvider>.
 *   2. The shipped default is `MantineTypography` (registered below).
 *   3. The legacy styled-components implementation lives in
 *      `./legacy/LegacyTypography` and can be opted into via the resolver.
 *
 * Polymorphic forwardRef shape matches the legacy Typography so existing
 * `styled<TypographyComponent<X>>(Typography)` wrappers across the DS keep
 * compiling unchanged.
 */
import * as React from 'react';

import { registerDSComponent, useDSComponent, DEFAULT as RESOLVER_DEFAULT } from '../../resolver';
import { PolymorphicComponentPropsWithRef, PolymorphicRef } from '../../types';
import { forwardRef } from '../../utilities/forwardRef';

import { MantineTypography, type TypographyProps, type TransientTypographyProps } from './MantineTypography';

/* -------------------------------------------------------------------------- */
/* Registry augmentation                                                      */
/* -------------------------------------------------------------------------- */

declare module '../../resolver/types' {
  interface DSComponentRegistry {
    Typography: { props: TypographyProps; variants: DSTypographyVariants };
  }
  /**
   * Append-only variant set for `Typography`. Matches the legacy
   * TEXT_VARIANTS exactly. Consumers can extend via declaration merging.
   */
  interface DSTypographyVariants {
    alpha: true;
    beta: true;
    delta: true;
    epsilon: true;
    omega: true;
    pi: true;
    sigma: true;
  }
}

/* -------------------------------------------------------------------------- */
/* Register the shipped default                                               */
/* -------------------------------------------------------------------------- */

registerDSComponent('Typography', {
  default: MantineTypography as unknown as React.ComponentType<TypographyProps>,
});

/* -------------------------------------------------------------------------- */
/* Public shell                                                               */
/* -------------------------------------------------------------------------- */

const TypographyShell = forwardRef(
  <C extends React.ElementType = 'span'>(props: TypographyProps<C>, ref: PolymorphicRef<C>) => {
    const Resolved = useDSComponent('Typography', RESOLVER_DEFAULT);
    return React.createElement(Resolved, { ...props, ref } as unknown as TypographyProps & {
      ref: React.Ref<HTMLElement>;
    });
  },
);

/**
 * Legacy `TypographyComponent<C>` shape — preserved exactly so
 * `styled<TypographyComponent<X>>(Typography)` wrappers (CellTypography,
 * NavLinkBadgeCounter, etc.) and consumers that thread an arbitrary `tag`
 * (e.g. Alert's `titleAs`) keep compiling. The polymorphic generic flows
 * through `PolymorphicComponentPropsWithRef` — matching the legacy file
 * verbatim — so any `tag={X}` is accepted regardless of X.
 */
type TypographyComponent<C extends React.ElementType = 'span'> = <T extends React.ElementType = C>(
  props: PolymorphicComponentPropsWithRef<T, TypographyProps<T>>,
) => JSX.Element;

const Typography = TypographyShell as unknown as TypographyComponent;

export { Typography };
export type { TypographyComponent, TypographyProps, TransientTypographyProps };
