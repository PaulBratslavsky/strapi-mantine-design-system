/**
 * CardAction — drop-in port off styled-components.
 *
 * Positions a row of actions absolutely at top-right (`position="end"`) or
 * top-left (`position="start"`) of the Card. Layout rules moved to
 * `[data-strapi-card-action]` + `[data-strapi-card-action-position]`
 * CSS in `componentPolish.css`.
 */
import * as React from 'react';

import { Flex, FlexProps } from '../../primitives/Flex';

type CardActionPosition = 'end' | 'start';

type CardActionProps = Omit<FlexProps<'div'>, 'direction' | 'gap' | 'position'> & {
  position: CardActionPosition;
};

const CardAction = React.forwardRef<HTMLDivElement, CardActionProps>(
  ({ position, ...restProps }, forwardedRef) => {
    return (
      <Flex
        ref={forwardedRef}
        direction="row"
        gap={2}
        data-strapi-card-action=""
        data-strapi-card-action-position={position}
        {...restProps}
      />
    );
  },
);

export { CardAction };
export type { CardActionProps, CardActionPosition };
