/**
 * Switch — thin translation layer over Mantine's <Switch>.
 *
 * Drops Radix Switch + styled-components wrappers. Mantine's <Switch>
 * ships the thumb-slide animation, focus ring, disabled state, and
 * built-in on/off labels (`onLabel`/`offLabel` prop pair).
 *
 * Strapi prop API preserved:
 *   - checked, defaultChecked, disabled — pass-through
 *   - onCheckedChange(checked) → Mantine onChange(event)
 *   - onLabel / offLabel / visibleLabels — translated:
 *       Mantine's `onLabel` / `offLabel` always render inside the switch
 *       track. Strapi's `visibleLabels` rendered labels OUTSIDE the switch
 *       as separate text. We keep Mantine's in-track labels (they're
 *       cleaner) and treat `visibleLabels=false` as "no labels", true as
 *       "show the on/off labels".
 *
 * Loses: the explicit danger/success color states on the track from
 * legacy. Mantine ships its own switch palette (filled green when on,
 * neutral when off). If a consumer needed the danger-red-off state
 * specifically, they can pass `color` prop.
 */
import * as React from 'react';

import { Switch as MantineSwitch, type SwitchProps as MantineSwitchProps } from '@mantine/core';

interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  id?: string;
  /** @default 'On' */
  onLabel?: string;
  /** @default 'Off' */
  offLabel?: string;
  /** When true, renders on/off labels inside the switch track. */
  visibleLabels?: boolean;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: unknown;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
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
      onLabel = 'On',
      offLabel = 'Off',
      visibleLabels = false,
      ...rest
    },
    ref,
  ) => {
    return (
      <MantineSwitch
        ref={ref}
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={(e) => onCheckedChange?.(e.currentTarget.checked)}
        disabled={disabled}
        required={required}
        name={name}
        value={value}
        id={id}
        onLabel={visibleLabels ? onLabel : undefined}
        offLabel={visibleLabels ? offLabel : undefined}
        {...(rest as Partial<MantineSwitchProps>)}
      />
    );
  },
);

Switch.displayName = 'Switch';

export { Switch };
export type { SwitchProps };
