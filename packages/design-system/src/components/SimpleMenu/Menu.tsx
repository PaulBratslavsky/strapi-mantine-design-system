/**
 * SimpleMenu (compound Menu parts) — drop-in port off styled-components.
 *
 * Behavior is still Radix DropdownMenu (Root/Trigger/Portal/Content/Item/
 * Separator/Label/Sub*). All styled-components wrappers replaced with
 * `data-strapi-menu-*` data hooks + CSS rules in `componentPolish.css`:
 *
 *   [data-strapi-menu-viewport]            scrollbar hiding + z-index
 *   [data-strapi-menu-content]             slide-down/up animations
 *   [data-strapi-menu-option][data-variant] common option styling
 *   [data-strapi-menu-option][data-link]    link-specific overrides
 *   [data-strapi-menu-separator]           negative margins to bleed into padding
 *   [data-strapi-menu-label]               sigma typography + padding
 *   [data-strapi-menu-subtrigger]          submenu open-state bg
 *
 * Items reflect their variant (default | danger) and disabled state via
 * the data attributes; Radix's `data-state` / `data-highlighted` attrs
 * carry the open/highlighted states the CSS targets.
 */
import * as React from 'react';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { CaretDown, ChevronRight } from '@strapi/icons';

import { Box, BoxProps } from '../../primitives/Box';
import { Flex, FlexProps } from '../../primitives/Flex';
import { Typography, TypographyProps } from '../../primitives/Typography';
import { BaseLink } from '../BaseLink';
import { Button, ButtonProps } from '../Button';
import { IconButton } from '../IconButton';
import { Link, LinkProps } from '../Link';

import { getIconColor, getTextColor } from './utils';

/* -------------------------------------------------------------------------- */
/* MenuRoot                                                                   */
/* -------------------------------------------------------------------------- */

interface RootProps extends DropdownMenu.DropdownMenuProps {}

const MenuRoot = DropdownMenu.Root;

/* -------------------------------------------------------------------------- */
/* MenuTrigger                                                                */
/* -------------------------------------------------------------------------- */

type TriggerPropsBase = Omit<ButtonProps, 'tag'> & {
  endIcon?: React.ReactNode;
  label?: React.ReactNode | string;
};

type TriggerPropsWithButton = TriggerPropsBase & {
  tag?: typeof Button;
  icon?: React.ReactNode;
};

type TriggerPropsWithIconButton = TriggerPropsBase & {
  tag: typeof IconButton;
  icon: React.ReactNode;
};

type TriggerProps = TriggerPropsWithButton | TriggerPropsWithIconButton;

const MenuTrigger = React.forwardRef<HTMLButtonElement, TriggerProps>(
  ({ label, endIcon = <CaretDown width="1.2rem" height="1.2rem" aria-hidden />, tag = Button, icon, ...rest }, ref) => {
    const props: ButtonProps = {
      ...rest,
      type: 'button',
    };

    return (
      <DropdownMenu.Trigger asChild disabled={props.disabled}>
        {tag === IconButton ? (
          <IconButton label={label as string} variant="tertiary" ref={ref} {...props}>
            {icon}
          </IconButton>
        ) : (
          <Button endIcon={endIcon} variant="ghost" ref={ref} {...props} />
        )}
      </DropdownMenu.Trigger>
    );
  },
);

/* -------------------------------------------------------------------------- */
/* MenuContent                                                                */
/* -------------------------------------------------------------------------- */

type ContentProps = FlexProps<'div'> &
  Pick<DropdownMenu.DropdownMenuContentProps, 'onCloseAutoFocus'> & {
    intersectionId?: string;
    popoverPlacement?: `${NonNullable<DropdownMenu.DropdownMenuContentProps['side']>}-${NonNullable<DropdownMenu.DropdownMenuContentProps['align']>}`;
  };

const MenuContent = React.forwardRef<HTMLDivElement, ContentProps>(
  ({ children, intersectionId, onCloseAutoFocus, popoverPlacement = 'bottom-start', ...props }, ref) => {
    const [side, align] = popoverPlacement.split('-') as [
      DropdownMenu.DropdownMenuContentProps['side'],
      DropdownMenu.DropdownMenuContentProps['align'],
    ];

    return (
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          side={side}
          loop
          onCloseAutoFocus={onCloseAutoFocus}
          asChild
          data-strapi-menu-content=""
        >
          <Flex
            ref={ref}
            direction="column"
            borderColor="neutral150"
            hasRadius
            background="neutral0"
            shadow="filterShadow"
            maxHeight="15rem"
            padding={1}
            marginTop={1}
            marginBottom={1}
            alignItems="flex-start"
            position="relative"
            overflow="auto"
            data-strapi-menu-viewport=""
            {...props}
          >
            {children}
            <Box id={intersectionId} width="100%" height="1px" />
          </Flex>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    );
  },
);

/* -------------------------------------------------------------------------- */
/* MenuItem                                                                   */
/* -------------------------------------------------------------------------- */

export type ItemVariant = 'danger' | 'default';

interface ItemSharedProps extends Pick<DropdownMenu.MenuItemProps, 'disabled' | 'onSelect'> {
  children?: React.ReactNode;
  isExternal?: boolean;
  isFocused?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  variant?: ItemVariant;
}

interface ItemExternalLinkProps extends ItemSharedProps, Omit<LinkProps, 'onSelect'> {
  as?: never;
  isLink?: false;
  isExternal?: true;
}

type ItemInternalLinkProps<TComponent extends React.ComponentType = typeof BaseLink> = ItemSharedProps &
  React.ComponentPropsWithoutRef<TComponent> & {
    as?: TComponent;
    isLink?: true;
    isExternal?: false;
  };

