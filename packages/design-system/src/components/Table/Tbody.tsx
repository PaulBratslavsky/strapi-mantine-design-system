/**
 * Tbody — drop-in port off styled-components.
 *
 * Only styled rule removed the bottom border from the last tr. Moved to
 * `[data-strapi-tbody] tr:last-of-type` in `componentPolish.css`.
 */
import * as React from 'react';

import { RawTbody, RawTbodyProps } from '../RawTable/RawTbody';

export const Tbody = ({ children, ...props }: RawTbodyProps) => {
  return (
    <RawTbody data-strapi-tbody="" {...props}>
      {children}
    </RawTbody>
  );
};
