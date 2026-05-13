/**
 * Tabs — drop-in port off styled-components.
 *
 * Behavior: Radix Tabs (Root/List/Trigger/Content + the disabled/variant/
 * hasError context). Styling moved to `componentPolish.css` keyed on:
 *   [data-strapi-tabs-root]
 *   [data-strapi-tabs-list][data-variant=regular|simple]
 *   [data-strapi-tabs-trigger][data-variant=...][data-has-error]
 *   [data-strapi-tabs-content][data-variant=...]
 *   [data-strapi-tabs-bar]                — the absolute-positioned
 *                                            bottom indicator for "simple" variant
 *
 * Radix's `data-state="active"` / `data-disabled` attributes are preserved
 * as selectors for state-driven CSS.
 */
import * as React from 'react';

import * as Tabs from '@radix-ui/react-tabs';

import { createContext } from '../../helpers/context';
import { Typography } from '../../primitives/Typography';

/* -------------------------------------------------------------------------- */
/* Root + context                                                             */
/* -------------------------------------------------------------------------- */

type Variant = 'regular' | 'simple';

interface ContextValue {
  /** @default false — true disables all tabs; a string disables one. */
  disabled: boolean | string;
  /** Value of the tab to mark as having an error state. */
  hasError?: string;
  /** @default 'regular' */
  variant: Variant;
}

const [TabsProvider, useTabs] = createContext<ContextValue>('Tabs');

type Element = HTMLDivElement;

interface Props extends Tabs.TabsProps, Partial<ContextValue> {}

const Root = React.forwardRef<Element, Props>(
  ({ disabled = false, variant = 'regular', hasError, ...props }, forwardedRef) => {
    return (
      <TabsProvider disabled={disabled} hasError={hasError} variant={variant}>
        <Tabs.Root ref={forwardedRef} data-strapi-tabs-root="" {...props} />
      </TabsProvider>
    );
  },
);

/* -------------------------------------------------------------------------- */
/* List                                                                       */
/* -------------------------------------------------------------------------- */

type ListElement = HTMLDivElement;

interface ListProps extends Tabs.TabsListProps {}

const List = React.forwardRef<ListElement, ListProps>((props, forwardedRef) => {
  const { variant } = useTabs('List');
  return <Tabs.List ref={forwardedRef} data-strapi-tabs-list="" data-variant={variant} {...props} />;
});

/* -------------------------------------------------------------------------- */
/* Trigger                                                                    */
/* -------------------------------------------------------------------------- */

type TriggerElement = HTMLButtonElement;

interface TriggerProps extends Tabs.TabsTriggerProps {}

const Trigger = React.forwardRef<TriggerElement, TriggerProps>(
  ({ children, disabled: disabledProp, ...props }, forwardedRef) => {
    const { disabled: disabledContext, variant, hasError } = useTabs('Trigger');

    const isDisabled = disabledContext === true || disabledContext === props.value || disabledProp;
    const isErrored = hasError === props.value;

    return (
      <Tabs.Trigger
        ref={forwardedRef}
        data-strapi-tabs-trigger=""
        data-variant={variant}
        data-has-error={isErrored ? '' : undefined}
        disabled={isDisabled}
        {...props}
      >
        <Typography fontWeight="bold" variant={variant === 'simple' ? 'sigma' : undefined}>
          {children}
        </Typography>
        {variant === 'simple' ? <span data-strapi-tabs-bar="" /> : null}
      </Tabs.Trigger>
    );
  },
);

/* -------------------------------------------------------------------------- */
/* Content                                                                    */
/* -------------------------------------------------------------------------- */

type ContentElement = HTMLDivElement;

interface ContentProps extends Tabs.TabsContentProps {}

const Content = React.forwardRef<ContentElement, ContentProps>((props, forwardedRef) => {
  const { variant } = useTabs('Content');
  return <Tabs.Content ref={forwardedRef} data-strapi-tabs-content="" data-variant={variant} {...props} />;
});

export { Root, List, Trigger, Content };
export type { Props, Element, ListProps, ListElement, TriggerProps, TriggerElement, ContentProps, ContentElement };