interface ItemButtonProps extends ItemSharedProps, Omit<BoxProps<'button'>, 'onSelect'> {
  as?: never;
  isLink?: false;
  isExternal?: false;
}

type ItemProps<TComponent extends React.ComponentType = typeof BaseLink> =
  | ItemButtonProps
  | ItemInternalLinkProps<TComponent>
  | ItemExternalLinkProps;

const MenuItem = ({
  onSelect,
  disabled = false,
  isLink,
  startIcon,
  endIcon,
  isExternal,
  variant = 'default',
  ...props
}: ItemProps) => {
  return (
    <DropdownMenu.Item asChild onSelect={onSelect} disabled={disabled}>
      {isLink || isExternal ? (
        <Link
          // getTextColor returns one of Strapi's color-token strings; cast to
          // Link's narrow `keyof DefaultTheme['colors']` shape. (utils.ts
          // returns plain `string` so it can stay styled-components-free.)
          color={getTextColor(variant, disabled) as React.ComponentProps<typeof Link>['color']}
          startIcon={startIcon}
          endIcon={endIcon}
          {...props}
          isExternal={isExternal ?? false}
          data-strapi-menu-option=""
          data-strapi-menu-option-link=""
          data-variant={variant}
          data-disabled={disabled ? '' : undefined}
        >
          {props.children}
        </Link>
      ) : (
        <Flex
          cursor="pointer"
          color={getTextColor(variant, disabled) as React.ComponentProps<typeof Flex>['color']}
          background="transparent"
          borderStyle="none"
          gap={2}
          data-strapi-menu-option=""
          data-variant={variant}
          data-disabled={disabled ? '' : undefined}
          {...props}
        >
          {startIcon && (
            <Flex tag="span" color={getIconColor(variant, disabled)} aria-hidden>
              {startIcon}
            </Flex>
          )}

          <Typography grow={1}>{props.children}</Typography>

          {endIcon && (
            <Flex tag="span" color={getIconColor(variant, disabled)} aria-hidden>
              {endIcon}
            </Flex>
          )}
        </Flex>
      )}
    </DropdownMenu.Item>
  );
};

/* -------------------------------------------------------------------------- */
/* MenuSeparator                                                              */
/* -------------------------------------------------------------------------- */

interface SeparatorProps extends DropdownMenu.DropdownMenuSeparatorProps {}

const MenuSeparator = React.forwardRef<HTMLDivElement, SeparatorProps>((props: SeparatorProps, ref) => (
  <DropdownMenu.Separator {...props} asChild>
    <Box height="1px" shrink={0} background="neutral150" ref={ref} data-strapi-menu-separator="" />
  </DropdownMenu.Separator>
));

/* -------------------------------------------------------------------------- */
/* MenuLabel                                                                  */
/* -------------------------------------------------------------------------- */

interface LabelProps extends TypographyProps {}

const MenuLabel = React.forwardRef<HTMLSpanElement, LabelProps>((props, ref) => (
  <DropdownMenu.Label asChild>
    <Typography
      ref={ref}
      variant="sigma"
      textColor="neutral600"
      data-strapi-menu-label=""
      {...props}
    />
  </DropdownMenu.Label>
));

/* -------------------------------------------------------------------------- */
/* MenuSubRoot                                                                */
/* -------------------------------------------------------------------------- */

interface SubRootProps extends DropdownMenu.DropdownMenuSubProps {}

const MenuSubRoot = DropdownMenu.Sub;

/* -------------------------------------------------------------------------- */
/* MenuSubTrigger                                                             */
/* -------------------------------------------------------------------------- */

interface SubTriggerProps extends BoxProps<'button'> {}

const MenuSubTrigger = React.forwardRef<HTMLButtonElement, SubTriggerProps>(
  ({ disabled = false, ...props }, ref) => {
    return (
      <DropdownMenu.SubTrigger asChild disabled={disabled}>
        <Flex
          ref={ref}
          color="neutral800"
          tag="button"
          type="button"
          background="transparent"
          borderStyle="none"
          gap={5}
          data-strapi-menu-option=""
          data-strapi-menu-subtrigger=""
          data-variant="default"
          {...props}
        >
          <Typography>{props.children}</Typography>
          <ChevronRight fill="neutral500" height="1.2rem" width="1.2rem" />
        </Flex>
      </DropdownMenu.SubTrigger>
    );
  },
);

/* -------------------------------------------------------------------------- */
/* MenuSubContent                                                             */
/* -------------------------------------------------------------------------- */

interface SubContentProps extends FlexProps<'div'> {}

const MenuSubContent = React.forwardRef<HTMLDivElement, SubContentProps>((props, ref) => {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.SubContent sideOffset={8} asChild>
        <Flex
          ref={ref}
          direction="column"
          borderStyle="solid"
          borderWidth="1px"
          borderColor="neutral150"
          hasRadius
          background="neutral0"
          shadow="filterShadow"
          maxHeight="15rem"
          padding={1}
          alignItems="flex-start"
          overflow="auto"
          data-strapi-menu-viewport=""
          {...props}
        />
      </DropdownMenu.SubContent>
    </DropdownMenu.Portal>
  );
});

const Root = MenuRoot;
const Trigger = MenuTrigger;
const Content = MenuContent;
const Item = MenuItem;
const Separator = MenuSeparator;
const Label = MenuLabel;
const SubRoot = MenuSubRoot;
const SubTrigger = MenuSubTrigger;
const SubContent = MenuSubContent;

export { Root, Trigger, Content, Item, Separator, Label, SubRoot, SubTrigger, SubContent };
export type {
  TriggerProps,
  ContentProps,
  ItemProps,
  RootProps,
  SubRootProps,
  SubTriggerProps,
  SubContentProps,
  LabelProps,
};
