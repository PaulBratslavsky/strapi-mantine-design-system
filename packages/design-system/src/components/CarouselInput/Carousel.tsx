/**
 * Carousel — drop-in port off styled-components.
 *
 * CSS grid layout (`grid-template-columns: auto 1fr auto`,
 * `grid-template-areas: 'startAction slides endAction'`) + per-action grid
 * area + chevron hover/focus color moved to `componentPolish.css` keyed on
 * `[data-strapi-carousel-grid]` + `[data-strapi-carousel-action]` +
 * `data-area="..."`.
 */
import * as React from 'react';

import { ChevronRight, ChevronLeft } from '@strapi/icons';

import { KeyboardKeys } from '../../helpers/keyboardKeys';
import { Box, BoxProps } from '../../primitives/Box';
import { Flex } from '../../primitives/Flex';
import { Typography } from '../../primitives/Typography';
import { AccessibleIcon } from '../../utilities/AccessibleIcon';
import { Tooltip } from '../Tooltip';

export interface CarouselProps extends BoxProps {
  actions?: React.ReactNode;
  children: React.ReactNode;
  label: string;
  nextLabel: string;
  onNext?: () => void;
  onPrevious?: () => void;
  previousLabel: string;
  secondaryLabel?: string;
  selectedSlide: number;
}

export type CarouselElement = HTMLDivElement;

export const Carousel = React.forwardRef<CarouselElement, CarouselProps>(
  (
    {
      actions,
      children,
      label,
      nextLabel,
      onNext,
      onPrevious,
      previousLabel,
      secondaryLabel,
      selectedSlide,
      ...props
    },
    forwardedRef,
  ) => {
    const prevActionRef = React.useRef<HTMLButtonElement>(null);
    const nextActionRef = React.useRef<HTMLButtonElement>(null);

    const childrenArray = React.Children.map(children, (node, index) =>
      React.cloneElement(node as React.ReactElement, { selected: index === selectedSlide }),
    );

    const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
      switch (event.key) {
        case KeyboardKeys.RIGHT: {
          event.preventDefault();
          if (nextActionRef?.current) nextActionRef.current.focus();
          if (onNext) onNext();
          break;
        }
        case KeyboardKeys.LEFT: {
          event.preventDefault();
          if (prevActionRef?.current) prevActionRef.current.focus();
          if (onPrevious) onPrevious();
          break;
        }
        default:
          break;
      }
    };

    return (
      <Box ref={forwardedRef} {...props} onKeyDown={handleKeyDown}>
        <Box padding={2} borderColor="neutral200" hasRadius background="neutral100">
          <Box
            tag="section"
            aria-roledescription="carousel"
            aria-label={label}
            display="grid"
            position="relative"
            data-strapi-carousel-grid=""
          >
            {childrenArray && childrenArray.length > 1 && (
              <>
                <Box
                  tag="button"
                  onClick={onPrevious}
                  ref={prevActionRef}
                  type="button"
                  data-strapi-carousel-action=""
                  data-area="startAction"
                >
                  <AccessibleIcon label={previousLabel}>
                    <ChevronLeft width="1.6rem" height="1.6rem" fill="neutral600" />
                  </AccessibleIcon>
                </Box>

                <Box
                  tag="button"
                  onClick={onNext}
                  ref={nextActionRef}
                  type="button"
                  data-strapi-carousel-action=""
                  data-area="endAction"
                >
                  <AccessibleIcon label={nextLabel}>
                    <ChevronRight width="1.6rem" height="1.6rem" fill="neutral600" />
                  </AccessibleIcon>
                </Box>
              </>
            )}

            <Flex
              aria-live="polite"
              paddingLeft={2}
              paddingRight={2}
              width="100%"
              overflow="hidden"
              data-strapi-carousel-slides=""
            >
              {childrenArray}
            </Flex>
            {actions}
          </Box>

          {secondaryLabel && (
            <Box paddingTop={2} paddingLeft={4} paddingRight={4}>
              <Tooltip label={secondaryLabel}>
                <Flex justifyContent="center">
                  <Typography variant="pi" textColor="neutral600" ellipsis>
                    {secondaryLabel}
                  </Typography>
                </Flex>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
);
