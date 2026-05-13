/**
 * SubNavLinkSection — drop-in port off styled-components.
 *
 * Only styled rule was on an internal `button` element — reset border /
 * padding / background, with flex alignment. Moved to
 * `[data-strapi-subnav-link-section-button]` CSS rule.
 */
import * as React from 'react';

import { CaretDown } from '@strapi/icons';

import { useId } from '../../hooks/useId';
import { Box } from '../../primitives/Box';
import { Flex } from '../../primitives/Flex';
import { Typography } from '../../primitives/Typography';

export interface SubNavLinkSectionProps {
  children: React.ReactNode;
  id?: string;
  label: string;
}

export const SubNavLinkSection = ({ label, children, id }: SubNavLinkSectionProps) => {
  const [isOpen, setOpenLinks] = React.useState(true);
  const listId = useId(id);

  const handleClick = () => {
    setOpenLinks((prev) => !prev);
  };

  return (
    <Box>
      <Box paddingLeft={7} paddingTop={2} paddingBottom={2} paddingRight={4}>
        <Flex justifyContent="space-between">
          <button
            onClick={handleClick}
            aria-expanded={isOpen}
            aria-controls={listId}
            data-strapi-subnav-link-section-button=""
          >
            <CaretDown
              width="1.2rem"
              height="1.2rem"
              aria-hidden
              fill="neutral700"
              style={{ transform: `rotateX(${isOpen ? '0deg' : '180deg'})` }}
            />
            <Box paddingLeft={2}>
              <Typography tag="span" fontWeight="semiBold" textColor="neutral800">
                {label}
              </Typography>
            </Box>
          </button>
        </Flex>
      </Box>
      {isOpen && (
        <ul id={listId}>
          {React.Children.map(children, (child, index) => {
            // eslint-disable-next-line react/no-array-index-key
            return <li key={index}>{child}</li>;
          })}
        </ul>
      )}
    </Box>
  );
};
