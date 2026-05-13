/**
 * Avatar — drop-in port off styled-components.
 *
 * Still uses Radix Avatar + Tooltip for behavior (image-load lifecycle,
 * fallback, tooltip preview on hover). The styled-components rules
 * (circular shape, 3.2rem size, neighbor margin overlap for Avatar.Group)
 * moved to `componentPolish.css` keyed on `data-strapi-avatar*` hooks.
 *
 * Radix stays — Mantine has Avatar but Radix's load-status callback +
 * tooltip composition is what the legacy uses for preview-on-hover.
 */
import * as React from 'react';

import * as Avatar from '@radix-ui/react-avatar';
import * as Tooltip from '@radix-ui/react-tooltip';

import { useControllableState } from '../../hooks/useControllableState';
import { Box } from '../../primitives/Box';
import { Flex, FlexProps } from '../../primitives/Flex';
import { Typography } from '../../primitives/Typography';

/* -------------------------------------------------------------------------- */
/* Item                                                                       */
/* -------------------------------------------------------------------------- */

type ItemElement = HTMLSpanElement;

interface ItemProps
  extends Avatar.AvatarProps,
    Pick<Avatar.AvatarImageProps, 'onLoadingStatusChange' | 'src' | 'alt'> {
  /** @default 600 */
  delayMs?: Avatar.AvatarFallbackProps['delayMs'];
  fallback: React.ReactNode;
  /** @default false — preview the image in a tooltip on hover when true. */
  preview?: boolean;
}

const Item = React.forwardRef<ItemElement, ItemProps>(
  (
    { onLoadingStatusChange, delayMs = 600, src, alt, fallback, preview = false, ...restProps },
    forwardedRef,
  ) => {
    const [loadingStatus, setLoadingStatus] = useControllableState({
      onChange: onLoadingStatusChange,
    });
    const [tooltipOpen, setTooltipOpen] = React.useState(false);

    const hasPreview = preview && loadingStatus === 'loaded';

    const handleTooltipOpen = (isOpen: boolean) => {
      if (hasPreview) setTooltipOpen(isOpen);
    };

    return (
      <Tooltip.Root onOpenChange={handleTooltipOpen}>
        <Tooltip.Trigger asChild>
          <Avatar.Root ref={forwardedRef} data-strapi-avatar-root="" {...restProps}>
            {hasPreview ? (
              <Box
                width="100%"
                height="100%"
                position="absolute"
                background="neutral0"
                zIndex="overlay"
                data-strapi-avatar-overlay=""
                style={{ opacity: tooltipOpen ? 0.4 : 0 }}
              />
            ) : null}
            <Avatar.Image
              src={src}
              alt={alt}
              onLoadingStatusChange={setLoadingStatus}
              data-strapi-avatar-image=""
            />
            <Avatar.Fallback delayMs={delayMs}>
              <Typography fontWeight="bold" textTransform="uppercase">
                {fallback}
              </Typography>
            </Avatar.Fallback>
          </Avatar.Root>
        </Tooltip.Trigger>
        {hasPreview ? (
          <Tooltip.Portal>
            <Tooltip.Content side="top" sideOffset={4} data-strapi-avatar-preview="">
              <img src={src} alt={alt} data-strapi-avatar-image="" />
            </Tooltip.Content>
          </Tooltip.Portal>
        ) : null}
      </Tooltip.Root>
    );
  },
);

/* -------------------------------------------------------------------------- */
/* Group                                                                      */
/* -------------------------------------------------------------------------- */

type GroupElement = HTMLDivElement;

interface GroupProps extends Omit<FlexProps, 'tag'> {}

const Group = React.forwardRef<GroupElement, GroupProps>((props, forwardedRef) => {
  return <Flex {...props} ref={forwardedRef} tag="div" data-strapi-avatar-group="" />;
});

export { Item, Group };
export type { ItemElement, ItemProps, GroupElement, GroupProps };
