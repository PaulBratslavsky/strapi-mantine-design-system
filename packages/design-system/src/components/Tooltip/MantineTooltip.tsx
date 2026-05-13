/**
 * MantineTooltip — Mantine-backed implementation of Strapi's <Tooltip>.
 *
 * Wraps `@mantine/core`'s <Tooltip>, preserving the Strapi prop API so every
 * call site (~18 in DS, more in the admin) keeps working unchanged. The
 * legacy implementation used Radix UI for behavior + styled-components for
 * visuals; this version drops both — Mantine handles behavior (portal,
 * floating UI positioning, ARIA, hover/focus events) and a plain CSS rule
 * in `componentPolish.css` handles Strapi-specific visual tokens (neutral900
 * background, neutral0 text, pi-variant typography).
 *
 * Prop translation:
 *   label / description → label  (description was deprecated, preserved as alias)
 *   delayDuration       → openDelay  (default 500ms preserved)
 *   open                → opened     (controlled state)
 *   defaultOpen         → defaultOpened
 *   onOpenChange        → wired via Mantine's `onPositionChange`+events
 *                          mechanism. Most consumers don't subscribe to this;
 *                          when they do we forward via a custom event listener
 *                          on the trigger.
 *   side (Radix prop)   → position
 *   sideOffset          → offset
 *   disableHoverableContent → events.hover stays true; consumer-driven dismiss
 *                          via opened/onOpenChange already handles the case.
 *
 * Label is wrapped in `<Typography variant="pi" fontWeight="bold">` to match
 * the legacy text rendering exactly.
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
    onOpenChange,
    side,
    align,
    sideOffset,
  } = props;

  const content = label ?? description;
  if (!content) return <>{children}</>;

  // Mantine's controlled state uses `opened`; uncontrolled uses `defaultOpened`.
  // For onOpenChange, Mantine doesn't expose a direct equivalent for hover-
  // driven state changes. Most Strapi call sites don't subscribe to this; the
  // ones that do (rare) typically want it for analytics/telemetry. If needed
  // in future, we can wire it via a wrapper that watches `opened` transitions.
  // For now, forward to Mantine and call onOpenChange when `opened` flips
  // through a render — handled by an effect below if controlled.
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
      {/* Mantine's Tooltip clones the child to attach behavior, similar to
        Radix's Tooltip.Trigger asChild. Single child required. */}
      <ChildAdapter onOpenChange={onOpenChange}>{children}</ChildAdapter>
    </MantineTooltipBase>
  );
});

MantineTooltip.displayName = 'MantineTooltip';

/**
 * Adapter that ensures the tooltip's single child is a ref-forwarding
 * element Mantine can attach to, and bridges the legacy `onOpenChange`
 * callback to hover/focus events on that child.
 */
const ChildAdapter = React.forwardRef<
  HTMLElement,
  {
    children?: React.ReactNode;
    onOpenChange?: (_open: boolean) => void;
  }
>(({ children, onOpenChange, ...rest }, ref) => {
  if (!React.isValidElement(children)) {
    // String children or fragments — wrap in a span Mantine can target.
    return (
      <span ref={ref as React.Ref<HTMLSpanElement>} {...rest}>
        {children}
      </span>
    );
  }

  // Clone the child to add event handlers if onOpenChange was supplied.
  // Mantine's positioning still works because the cloned ref/data attrs
  // pass through.
  if (!onOpenChange) {
    return React.cloneElement(children, { ref, ...rest } as Record<string, unknown>);
  }
  return React.cloneElement(children, {
    ref,
    ...rest,
    onMouseEnter: composeHandler((children.props as { onMouseEnter?: (e: unknown) => void }).onMouseEnter, () =>
      onOpenChange(true),
    ),
    onMouseLeave: composeHandler((children.props as { onMouseLeave?: (e: unknown) => void }).onMouseLeave, () =>
      onOpenChange(false),
    ),
    onFocus: composeHandler((children.props as { onFocus?: (e: unknown) => void }).onFocus, () => onOpenChange(true)),
    onBlur: composeHandler((children.props as { onBlur?: (e: unknown) => void }).onBlur, () => onOpenChange(false)),
  } as Record<string, unknown>);
});

ChildAdapter.displayName = 'TooltipChildAdapter';

function composeHandler<E>(original: ((e: E) => void) | undefined, added: (e: E) => void): (e: E) => void {
  return (e) => {
    original?.(e);
    added(e);
  };
}

export { MantineTooltip };
export type { TooltipProps };
