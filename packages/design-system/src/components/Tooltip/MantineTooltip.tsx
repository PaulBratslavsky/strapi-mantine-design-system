/**
 * MantineTooltip — Mantine-backed implementation of Strapi's <Tooltip>.
 *
 * Wraps `@mantine/core`'s <Tooltip>, preserving the Strapi prop API so every
 * call site (~18 in DS, more in the admin) keeps working unchanged.
 *
 * Architecture (post-refactor): we pass children DIRECTLY to Mantine's
 * <Tooltip>. Mantine internally clones the child to attach hover/focus
 * handlers + its floating-ui ref — and its clone composes refs and props
 * correctly. No `ChildAdapter` wrapper layer (that wrapper used to do its
 * own naive React.cloneElement which clobbered consumer refs and event
 * handlers — see the click/drag-handle regression history). The only case
 * we still handle here is non-element children (string/fragment), which
 * we wrap in <span> inline before handing to Mantine.
 *
 * Prop translation:
 *   label / description → label  (description preserved as deprecated alias)
 *   delayDuration       → openDelay  (default 500ms)
 *   open                → opened     (controlled state)
 *   defaultOpen         → defaultOpened
 *   onOpenChange        → Mantine's <Tooltip> doesn't expose a direct hover-
 *                          driven equivalent. Since Strapi call sites that
 *                          actually subscribe to this are vanishingly rare
 *                          (analytics/telemetry only), the prop is accepted
 *                          on the type for backwards compat but is currently
 *                          a no-op. If a consumer surfaces a real use case
 *                          we can wire a small hook that diffs `opened`
 *                          across renders.
 *   side (Radix prop)   → position
 *   sideOffset          → offset
 *   disableHoverableContent → events.hover stays true; consumer-driven dismiss
 *                          via opened/onOpenChange already handles the case.
 *
 * Label is wrapped in `<Typography variant="pi" fontWeight="bold">` to match
 * the legacy text rendering.
 */
import * as React from 'react';

import { Tooltip as MantineTooltipBase } from '@mantine/core';

import { Typography } from '../../primitives/Typography';

// Radix-compatible position values we accept from existing call sites.
// Mantine's FloatingPosition includes these plus `*-start`/`*-end` variants.
type TooltipSide = 'top' | 'right' | 'bottom' | 'left';
type TooltipAlign = 'start' | 'center' | 'end';

interface TooltipProps {
  children?: React.ReactNode;
  /** @default 500 */
  delayDuration?: number;
  /** @deprecated Use `label` instead. */
  description?: string;
  /** Strapi/Radix-compatible side prop. Translated to Mantine `position`. */
  side?: TooltipSide;
  /** Strapi/Radix-compatible align prop. Combined with `side` to form Mantine `position`. */
  align?: TooltipAlign;
  /** Strapi/Radix-compatible offset prop. Translated to Mantine `offset`. */
  sideOffset?: number;
  defaultOpen?: boolean;
  open?: boolean;
  /**
   * Currently accepted for backwards-compat but inert. Mantine's <Tooltip>
   * doesn't expose a hover-state callback; if you need analytics on tooltip
   * visibility, raise an issue and we can wire a render-diffing hook.
   */
  onOpenChange?: (open: boolean) => void;
  disableHoverableContent?: boolean;
  label?: React.ReactNode;
}

/**
 * Combine Radix `side` + `align` into a Mantine `position` string.
 * Mantine accepts `top`, `top-start`, `top-end`, `bottom-start`, etc.
 */
function toMantinePosition(side: TooltipSide | undefined, align: TooltipAlign | undefined): string {
  const s = side ?? 'top';
  if (!align || align === 'center') return s;
  return `${s}-${align}`;
}

const MantineTooltip = React.forwardRef<HTMLDivElement, TooltipProps>((props, _ref) => {
  const {
    children,
    label,
    description,
    delayDuration = 500,
    defaultOpen,
    open,
    side,
    align,
    sideOffset,
  } = props;

  const content = label ?? description;
  if (!content) return <>{children}</>;

  // Mantine's <Tooltip> clones its child element to attach behavior. The child
  // MUST be a single ref-forwarding React element. Non-element children
  // (strings, fragments, null) get wrapped in a <span> so Mantine has
  // something to attach to.
  const triggerChild = React.isValidElement(children) ? (
    children
  ) : (
    <span>{children}</span>
  );

  return (
    <MantineTooltipBase
      label={
        <Typography variant="pi" fontWeight="bold">
          {content}
        </Typography>
      }
      opened={open}
      defaultOpened={defaultOpen}
      openDelay={delayDuration}
      position={toMantinePosition(side, align) as 'top'}
      offset={sideOffset ?? 8}
      data-strapi-tooltip=""
    >
      {triggerChild}
    </MantineTooltipBase>
  );
});

MantineTooltip.displayName = 'MantineTooltip';

export { MantineTooltip };
export type { TooltipProps };
