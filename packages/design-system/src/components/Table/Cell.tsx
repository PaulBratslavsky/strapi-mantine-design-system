/**
 * Cell (Th / Td) — drop-in port off styled-components.
 *
 * Cell layout (vertical-align, text-align, outline-offset) and the
 * checkbox-alignment hack moved to `[data-strapi-cell]` rules in
 * `componentPolish.css`.
 */
import * as React from 'react';

import { Flex } from '../../primitives/Flex';
import { RawTh, RawTd, RawTdProps } from '../RawTable/RawCell';

export interface ThProps extends RawTdProps {
  children: React.ReactNode;
  /**
   * @deprecated just pass everything as children.
   */
  action?: React.ReactNode;
}

export const Th = React.forwardRef<HTMLTableCellElement, ThProps>(
  ({ children, action, ...props }, forwardedRef) => {
    return (
      <RawTh color="neutral600" ref={forwardedRef} data-strapi-cell="" {...props}>
        <Flex>
          {children}
          {action}
        </Flex>
      </RawTh>
    );
  },
);

export const Td = React.forwardRef<HTMLTableCellElement, RawTdProps>(
  ({ children, ...props }, forwardedRef) => {
    return (
      <RawTd color="neutral800" ref={forwardedRef} data-strapi-cell="" {...props}>
        {children}
      </RawTd>
    );
  },
);
