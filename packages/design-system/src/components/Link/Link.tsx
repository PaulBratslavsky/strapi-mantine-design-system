/**
 * Public Link entry — resolver-aware shell.
 *
 *   1. Looks up the resolved implementation via `useDSComponent('Link')`.
 *      Consumers can swap implementations per-subtree via <DSProvider>.
 *   2. The shipped default is `MantineLink` (registered below).
 *   3. The legacy styled-components implementation lives in `./legacy/LegacyLink`
 *      and can be opted into via the resolver for one-line rollback.
 *
 * Type-level: this file augments the resolver's `DSComponentRegistry` so
 * TypeScript knows `Link` is a registered name and `DSLinkVariants` is the
 * append-only variant set.
 *
 * The shell uses the custom polymorphic `forwardRef` (utilities/forwardRef.ts)
 * so its public type matches what the legacy Link had — that's what lets
 * SimpleMenu's `styled(Link)<{ $variant }>` keep its prop math intact.
 */
import * as React from 'react';

import { registerDSComponent, useDSComponent, DEFAULT as RESOLVER_DEFAULT } from '../../resolver';
import { PolymorphicRef } from '../../types';
import { forwardRef } from '../../utilities/forwardRef';

import { MantineLink, type LinkProps } from './MantineLink';

/* -------------------------------------------------------------------------- */
/* Registry augmentation                                                      */
/* -------------------------------------------------------------------------- */

declare module '../../resolver/types' {
  interface DSComponentRegistry {
    Link: { props: LinkProps; variants: DSLinkVariants };
  }
  /**
   * Append-only variant set for `Link`. Consumers can extend via declaration
   * merging. Link has no built-in variants today — `default` is the only
   * shipped key.
   */
  interface DSLinkVariants {
    default: true;
  }
}

/* -------------------------------------------------------------------------- */
/* Register the shipped default                                               */
/* -------------------------------------------------------------------------- */

registerDSComponent('Link', {
  default: MantineLink as unknown as React.ComponentType<LinkProps>,
});

/* -------------------------------------------------------------------------- */
/* Public shell                                                               */
/* -------------------------------------------------------------------------- */

const Link = forwardRef(<C extends React.ElementType = 'a'>(props: LinkProps<C>, ref: PolymorphicRef<C>) => {
  const Resolved = useDSComponent('Link', RESOLVER_DEFAULT);
  // The resolver stores `Link` with its non-polymorphic prop shape (default
  // C='a'). Polymorphism is enforced at the public type but collapsed for
  // the inner createElement, which Mantine's `component` prop resolves at
  // runtime.
  return React.createElement(Resolved, { ...props, ref } as unknown as LinkProps & {
    ref: React.Ref<HTMLAnchorElement>;
  });
});

type LinkComponent<C extends React.ElementType = 'a'> = (props: LinkProps<C>) => React.ReactNode;

export { Link };
export type { LinkComponent, LinkProps };
