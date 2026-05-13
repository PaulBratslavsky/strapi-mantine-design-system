/**
 * CrumbSimpleMenu — drop-in port off styled-components.
 *
 * Wraps SimpleMenu with breadcrumb-specific padding + height + hover/focus.
 * Styling moved to `componentPolish.css` keyed on `[data-strapi-crumb-menu]`.
 *
 * Passing the data attribute via SimpleMenu's prop spread; SimpleMenu
 * forwards arbitrary attrs to the underlying button so the hook lands on
 * the rendered DOM element where CSS rules can target it.
 */
import * as React from 'react';

import { SimpleMenu, type SimpleMenuProps } from '../SimpleMenu';

export type CrumbSimpleMenuProps = SimpleMenuProps & {
  'aria-label': string;
  icon?: React.ReactElement;
  endIcon?: React.ReactNode;
};

export const CrumbSimpleMenu = React.forwardRef<HTMLButtonElement, CrumbSimpleMenuProps>(
  ({ children, ...props }, forwardedRef) => (
    <SimpleMenu
      ref={forwardedRef}
      endIcon={null}
      size="S"
      data-strapi-crumb-menu=""
      {...props}
    >
      {children}
    </SimpleMenu>
  ),
);

CrumbSimpleMenu.displayName = 'CrumbSimpleMenu';
