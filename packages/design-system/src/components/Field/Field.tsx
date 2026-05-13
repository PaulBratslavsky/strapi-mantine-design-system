/**
 * Public Field entry — resolver-aware shells over MantineField.
 *
 * Each compound part (Root, Label, Input, Hint, Error, Action) is registered
 * with the resolver under its dotted name ('Field.Root', 'Field.Label', etc.)
 * so consumers can override individual parts per-subtree without affecting
 * other parts. Example:
 *
 *   <DSProvider components={{ 'Field.Input': { default: MyInput } }}>
 *     {/ * every Field.Input in this subtree uses MyInput * /}
 *     {/ * Field.Label, Field.Error stay as shipped * /}
 *   </DSProvider>
 *
 * The legacy styled-components implementation lives in ./legacy/LegacyField
 * for emergency rollback.
 */
import * as React from 'react';

import { registerDSComponent, useDSComponent, DEFAULT as RESOLVER_DEFAULT } from '../../resolver';

import * as MantineField from './MantineField';

import type { Props as RootProps, LabelProps, InputProps, ActionProps, FieldContextValue } from './MantineField';

/* -------------------------------------------------------------------------- */
/* Registry augmentation                                                      */
/* -------------------------------------------------------------------------- */

declare module '../../resolver/types' {
  interface DSComponentRegistry {
    'Field.Root': { props: RootProps; variants: FieldRootVariants };
    'Field.Label': { props: LabelProps; variants: FieldLabelVariants };
    'Field.Input': { props: InputProps; variants: FieldInputVariants };
    'Field.Hint': { props: Record<string, never>; variants: FieldHintVariants };
    'Field.Error': { props: Record<string, never>; variants: FieldErrorVariants };
    'Field.Action': { props: ActionProps; variants: FieldActionVariants };
  }
  // Append-only variant interfaces — empty by default; consumers may extend
  // via declaration merging.
  interface FieldRootVariants {}
  interface FieldLabelVariants {}
  interface FieldInputVariants {}
  interface FieldHintVariants {}
  interface FieldErrorVariants {}
  interface FieldActionVariants {}
}

/* -------------------------------------------------------------------------- */
/* Register shipped defaults                                                  */
/* -------------------------------------------------------------------------- */

registerDSComponent('Field.Root', {
  default: MantineField.Root as unknown as React.ComponentType<RootProps>,
});
registerDSComponent('Field.Label', {
  default: MantineField.Label as unknown as React.ComponentType<LabelProps>,
});
registerDSComponent('Field.Input', {
  default: MantineField.Input as unknown as React.ComponentType<InputProps>,
});
registerDSComponent('Field.Hint', {
  default: MantineField.Hint as unknown as React.ComponentType<Record<string, never>>,
});
registerDSComponent('Field.Error', {
  default: MantineField.Error as unknown as React.ComponentType<Record<string, never>>,
});
registerDSComponent('Field.Action', {
  default: MantineField.Action as unknown as React.ComponentType<ActionProps>,
});

/* -------------------------------------------------------------------------- */
/* Resolver shells                                                            */
/* -------------------------------------------------------------------------- */

const Root = React.forwardRef<HTMLDivElement, RootProps>((props, ref) => {
  const Resolved = useDSComponent('Field.Root', RESOLVER_DEFAULT);
  return React.createElement(Resolved, { ...props, ref } as RootProps & {
    ref: React.Ref<HTMLDivElement>;
  });
});
Root.displayName = 'Field.Root';

const Label = React.forwardRef<HTMLLabelElement, LabelProps>((props, ref) => {
  const Resolved = useDSComponent('Field.Label', RESOLVER_DEFAULT);
  return React.createElement(Resolved, { ...props, ref } as LabelProps & {
    ref: React.Ref<HTMLLabelElement>;
  });
});
Label.displayName = 'Field.Label';

const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const Resolved = useDSComponent('Field.Input', RESOLVER_DEFAULT);
  return React.createElement(Resolved, { ...props, ref } as InputProps & {
    ref: React.Ref<HTMLInputElement>;
  });
});
Input.displayName = 'Field.Input';

const Hint: React.FC = () => {
  const Resolved = useDSComponent('Field.Hint', RESOLVER_DEFAULT);
  return <Resolved />;
};
Hint.displayName = 'Field.Hint';

// eslint-disable-next-line @typescript-eslint/naming-convention
const Error_: React.FC = () => {
  const Resolved = useDSComponent('Field.Error', RESOLVER_DEFAULT);
  return <Resolved />;
};
Error_.displayName = 'Field.Error';
// Keep `Error` as the public name (the legacy export was `Error`).
const Error = Error_;

const Action = React.forwardRef<HTMLButtonElement, ActionProps>((props, ref) => {
  const Resolved = useDSComponent('Field.Action', RESOLVER_DEFAULT);
  return React.createElement(Resolved, { ...props, ref } as ActionProps & {
    ref: React.Ref<HTMLButtonElement>;
  });
});
Action.displayName = 'Field.Action';

/* -------------------------------------------------------------------------- */
/* useField hook — re-exported directly from MantineField for backwards-     */
/* compat with consumers reaching into the Field context.                    */
/* -------------------------------------------------------------------------- */

export const useField = MantineField.useField;

/* -------------------------------------------------------------------------- */
/* Public exports                                                              */
/* -------------------------------------------------------------------------- */

type Props = RootProps;

export { Root, Label, Input, Hint, Error, Action };
export type { Props, RootProps, LabelProps, InputProps, ActionProps, FieldContextValue };
