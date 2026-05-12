/**
 * MantineField — Mantine-backed compound Field implementation.
 *
 * Strapi's Field is a compound component:
 *   <Field.Root id error hint required>
 *     <Field.Label action={...}>...</Field.Label>
 *     <Field.Input size startAction endAction />
 *     <Field.Hint />
 *     <Field.Error />
 *   </Field.Root>
 *
 * Mantine's equivalent compound is the `Input` family (`Input.Wrapper`,
 * `Input.Label`, `Input`, `Input.Description`, `Input.Error`). Each Strapi
 * sub-component here wraps the corresponding Mantine primitive and reads
 * shared state (id, error, required, hint) from Strapi's own context.
 *
 * Why Strapi's context, not Mantine's Input.Wrapper context: preserves the
 * public `useField()` hook (existing consumers depend on its shape). Mantine
 * sub-components also accept all needed props directly, so we don't need
 * Input.Wrapper's context layer.
 *
 * Strapi prop API is preserved exactly — call sites unchanged.
 */
import * as React from 'react';

import { Input as MantineInput } from '@mantine/core';

import { createContext } from '../../helpers/context';
import { useComposedRefs } from '../../hooks/useComposeRefs';
import { useId } from '../../hooks/useId';
import { Flex, type FlexProps } from '../../primitives/Flex';
import { AccessibleIcon } from '../../utilities/AccessibleIcon';

/* -------------------------------------------------------------------------- */
/* Shared context (kept compatible with legacy useField consumers)            */
/* -------------------------------------------------------------------------- */

interface FieldContextValue {
  /** Error: string shows as message via <Field.Error/>; boolean toggles invalid state. */
  error?: string | boolean;
  hint?: React.ReactNode;
  id?: string;
  labelNode?: HTMLLabelElement;
  name?: string;
  required?: boolean;
  setLabelNode?: (node: HTMLLabelElement) => void;
}

const [FieldProvider, useField] = createContext<FieldContextValue>('Field', {});

/* -------------------------------------------------------------------------- */
/* Root                                                                       */
/* -------------------------------------------------------------------------- */

interface RootProps extends FlexProps, Omit<Partial<FieldContextValue>, 'labelNode' | 'setLabelNode'> {
  children: React.ReactNode;
}

const Root = React.forwardRef<HTMLDivElement, RootProps>(
  ({ children, name, error = false, hint, id, required = false, ...rest }, ref) => {
    const generatedId = useId(id);
    const [labelNode, setLabelNode] = React.useState<HTMLLabelElement>();

    return (
      <FieldProvider
        name={name}
        id={generatedId}
        error={error}
        hint={hint}
        required={required}
        labelNode={labelNode}
        setLabelNode={setLabelNode}
      >
        {/*
         * Render through Strapi's Flex primitive (legacy did the same) so
         * every FlexProps shorthand — flex, gap, padding, etc. — that
         * existing consumers pass keeps working. Defaults to column layout
         * matching the legacy.
         */}
        <Flex direction="column" alignItems="stretch" gap={1} ref={ref} data-strapi-field="" {...rest}>
          {children}
        </Flex>
      </FieldProvider>
    );
  },
);

Root.displayName = 'Field.Root';

/* -------------------------------------------------------------------------- */
/* Label                                                                      */
/* -------------------------------------------------------------------------- */

interface LabelProps extends Omit<React.LabelHTMLAttributes<HTMLLabelElement>, 'htmlFor'> {
  /** Optional adjacent action (e.g. help icon). Rendered next to the label. */
  action?: React.ReactNode;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ children, action, ...rest }, ref) => {
  const { id, required, setLabelNode } = useField('Label');
  const composedRefs = useComposedRefs(ref, setLabelNode);

  if (!children) return null;

  return (
    <span data-strapi-field-label-wrapper="" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <MantineInput.Label
        ref={composedRefs}
        htmlFor={id}
        id={`${id}-label`}
        required={required}
        data-strapi-field-label=""
        {...rest}
      >
        {children}
      </MantineInput.Label>
      {action && <span data-strapi-field-label-action="">{action}</span>}
    </span>
  );
});

Label.displayName = 'Field.Label';

