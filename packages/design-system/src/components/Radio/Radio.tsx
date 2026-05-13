/**
 * Radio — thin translation layer over Mantine's <Radio> + <Radio.Group>.
 *
 * Drops Radix RadioGroup + styled-components wrappers. Mantine's <Radio>
 * + <Radio.Group> have the same compound API and ship focus ring + a11y +
 * the radio dot animation.
 *
 * Strapi compound API preserved:
 *   - <Radio.Group value onChange defaultValue> → Mantine `<Radio.Group>`
 *   - <Radio.Item value>children</Radio.Item>   → Mantine `<Radio value label={children} />`
 *
 * Note: Radix's `Radio.Item` exposed children as the visible label (we
 * rendered a sibling <Typography tag="label" htmlFor={id}>). Mantine
 * accepts `label` directly on `<Radio>`. The translation just routes
 * `children` → `label`.
 */
import * as React from 'react';

import { Radio as MantineRadio, type RadioProps as MantineRadioProps, type RadioGroupProps as MantineRadioGroupProps } from '@mantine/core';

type GroupElement = HTMLDivElement;
type ItemElement = HTMLInputElement;

interface GroupProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: unknown;
}

interface ItemProps {
  value: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: unknown;
}

const Group = React.forwardRef<GroupElement, GroupProps>(
  ({ value, defaultValue, onValueChange, children, ...rest }, forwardedRef) => {
    return (
      <MantineRadio.Group
        ref={forwardedRef as React.Ref<HTMLDivElement>}
        value={value}
        defaultValue={defaultValue}
        onChange={(next: string) => onValueChange?.(next)}
        {...(rest as Partial<MantineRadioGroupProps>)}
      >
        {children}
      </MantineRadio.Group>
    );
  },
);

Group.displayName = 'RadioGroup';

const Item = React.forwardRef<ItemElement, ItemProps>(({ value, children, ...rest }, forwardedRef) => {
  return (
    <MantineRadio
      ref={forwardedRef}
      value={value}
      label={children}
      {...(rest as Partial<MantineRadioProps>)}
    />
  );
});

Item.displayName = 'RadioItem';

export { Group, Item };
export type { GroupElement, GroupProps, ItemElement, ItemProps };
