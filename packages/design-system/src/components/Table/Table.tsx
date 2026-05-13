/**
 * Table — drop-in port off styled-components.
 *
 * The three styled wrappers (TableContainer, TableBox, ScrollContainer)
 * collapse to data-attribute-tagged Box primitives. CSS lives in
 * `[data-strapi-table-shell]`, `[data-strapi-table-scroll]`, and
 * `[data-strapi-table]` rules in `componentPolish.css`.
 *
 * Overflow shadows on the scroll container are signaled via a
 * `data-overflow` attribute (`left | right | both`); the CSS selects
 * which side(s) render the gradient overlay.
 */
import * as React from 'react';

import { Box } from '../../primitives/Box';
import { RawTable, RawTableProps } from '../RawTable/RawTable';

export type Overflowing = 'both' | 'left' | 'right';

export interface TableProps extends RawTableProps {
  footer?: React.ReactNode;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ footer, ...props }, forwardedRef) => {
    const tableRef = React.useRef<HTMLDivElement>(null!);
    const [overflowing, setOverflowing] = React.useState<Overflowing>();

    const handleScroll: React.UIEventHandler<HTMLDivElement> = (e) => {
      const target = e.currentTarget;
      const maxScrollLeft = target.scrollWidth - target.clientWidth;

      if (target.scrollLeft === 0) {
        setOverflowing('right');
        return;
      }

      if (target.scrollLeft === maxScrollLeft) {
        setOverflowing('left');
        return;
      }

      if (target.scrollLeft > 0) {
        setOverflowing('both');
      }
    };

    React.useEffect(() => {
      if (tableRef.current.scrollWidth > tableRef.current.clientWidth) {
        setOverflowing('right');
      }
    }, []);

    return (
      <Box
        shadow="tableShadow"
        hasRadius
        background="neutral0"
        data-strapi-table-shell=""
      >
        <Box
          position="relative"
          data-strapi-table-scroll=""
          data-overflow={overflowing || undefined}
        >
          <Box
            ref={tableRef}
            onScroll={handleScroll}
            paddingLeft={6}
            paddingRight={6}
            data-strapi-table-viewport=""
          >
            <RawTable ref={forwardedRef} data-strapi-table="" {...props} />
          </Box>
        </Box>
        {footer}
      </Box>
    );
  },
);
