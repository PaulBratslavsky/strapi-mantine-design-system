/**
 * Accordion — drop-in port off styled-components.
 *
 * Behavior is still Radix Accordion (Root/Item/Header/Trigger/Content) plus
 * a context for the `size` value and a custom `Actions` part. All styling
 * lives in `componentPolish.css` keyed on `[data-strapi-accordion-*]`
 * attributes + Radix's native `data-state` / `data-disabled` attributes.
 *
 * Selectors:
 *   [data-strapi-accordion-root]
 *   [data-strapi-accordion-item][data-size=S|M]
 *   [data-strapi-accordion-header][data-variant=primary|secondary]
 *   [data-strapi-accordion-trigger][data-size=...][data-caret=left|right]
 *   [data-strapi-accordion-trigger-icon][data-size=...]
 *   [data-strapi-accordion-icon-box]
 *   [data-strapi-accordion-actions][data-size=...]
 *   [data-strapi-accordion-content]
 *
 * Slide-down/up animations replicated as `@keyframes` in `componentPolish.css`
 * so the legacy timing + Radix's `--radix-accordion-content-height` var
 * still drive the transition.
 */
import * as React from 'react';

import * as RadixAccordion from '@radix-ui/react-accordion';
import { CaretDown } from '@strapi/icons';

import { createContext } from '../../helpers/context';
import { Box } from '../../primitives/Box';
import { Flex, FlexProps } from '../../primitives/Flex';
import { Typography } from '../../primitives/Typography';

type Size = 'S' | 'M';
type Variant = 'primary' | 'secondary';

/* -------------------------------------------------------------------------- */
/* Root + context                                                             */
/* -------------------------------------------------------------------------- */

interface ContextValue {
  /** @default "S" */
  size: Size;
}

const [AccordionProvider, useAccordion] = createContext<ContextValue>('Accordion');

type Element = HTMLDivElement;

type Props = Omit<RadixAccordion.AccordionSingleProps, 'type'> & Partial<ContextValue>;

const Root = React.forwardRef<Element, Props>(({ children, size = 'S', ...props }, forwardedRef) => {
  return (
    <RadixAccordion.Root
      ref={forwardedRef}
      data-strapi-accordion-root=""
      data-size={size}
      collapsible
      {...props}
      type="single"
    >
      <AccordionProvider size={size}>{children}</AccordionProvider>
    </RadixAccordion.Root>
  );
});

/* -------------------------------------------------------------------------- */
/* Item                                                                       */
/* -------------------------------------------------------------------------- */

type ItemElement = HTMLDivElement;

interface ItemProps extends RadixAccordion.AccordionItemProps {}

const Item = React.forwardRef<ItemElement, ItemProps>((props, forwardedRef) => {
  const { size } = useAccordion('Item');
  return (
    <RadixAccordion.Item
      ref={forwardedRef}
      data-strapi-accordion-item=""
      data-size={size}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------- */
/* Trigger                                                                    */
/* -------------------------------------------------------------------------- */

type TriggerElement = HTMLButtonElement;

interface TriggerProps extends Omit<RadixAccordion.AccordionTriggerProps, 'asChild'> {
  /** @default "left" */
  caretPosition?: 'left' | 'right';
  description?: string;
  icon?: React.ElementType<React.SVGProps<SVGSVGElement>>;
  iconProps?: React.SVGProps<SVGSVGElement>;
}

const Trigger = React.forwardRef<TriggerElement, TriggerProps>(
  ({ caretPosition = 'left', description, icon: Icon, iconProps, children, ...restProps }, forwardedRef) => {
    const { size } = useAccordion('Trigger');
    const caretSize = size === 'S' ? '1.2rem' : '1.6rem';

    return (
      <RadixAccordion.Trigger
        ref={forwardedRef}
        data-strapi-accordion-trigger=""
        data-size={size}
        data-caret={caretPosition}
        {...restProps}
      >
        {caretPosition === 'left' ? (
          <Flex tag="span" data-strapi-accordion-trigger-icon="" data-size={size}>
            <CaretDown width={caretSize} height={caretSize} />
          </Flex>
        ) : null}
        <Flex tag="span" gap={2} overflow="hidden">
          {Icon && size === 'S' ? (
            <Box tag="span" data-strapi-accordion-icon-box="">
              <Icon {...iconProps} />
            </Box>
          ) : null}
          <Flex alignItems="flex-start" direction="column" tag="span" overflow="hidden">
            <Typography
              fontWeight={size === 'S' ? 'bold' : undefined}
              ellipsis
              variant={size === 'M' ? 'delta' : undefined}
              textAlign="left"
              width="100%"
            >
              {children}
            </Typography>
            {description && size === 'M' ? <Typography textAlign="left">{description}</Typography> : null}
          </Flex>
        </Flex>
        {caretPosition === 'right' ? (
          <Flex tag="span" data-strapi-accordion-trigger-icon="" data-size={size}>
            <CaretDown width={caretSize} height={caretSize} />
          </Flex>
        ) : null}
      </RadixAccordion.Trigger>
    );
  },
);

/* -------------------------------------------------------------------------- */
/* Actions                                                                    */
/* -------------------------------------------------------------------------- */

type ActionsElement = HTMLSpanElement;

interface ActionsProps extends FlexProps<'span'> {}

const Actions = React.forwardRef<ActionsElement, ActionsProps>((props, forwardedRef) => {
  const { size } = useAccordion('Trigger');
  return (
    <Flex
      tag="span"
      ref={forwardedRef}
      data-strapi-accordion-actions=""
      data-size={size}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------- */
/* Header                                                                     */
/* -------------------------------------------------------------------------- */

type HeaderElement = HTMLHeadingElement;

interface HeaderProps extends Omit<RadixAccordion.AccordionHeaderProps, 'asChild'> {
  /** @default "primary" */
  variant?: Variant;
}

const Header = React.forwardRef<HeaderElement, HeaderProps>(({ variant = 'primary', ...props }, forwardedRef) => {
  return (
    <RadixAccordion.Header
      ref={forwardedRef}
      data-strapi-accordion-header=""
      data-variant={variant}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------- */
/* Content                                                                    */
/* -------------------------------------------------------------------------- */

type ContentElement = HTMLDivElement;

interface ContentProps extends RadixAccordion.AccordionContentProps {}

const Content = React.forwardRef<ContentElement, ContentProps>((props, forwardedRef) => {
  return <RadixAccordion.Content ref={forwardedRef} data-strapi-accordion-content="" {...props} />;
});

export { Root, Item, Header, Trigger, Actions, Content };
export type {
  ContextValue,
  Element,
  Props,
  ItemElement,
  ItemProps,
  HeaderElement,
  HeaderProps,
  TriggerElement,
  TriggerProps,
  ActionsElement,
  ActionsProps,
  ContentElement,
  ContentProps,
  Size,
  Variant,
};
