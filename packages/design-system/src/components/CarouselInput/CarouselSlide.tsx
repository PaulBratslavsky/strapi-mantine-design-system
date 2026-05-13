/**
 * CarouselSlide — drop-in port off styled-components.
 *
 * Only styled rule was conditional `display: flex` vs `display: none`
 * based on the `selected` prop. Replaced with `data-strapi-carousel-slide`
 * + `data-selected` attributes, CSS rule in `componentPolish.css`.
 */
import * as React from 'react';

import { Flex, FlexProps } from '../../primitives/Flex';

export interface CarouselSlideProps extends FlexProps {
  children: React.ReactNode;
  label: string;
  selected?: boolean;
}

export const CarouselSlide = ({ label, children, selected = false, ...props }: CarouselSlideProps) => (
  <Flex
    alignItems="center"
    role="group"
    aria-roledescription="slide"
    aria-label={label}
    justifyContent="center"
    height="124px"
    width="100%"
    data-strapi-carousel-slide=""
    data-selected={selected ? '' : undefined}
    {...props}
  >
    {children}
  </Flex>
);
