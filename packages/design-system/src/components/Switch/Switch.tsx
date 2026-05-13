/**
 * Switch — drop-in port off styled-components.
 *
 * Still Radix Switch + composed event handlers + controllable state.
 * Visual rules (size, on/off/disabled background colors, thumb position +
 * transition, label color states) moved to `componentPolish.css` keyed on
 * `[data-strapi-switch-root]` and `[data-strapi-switch-thumb]`. Radix's
 * `data-state="checked"` and `data-disabled` attributes are preserved as
 * selectors for the state-driven CSS.
 */
import * as React from 'react';

import * as RadixSwitch from '@radix-ui/react-switch';
import { composeEventHandlers } from '@strapi/ui-primitives';

import { useControllableState } from '../../hooks/useControllableState';
import { Flex } from '../../primitives/Flex';
import { Typography } from '../../primitives/Typography';

interface SwitchProps extends Omit<RadixSwitch.SwitchProps, 'children'> {
  onLabel?: string;
  offLabel?: string;
  visibleLabels?: boolean;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      visibleLabels,
      onLabel = 'On',
      offLabel = 'Off',
      onCheckedChange: onCheckedChangeProp,
      checked: checkedProp,
      defaultChecked,
      disabled,
      ...restProps
    },
    forwardedRef,
  ) => {
    const [internalChecked, setInternalChecked] = useControllableState({
      prop: checkedProp,
      defaultProp: defaultChecked,
    });

    const handleCheckChange: SwitchProps['onCheckedChange'] = (checked) => {
      setInternalChecked(checked);
    };

    return (
      <Flex gap={3}>
        <RadixSwitch.Root
          ref={forwardedRef}
          onCheckedChange={composeEventHandlers(onCheckedChangeProp, handleCheckChange)}
          checked={internalChecked}
          disabled={disabled}
          data-strapi-switch-root=""
          {...restProps}
        >
          <RadixSwitch.Thumb data-strapi-switch-thumb="" />
        </RadixSwitch.Root>
        {visibleLabels ? (
          <Typography
            aria-hidden
            data-strapi-switch-label=""
            data-disabled={disabled}
            data-state={internalChecked ? 'checked' : 'unchecked'}
          >
            {internalChecked ? onLabel : offLabel}
          </Typography>
        ) : null}
      </Flex>
    );
  },
);

export { Switch };
export type { SwitchProps };
