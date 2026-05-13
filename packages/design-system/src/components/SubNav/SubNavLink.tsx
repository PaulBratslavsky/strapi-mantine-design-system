/**
 * SubNavLink — drop-in port off styled-components.
 *
 * BaseLink with sub-nav-specific styling: bullet/icon indicator on the
 * left, active-state primary tint + right border, neutral defaults. All
 * styling moved to `[data-strapi-subnav-link*]` / `[data-strapi-subnav-
 * bullet*]` CSS rules in componentPolish.css.
 */
import * as React from 'react';

import { Flex } from '../../primitives/Flex';
import { Typography } from '../../primitives/Typography';
import { PolymorphicRef } from '../../types';
import { forwardRef } from '../../utilities/forwardRef';
import { BaseLink, BaseLinkProps } from '../BaseLink';

type SubNavLinkProps<C extends React.ElementType> = BaseLinkProps<C> & {
  active?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  isSubSectionChild?: boolean;
  withBullet?: boolean;
};

const SubNavLink = forwardRef(
  <C extends React.ElementType = 'a'>(
    {
      active,
      children,
      icon = null,
      withBullet = false,
      isSubSectionChild = false,
      ...props
    }: SubNavLinkProps<C>,
    ref: PolymorphicRef<C>,
  ) => {
    return (
      <BaseLink
        background="neutral100"
        paddingLeft={isSubSectionChild ? 9 : 7}
        paddingBottom={2}
        paddingTop={2}
        ref={ref}
        data-strapi-subnav-link=""
        {...props}
      >
        <Flex>
          {icon ? (
            <div data-strapi-subnav-link-icon="">{icon}</div>
          ) : (
            <span data-strapi-subnav-bullet="" data-active={active ? '' : undefined} />
          )}
          <Typography paddingLeft={2}>{children}</Typography>
        </Flex>
        {withBullet && (
          <Flex paddingRight={4}>
            <span data-strapi-subnav-bullet="" data-active="" />
          </Flex>
        )}
      </BaseLink>
    );
  },
);

type SubNavLinkComponent<C extends React.ElementType> = (props: SubNavLinkProps<C>) => React.ReactNode;

export { SubNavLink };
export type { SubNavLinkProps, SubNavLinkComponent };
