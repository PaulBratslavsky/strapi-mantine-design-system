/**
 * Public Button entry point.
 *
 * The Button you import from `@strapi/design-system` is a thin shell:
 *
 *   1. It looks up the resolved implementation via `useDSComponent('Button', variant)`.
 *      Consumers can swap implementations per-variant or per-subtree via `<DSProvider>`
 *      (override surface 6 — see principles.md).
 *   2. The shipped default is `MantineButton` (registered below).
 *   3. The legacy styled-components implementation lives in `./legacy/LegacyButton` and
 *      can be opted into via the resolver for one-line rollback.
 *
 * Type-level: this file also augments the resolver's `DSComponentRegistry` so
 * TypeScript knows `Button` is a registered name and `DSButtonVariants` is the
 * append-only variant set.
 */
import * as React from 'react';

import { registerDSComponent, useDSComponent, DEFAULT as RESOLVER_DEFAULT } from '../../resolver';
import { forwardRef } from '../../utilities/forwardRef';

import { type ButtonVariant } from './constants';
import { MantineButton, type ButtonProps } from './MantineButton';

/* -------------------------------------------------------------------------- */
/* Registry augmentation                                                      */
/* -------------------------------------------------------------------------- */

declare module '../../resolver/types' {
  interface DSComponentRegistry {
    Button: {
      props: ButtonProps;
      variants: DSButtonVariants;
    };
  }
  /**
   * Append-only variant set for `Button`. Consumers may extend via
   * declaration merging:
   *
   *   declare module '@strapi/design-system' {
   *     interface DSButtonVariants { critical: true }
   *   }
   *
   * The shipped variants below are the ones Strapi has used historically;
   * none of them ever gets removed.
   */
  interface DSButtonVariants {
    default: true;
    secondary: true;
    tertiary: true;
    danger: true;
    success: true;
    ghost: true;
    'success-light': true;
    'danger-light': true;
  }
}

/* -------------------------------------------------------------------------- */
/* Register the shipped default                                               */
/* -------------------------------------------------------------------------- */

// React.forwardRef gives us a ComponentType-compatible value; the cast brings
// it into shape for the resolver registry which expects a plain
// ComponentType<ButtonProps>.
registerDSComponent('Button', {
  default: MantineButton as unknown as React.ComponentType<ButtonProps>,
});

/* -------------------------------------------------------------------------- */
/* Public shell                                                               */
/* -------------------------------------------------------------------------- */

const ButtonShell = forwardRef<HTMLElement, ButtonProps>((props, ref) => {
  // Resolve per-render so DSProvider overrides take effect immediately.
  // `Resolved` is typed as `ComponentType<ButtonProps>` which doesn't model
  // ref in its props — using `React.createElement` here bypasses the JSX
  // type-check while preserving runtime ref forwarding.
  const Resolved = useDSComponent('Button', props.variant ?? RESOLVER_DEFAULT);
  return React.createElement(Resolved, { ...props, ref } as ButtonProps & {
    ref: React.Ref<HTMLButtonElement>;
  });
});

(ButtonShell as { displayName?: string }).displayName = 'Button';

/**
 * Polymorphic callable signature — kept for backwards-compatible imports.
 * The runtime is a non-polymorphic forwardRef; the cast below promotes it to
 * a polymorphic-callable type so `<Button<typeof X>>` syntax keeps type-
 * checking in LinkButton, SimpleMenu, IconButton.
 */
type ButtonComponent = <C extends React.ElementType = 'button'>(
  props: ButtonProps<C> & React.RefAttributes<HTMLElement>,
) => React.ReactElement | null;

const Button = ButtonShell as unknown as ButtonComponent;

export { Button };
export type { ButtonComponent, ButtonProps, ButtonVariant };