/* -------------------------------------------------------------------------- */
/* Input                                                                      */
/* -------------------------------------------------------------------------- */

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  disabled?: boolean;
  /** Element rendered AFTER the input. Mantine calls this `rightSection`. */
  endAction?: React.ReactNode;
  /**
   * Manual error flag for cases where Field.Root is not the parent.
   */
  hasError?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  /** @default "M" */
  size?: 'S' | 'M';
  /** Element rendered BEFORE the input. Mantine calls this `leftSection`. */
  startAction?: React.ReactNode;
}

/**
 * Strapi size → Mantine size. Shifted one notch up: Strapi 'M' (the default)
 * renders at Mantine 'lg'. Aligns Inputs with Buttons (which also shifted)
 * for visually-consistent form controls.
 */
const SIZE_MAP: Record<Required<InputProps>['size'], 'md' | 'lg'> = {
  S: 'md',
  M: 'lg',
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      endAction,
      startAction,
      disabled = false,
      onChange,
      hasError: hasErrorProp,
      required: requiredProp,
      size = 'M',
      ...rest
    },
    ref,
  ) => {
    const { id, error, hint, name, required } = useField('Input');

    const hasError = Boolean(error) || Boolean(hasErrorProp);
    const isRequired = required || requiredProp;
    const ariaDescribedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
      if (!disabled && onChange) onChange(e);
    };

    return (
      <MantineInput
        ref={ref}
        id={id}
        name={name}
        size={SIZE_MAP[size]}
        leftSection={startAction}
        rightSection={endAction}
        /*
         * Mantine defaults `*SectionPointerEvents` to 'none' assuming the
         * sections are decorative icons. Strapi consumers commonly put
         * interactive controls there (e.g. the password show/hide eye
         * toggle). Switch to 'auto' when a section is present so clicks
         * fire on whatever the consumer rendered.
         */
        leftSectionPointerEvents={startAction ? 'auto' : undefined}
        rightSectionPointerEvents={endAction ? 'auto' : undefined}
        disabled={disabled}
        error={hasError || undefined}
        required={isRequired}
        aria-describedby={ariaDescribedBy}
        aria-invalid={hasError}
        aria-disabled={disabled}
        data-strapi-field-input=""
        data-strapi-field-size={size}
        onChange={handleChange}
        {...rest}
      />
    );
  },
);

Input.displayName = 'Field.Input';

/* -------------------------------------------------------------------------- */
/* Hint — renders only when hint is set AND no error                          */
/* -------------------------------------------------------------------------- */

const Hint: React.FC = () => {
  const { id, hint, error } = useField('Hint');

  if (!hint || error) return null;

  return (
    <MantineInput.Description id={`${id}-hint`} data-strapi-field-hint="">
      {hint}
    </MantineInput.Description>
  );
};

Hint.displayName = 'Field.Hint';

/* -------------------------------------------------------------------------- */
/* Error — renders only when error is a non-empty string                      */
/* -------------------------------------------------------------------------- */

const Error: React.FC = () => {
  const { id, error } = useField('Error');

  if (!error || typeof error !== 'string') return null;

  return (
    <MantineInput.Error id={`${id}-error`} data-strapi-field-error="">
      {error}
    </MantineInput.Error>
  );
};

Error.displayName = 'Field.Error';

/* -------------------------------------------------------------------------- */
/* Action — used independently of Field.Root; an a11y-wrapped icon button     */
/* -------------------------------------------------------------------------- */

interface ActionProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  label: string;
  children: React.ReactNode;
}

const Action = React.forwardRef<HTMLButtonElement, ActionProps>(({ label, children, ...rest }, ref) => (
  <button
    ref={ref}
    type="button"
    data-strapi-field-action=""
    {...rest}
    style={{
      background: 'transparent',
      border: 'none',
      padding: 0,
      fontSize: '1.6rem',
      cursor: 'pointer',
      ...rest.style,
    }}
  >
    <AccessibleIcon label={label}>{children}</AccessibleIcon>
  </button>
));

Action.displayName = 'Field.Action';

/* -------------------------------------------------------------------------- */
/* Public exports                                                              */
/* -------------------------------------------------------------------------- */

export { Root, Label, Input, Hint, Error, Action, useField };
export type { RootProps as Props, LabelProps, InputProps, ActionProps, FieldContextValue };
