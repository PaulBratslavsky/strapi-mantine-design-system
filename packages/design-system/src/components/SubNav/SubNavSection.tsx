/**
 * SubNavSection — drop-in port off styled-components.
 *
 * Only styled rule sized + colored the chevron `svg` next to the section
 * label. Moved to `[data-strapi-subnav-section] > svg` rule in
 * componentPolish.css.
 */
import * as React from 'react';

import { useId } from '../../hooks/useId';
import { Box } from '../../primitives/Box';
import { Flex } from '../../primitives/Flex';
import { Badge } from '../Badge';

import { SubNavSectionLabel } from './SubNavSectionLabel';

export interface SubNavSectionProps {
  badgeLabel?: string;
  children: React.ReactNode;
  collapsable?: boolean;
  id?: string;
  label: string;
}

export const SubNavSection = ({ collapsable = false, label, badgeLabel, children, id }: SubNavSectionProps) => {
  const [isOpen, setOpenLinks] = React.useState(true);
  const listId = useId(id);

  const handleClick = () => {
    setOpenLinks((prev) => !prev);
  };

  return (
    <Flex direction="column" alignItems="stretch" gap={1}>
      <Box paddingLeft={6} paddingTop={2} paddingBottom={2} paddingRight={4} data-strapi-subnav-section="">
        <Box position="relative" paddingRight={badgeLabel ? 6 : 0}>
          <SubNavSectionLabel
            onClick={handleClick}
            ariaExpanded={isOpen}
            ariaControls={listId}
            collapsable={collapsable}
            label={label}
          />
          {badgeLabel && (
            <Badge
              backgroundColor="neutral150"
              textColor="neutral600"
              position="absolute"
              right={0}
              top="50%"
              transform="translateY(-50%)"
            >
              {badgeLabel}
            </Badge>
          )}
        </Box>
      </Box>
      {(!collapsable || isOpen) && (
        <ol id={listId}>
          {React.Children.map(children, (child, index) => {
            // eslint-disable-next-line react/no-array-index-key
            return <li key={index}>{child}</li>;
          })}
        </ol>
      )}
    </Flex>
  );
};
