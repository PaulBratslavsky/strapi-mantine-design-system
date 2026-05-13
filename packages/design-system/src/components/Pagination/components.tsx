/**
 * Pagination components — drop-in port off styled-components.
 *
 * Three styled-components wrappers (LinkWrapper, ActionLinkWrapper,
 * PageLinkWrapper) and the shared `focus` mixin from styles/buttons.ts
 * replaced by data-attribute hooks + CSS rules in `componentPolish.css`:
 *
 *   [data-strapi-pagination-link]            — common padding + radius
 *   [data-strapi-pagination-link][data-active] — active page (filterShadow)
 *   [data-strapi-pagination-action-link]      — chevron icons + colors
 *   [data-strapi-pagination-page-link]        — page-number active state
 *
 * focus ring (legacy `focus` mixin) replicated as a generic
 * `[data-strapi-pagination-link]:focus-visible::after` rule.
 */
import * as React from 'react';

import { ChevronLeft, ChevronRight } from '@strapi/icons';

import { Box, BoxProps } from '../../primitives/Box';
import { Typography } from '../../primitives/Typography';
import { PolymorphicRef } from '../../types';
import { forwardRef } from '../../utilities/forwardRef';
import { VisuallyHidden } from '../../utilities/VisuallyHidden';
import { BaseLink, BaseLinkProps } from '../BaseLink';

import { usePagination } from './PaginationContext';

/* -------------------------------------------------------------------------- */
/* Next / Prev                                                                */
/* -------------------------------------------------------------------------- */

type PaginationLinkProps<C extends React.ElementType = 'a'> = BaseLinkProps<C>;

const PreviousLink = forwardRef(
  <C extends React.ElementType = 'a'>({ children, ...props }: PaginationLinkProps<C>, ref: PolymorphicRef<C>) => {
    const { activePage } = usePagination();
    const disabled = activePage === 1;
    return (
      <BaseLink
        ref={ref}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
        data-strapi-pagination-link=""
        data-strapi-pagination-action-link=""
        {...props}
      >
        <VisuallyHidden>{children}</VisuallyHidden>
        <ChevronLeft aria-hidden />
      </BaseLink>
    );
  },
);

type PreviousLinkComponent<C extends React.ElementType = 'a'> = (props: PaginationLinkProps<C>) => React.ReactNode;

const NextLink = forwardRef(
  <C extends React.ElementType = 'a'>({ children, ...props }: PaginationLinkProps<C>, ref: PolymorphicRef<C>) => {
    const { activePage, pageCount } = usePagination();
    const disabled = activePage === pageCount;
    return (
      <BaseLink
        ref={ref}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
        data-strapi-pagination-link=""
        data-strapi-pagination-action-link=""
        {...props}
      >
        <VisuallyHidden>{children}</VisuallyHidden>
        <ChevronRight aria-hidden />
      </BaseLink>
    );
  },
);

type NextLinkComponent<C extends React.ElementType = 'a'> = (props: PaginationLinkProps<C>) => React.ReactNode;

/* -------------------------------------------------------------------------- */
/* PageLink                                                                   */
/* -------------------------------------------------------------------------- */

type PaginationPageLinkProps<C extends React.ElementType = 'a'> = PaginationLinkProps<C> & {
  number: number;
};

const PageLink = forwardRef(
  <C extends React.ElementType = 'a'>(
    { number, children, ...props }: PaginationPageLinkProps<C>,
    ref: PolymorphicRef<C>,
  ) => {
    const { activePage } = usePagination();
    const isActive = activePage === number;

    return (
      <BaseLink
        ref={ref}
        aria-current={isActive}
        data-strapi-pagination-link=""
        data-strapi-pagination-page-link=""
        data-active={isActive ? '' : undefined}
        {...props}
      >
        <VisuallyHidden>{children}</VisuallyHidden>
        <Typography aria-hidden fontWeight={isActive ? 'bold' : undefined} lineHeight="revert" variant="pi">
          {number}
        </Typography>
      </BaseLink>
    );
  },
);

type PageLinkComponent<C extends React.ElementType = 'a'> = (props: PaginationPageLinkProps<C>) => React.ReactNode;

/* -------------------------------------------------------------------------- */
/* Dots                                                                       */
/* -------------------------------------------------------------------------- */

interface DotsProps extends BoxProps {}

const Dots = ({ children, ...props }: DotsProps) => (
  <Box {...props}>
    <VisuallyHidden>{children}</VisuallyHidden>
    <Typography aria-hidden lineHeight="revert" textColor="neutral800" variant="pi">
      …
    </Typography>
  </Box>
);

export { Dots, NextLink, PageLink, PreviousLink };
export type {
  PaginationLinkProps,
  PaginationPageLinkProps,
  DotsProps,
  PageLinkComponent,
  PreviousLinkComponent,
  NextLinkComponent,
};
