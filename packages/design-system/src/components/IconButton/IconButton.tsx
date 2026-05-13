/**
 * IconButton — drop-in port off styled-components.
 *
 * Rebuilt as a thin wrapper around the migrated `<Button>` component (which
 * is now MantineButton-backed). The legacy version reimplemented all the
 * variant + hover + active + disabled styles via styled-components and
 * shared helpers in `Button/legacy/utils.ts`; we now lean on Button's
 * existing variant translation and just provide icon-button-specific
 * sizing (square padding) + tooltip wrapping + `<AccessibleIcon>` for a11y.
 *
 * Public API preserved: same `size`, `variant`, `label`, `withTooltip`,
 * `disabled`, `onClick`, `type`, polymorphic `tag` via Button's surface.
 *
 * Visual rule (square padding per size, group border-radius) moved to
 * `componentPolish.css` keyed on `[data-strapi-icon-button*]`.
 */
import * as React from 'react';

import { Flex, FlexProps } from '../../primitives/Flex';
import { PolymorphicRef } from '../../types';
import { AccessibleIcon } from '../../utilities/AccessibleIcon';
import { forwardRef } from '../../utilities/forwardRef';
import { Button, type ButtonProps } from '../Button';
import { Tooltip } from '../Tooltip';

type IconButtonProps<C extends React.ElementType = 'button'> = FlexProps<C> &
  Pick<ButtonProps, 'size' | 'variant' | 'type'> & {
    children: React.ReactNode;
    disabled?: boolean;
    /** Not visually rendered; required for accessibility (`aria-label`). */
    label: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    /** @default true */
    withTooltip?: boolean;
  };

const IconButton = forwardRef(
  <C extends React.ElementType = 'button'>(
    {
      label,
      children,
      disabled = false,
      onClick,
      size = 'S',
      variant = 'tertiary',
      withTooltip = true,
      type = 'button',
      ...restProps
    }: IconButtonProps<C>,
    ref: PolymorphicRef<C>,
  ) => {
    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
      if (!disabled && onClick) onClick(e);
    };

    // Button is polymorphic with its own forwardRef signature; intersecting
    // with IconButton's polymorphic generic + restProps produces a wider
    // type than Button's typed entry accepts. Cast at this seam — runtime
    // forwards everything correctly via Button's spread.
    const buttonProps = {
      ref,
      size,
      variant,
      type,
      onClick: handleClick,
      disabled,
      'data-strapi-icon-button': '',
      'data-strapi-icon-button-size': size,
      ...restProps,
    } as React.ComponentProps<typeof Button>;

    const component = (
      <Button {...buttonProps}>
        <AccessibleIcon label={label}>{children}</AccessibleIcon>
      </Button>
    );

    return withTooltip ? <Tooltip label={label}>{component}</Tooltip> : component;
  },
);

type IconButtonComponent<C extends React.ElementType = 'button'> = (props: IconButtonProps<C>) => React.ReactNode;

/* -------------------------------------------------------------------------- */
/* IconButtonGroup                                                            */
/* -------------------------------------------------------------------------- */

interface IconButtonGroupProps extends FlexProps {}

const IconButtonGroup = React.forwardRef<HTMLDivElement, IconButtonGroupProps>((props, ref) => {
  return <Flex ref={ref} data-strapi-icon-button-group="" {...props} />;
});
IconButtonGroup.displayName = 'IconButtonGroup';

export { IconButton, IconButtonGroup };
export type { IconButtonProps, IconButtonComponent };
