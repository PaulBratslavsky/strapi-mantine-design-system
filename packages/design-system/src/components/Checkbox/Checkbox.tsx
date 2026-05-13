/**
 * Checkbox — thin translation layer over Mantine's <Checkbox>.
 *
 * Drops Radix Checkbox + styled-components wrappers. Mantine's <Checkbox>
 * has the same API surface (checked / defaultChecked / onCheckedChange /
 * disabled / indeterminate) plus built-in label support and a11y.
 *
 * Strapi prop API preserved:
 *   - checked, defaultChecked, disabled, indeterminate — pass-through
 *   - onCheckedChange(state) → Mantine's onChange(event.currentTarget.checked)
 *     (we wrap to keep Strapi's signature)
 *   - children → Mantine's `label` prop (Strapi's pattern was sibling
 *     <label>; Mantine's Checkbox ships a built-in label slot, simpler)
 *
 * Mantine handles focus ring, indeterminate-icon, disabled state styles.
 */
import * as React from 'react';

import { Checkbox as MantineCheckbox } from '@mantine/core';

type CheckboxElement = HTMLInputElement;

interface CheckboxProps {
  checked?: boolean | 'indeterminate';
  defaultChecked?: boolean | 'indeterminate';
  onCheckedChange?: (checked: boolean | 'indeterminate') => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  id?: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: unknown;
}

const Checkbox = React.forwardRef<CheckboxElement, CheckboxProps>(
  (
    {
      checked,
      defaultChecked,
      onCheckedChange,
      disabled,
      required,
      name,
      value,
      id,
      children,
      ...rest
    },
    ref,
  ) => {
    const isIndeterminate = checked === 'indeterminate' || defaultChecked === 'indeterminate';
    const boolChecked = checked === 'indeterminate' ? false : checked;
    const boolDefaultChecked = defaultChecked === 'indeterminate' ? false : defaultChecked;

    return (
      <MantineCheckbox
        ref={ref}
        checked={boolChecked}
        defaultChecked={boolDefaultChecked}
        indeterminate={isIndeterminate}
        onChange={(e) => onCheckedChange?.(e.currentTarget.checked)}
        disabled={disabled}
        required={required}
        name={name}
        value={value}
        id={id}
        label={children}
        {...(rest as Record<string, unknown>)}
      />
    );
  },
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
export type { CheckboxProps, CheckboxElement };
export type CheckboxElProps = CheckboxProps;
