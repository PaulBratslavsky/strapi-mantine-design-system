/**
 * Public Tooltip entry — resolver-aware shell.
 *
 *   1. Looks up the resolved implementation via `useDSComponent('Tooltip')`.
 *      Consumers can swap implementations per-subtree via <DSProvider>.
 *   2. The shipped default is `MantineTooltip` (registered below).
 *   3. The legacy Radix-based implementation lives in
 *      `./legacy/LegacyTooltip` and can be opted into via the resolver.
 */
import * as React from 'react';

import { registerDSComponent, useDSComponent, DEFAULT as RESOLVER_DEFAULT } from '../../resolver';

import { MantineTooltip, type TooltipProps } from './MantineTooltip';

/* -------------------------------------------------------------------------- */
/* Registry augmentation                                                      */
/* -------------------------------------------------------------------------- */

declare module '../../resolver/types' {
  interface DSComponentRegistry {
    Tooltip: { props: TooltipProps; variants: DSTooltipVariants };
  }
  interface DSTooltipVariants {
    default: true;
  }
}

/* -------------------------------------------------------------------------- */
/* Register the shipped default                                               */
/* -------------------------------------------------------------------------- */

registerDSComponent('Tooltip', {
  default: MantineTooltip as unknown as React.ComponentType<TooltipProps>,
});

/* -------------------------------------------------------------------------- */
/* Public shell                                                               */
/* -------------------------------------------------------------------------- */

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>((props, ref) => {
  const Resolved = useDSComponent('Tooltip', RESOLVER_DEFAULT);
  return React.createElement(Resolved, { ...props, ref } as TooltipProps & {
    ref: React.Ref<HTMLDivElement>;
  });
});

Tooltip.displayName = 'Tooltip';

export { Tooltip };
export type { TooltipProps };
