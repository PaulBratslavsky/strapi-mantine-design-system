/**
 * Popover — drop-in port off styled-components.
 *
 * Behavior is still Radix Popover (Root/Trigger/Portal/Content/Anchor/
 * Arrow). The two styled-components wrappers are gone:
 *
 *   - PopoverContent (surface: bg, border, radius, shadow, z-index, slide
 *     animations) → CSS rules keyed on `[data-strapi-popover-content]`.
 *     The bg/border/radius/shadow/z all come from dedicated semantic
 *     tokens (--strapi-popover-*) so a theme can re-skin the floating
 *     surface without rebranding neutral0/neutral150.
 *
 *   - PopoverScrollArea (fixed-height scroll wrapper) → CSS rule on
 *     `[data-strapi-popover-scroll]` reading
 *     `--strapi-popover-scroll-height`.
 *
 * Radix's per-state attrs (`data-state='open|closed'`, `data-side='top|
 * bottom|left|right'`) drive the open/close animations from CSS.
 */
import * as React from 'react';

import * as Popover from '@radix-ui/react-popover';

import { stripReactIdOfColon } from '../../helpers/strings';
import { useComposedRefs } from '../../hooks/useComposeRefs';
import { useId } from '../../hooks/useId';
import { useIntersection } from '../../hooks/useIntersection';
import { Box } from '../../primitives/Box';
import { ScrollArea, ScrollAreaProps } from '../../utilities/ScrollArea';

/* -------------------------------------------------------------------------- */
/* Root                                                                       */
/* -------------------------------------------------------------------------- */

interface Props extends Popover.PopoverProps {}

const Root = Popover.Root;

/* -------------------------------------------------------------------------- */
/* Anchor                                                                     */
/* -------------------------------------------------------------------------- */

const Anchor = Popover.Anchor;

/* -------------------------------------------------------------------------- */
/* Arrow                                                                      */
/* -------------------------------------------------------------------------- */

const Arrow = Popover.Arrow;

/* -------------------------------------------------------------------------- */
/* Trigger                                                                    */
/* -------------------------------------------------------------------------- */

type TriggerElement = HTMLButtonElement;

interface TriggerProps extends Omit<Popover.PopoverTriggerProps, 'asChild'> {}

const Trigger = React.forwardRef<TriggerElement, TriggerProps>((props, forwardedRef) => {
  return <Popover.Trigger {...props} asChild ref={forwardedRef} />;
});

/* -------------------------------------------------------------------------- */
/* Content                                                                    */
/* -------------------------------------------------------------------------- */

type ContentElement = HTMLDivElement;

interface ContentProps extends Popover.PopoverContentProps {}

const Content = React.forwardRef<ContentElement, ContentProps>((props, forwardedRef) => {
  return (
    <Popover.Portal>
      <Popover.Content
        sideOffset={4}
        side="bottom"
        align="start"
        data-strapi-popover-content=""
        {...props}
        ref={forwardedRef}
      />
    </Popover.Portal>
  );
});

/* -------------------------------------------------------------------------- */
/* ScrollArea                                                                 */
/* -------------------------------------------------------------------------- */

interface ScrollAreaImplProps extends ScrollAreaProps {
  intersectionId?: string;
  onReachEnd?: (entry: IntersectionObserverEntry) => void;
}

const ScrollAreaImpl = React.forwardRef<HTMLDivElement, ScrollAreaImplProps>(
  ({ children, intersectionId, onReachEnd, ...props }, forwardedRef) => {
    const popoverRef = React.useRef<HTMLDivElement>(null!);
    const composedRef = useComposedRefs(popoverRef, forwardedRef);

    const generatedIntersectionId = useId();
    useIntersection(popoverRef, onReachEnd ?? (() => {}), {
      selectorToWatch: `#${stripReactIdOfColon(generatedIntersectionId)}`,
      skipWhen: !intersectionId || !onReachEnd,
    });

    return (
      <ScrollArea ref={composedRef} data-strapi-popover-scroll="" {...props}>
        {children}
        {intersectionId && onReachEnd && (
          <Box id={stripReactIdOfColon(generatedIntersectionId)} width="100%" height="1px" />
        )}
      </ScrollArea>
    );
  },
);

export { Root, Anchor, Trigger, Content, Arrow, ScrollAreaImpl as ScrollArea };
export type {
  Props,
  TriggerElement,
  TriggerProps,
  ContentProps,
  ContentElement,
  ScrollAreaImplProps as ScrollAreaProps,
};
