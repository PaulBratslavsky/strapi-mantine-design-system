/**
 * Radio — drop-in port off styled-components.
 *
 * Radix RadioGroup behavior + a11y preserved. Visual rules (Group flex
 * layout, Item sizing/colors/state, Indicator dot + animation) moved to
 * `componentPolish.css` keyed on `[data-strapi-radio-*]` hooks.
 */
import * as React from 'react';

import * as RadioGroup from '@radix-ui/react-radio-group';

import { useId } from '../../hooks/useId';
import { Flex } from '../../primitives/Flex';
import { Typography } from '../../primitives/Typography';

/* -------------------------------------------------------------------------- */
/* Group                                                                      */
/* -------------------------------------------------------------------------- */

type GroupElement = HTMLDivElement;

interface GroupProps extends RadioGroup.RadioGroupProps {}

const Group = React.forwardRef<GroupElement, GroupProps>((props, forwardedRef) => {
  return <RadioGroup.Root ref={forwardedRef} data-strapi-radio-group="" {...props} />;
});

/* -------------------------------------------------------------------------- */
/* Item                                                                       */
/* -------------------------------------------------------------------------- */

type ItemElement = HTMLButtonElement;

interface ItemProps extends RadioGroup.RadioGroupItemProps {}

const Item = React.forwardRef<ItemElement, ItemProps>(({ children, id: idProp, ...restProps }, forwardedRef) => {
  const id = useId(idProp);

  return (
    <Flex gap={2}>
      <RadioGroup.Item id={id} ref={forwardedRef} data-strapi-radio-item="" {...restProps}>
        <RadioGroup.Indicator data-strapi-radio-indicator="" />
      </RadioGroup.Item>
      <Typography tag="label" htmlFor={id}>
        {children}
      </Typography>
    </Flex>
  );
});

export { Group, Item };
export type { GroupElement, GroupProps, ItemElement, ItemProps };
