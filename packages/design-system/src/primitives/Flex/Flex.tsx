/**
 * Public Flex entry — resolver-aware shell.
 *
 *   1. Looks up the resolved implementation via `useDSComponent('Flex')`.
 *      Consumers can swap implementations per-subtree via <DSProvider>.
 *   2. The shipped default is `MantineFlex` (registered below).
 *   3. The legacy styled-components implementation lives in `./legacy/LegacyFlex`
 *      and can be opted into via the resolver for one-line rollback.
 *
 * Polymorphic forwardRef shape matches the legacy Flex so existing
 * `styled<FlexComponent<X>>(Flex)` wrappers in the DS (SimpleMenu's
 * OptionButton, Sidebar, etc.) compile unchanged.
 */
import * as React from 'react';

import { registerDSComponent, useDSComponent, DEFAULT as RESOLVER_DEFAULT } from '../../resolver';
import { PolymorphicRef } from '../../types';
import { forwardRef } from '../../utilities/forwardRef';

import { MantineFlex, type FlexProps, type TransientFlexProps } from './MantineFlex';

/* -------------------------------------------------------------------------- */
/* Registry augmentation                                                      */
/* -------------------------------------------------------------------------- */

declare module '../../resolver/types' {
  interface DSComponentRegistry {
    Flex: { props: FlexProps; variants: DSFlexVariants };
  }
  /**
   * Flex has no semantic variants today — direction/inline are layout
   * controls, not variants. `default` is the only shipped key.
   */
  interface DSFlexVariants {
    default: true;
  }
}

/* -------------------------------------------------------------------------- */
/* Register the shipped default                                               */
/* -------------------------------------------------------------------------- */

registerDSComponent('Flex', {
  default: MantineFlex as unknown as React.ComponentType<FlexProps>,
});

/* -------------------------------------------------------------------------- */
/* Public shell                                                               */
/* -------------------------------------------------------------------------- */

const FlexShell = forwardRef(<C extends React.ElementType = 'div'>(props: FlexProps<C>, ref: PolymorphicRef<C>) => {
  const Resolved = useDSComponent('Flex', RESOLVER_DEFAULT);
  return React.createElement(Resolved, { ...props, ref } as unknown as FlexProps & {
    ref: React.Ref<HTMLElement>;
  });
});

/**
 * The legacy `FlexComponent<C>` shape — preserved so `styled<FlexComponent<X>>(Flex)`
 * wrappers across the DS keep compiling. Same pattern as Box's cast.
 */
type FlexComponent<C extends React.ElementType = 'div'> = <T extends React.ElementType = C>(
  props: FlexProps<T>,
) => JSX.Element;

const Flex = FlexShell as unknown as FlexComponent;

export { Flex };
export type { FlexComponent, FlexProps, TransientFlexProps };
