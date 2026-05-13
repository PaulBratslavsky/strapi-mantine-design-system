/**
 * MantineModal — Mantine-backed implementation of Strapi's Modal compound.
 *
 * The legacy Modal was Radix Dialog + styled-components. This wrapper drops
 * both: Mantine's `<Modal>` provides behavior (portal, focus trap, scroll
 * lock, return focus, escape, click-outside), and a CSS rule in
 * `componentPolish.css` provides Strapi's visual tokens.
 *
 * Strapi compound (8 parts) → Mantine compound mapping:
 *   Modal.Root      — Strapi-only; provides ModalContext for Trigger/Close
 *                     coordination. Mantine has its own Modal context inside
 *                     `<Modal>` but it's scoped to within the modal body and
 *                     doesn't reach a sibling Trigger.
 *   Modal.Trigger   — Strapi-only; clones child to attach onClick→open.
 *                     (Mantine assumes consumers use useDisclosure manually.)
 *   Modal.Content   — wraps Mantine's `<Modal>` with controlled opened/onClose
 *                     pulled from ModalContext. Renders the modal panel +
 *                     overlay + portal.
 *   Modal.Close     — clones child to attach onClick→close. (Mantine has
 *                     CloseButton but it renders a default close button;
 *                     Strapi.Close wraps any child.)
 *   Modal.Header    — visual container with neutral100 bg + bottom border;
 *                     includes the default close button.
 *   Modal.Title     — Strapi Typography (omega+bold, h2 tag) — Mantine has
 *                     ModalTitle but we use Strapi's so a11y wiring works.
 *   Modal.Body      — scrollable content area with paddings.
 *   Modal.Footer    — visual container with neutral100 bg + top border.
 *
 * Controlled state preserved: consumers pass `open` / `onOpenChange` to
 * `Modal.Root` exactly as before. Internally we translate to Mantine's
 * `opened` / `onClose`.
 */
import * as React from 'react';

import { Modal as MantineModalBase } from '@mantine/core';
import { Cross } from '@strapi/icons';

import { Flex, type FlexProps } from '../../primitives/Flex';
import { Typography, type TypographyProps } from '../../primitives/Typography';
import { IconButton } from '../IconButton';

/* -------------------------------------------------------------------------- */
/* Shared context                                                             */
/* -------------------------------------------------------------------------- */

interface ModalContextValue {
  opened: boolean;
  setOpened: (open: boolean) => void;
}

const ModalContext = React.createContext<ModalContextValue | null>(null);

function useModalContext(part: string): ModalContextValue {
  const ctx = React.useContext(ModalContext);
  if (!ctx) {
    throw new Error(`<Modal.${part}> must be rendered inside <Modal.Root>`);
  }
  return ctx;
}

/* -------------------------------------------------------------------------- */
/* Root                                                                       */
/* -------------------------------------------------------------------------- */

interface RootProps {
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  /** Controlled open state. */
  open?: boolean;
  /** Called when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

const Root = ({ defaultOpen = false, open, onOpenChange, children }: RootProps) => {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen);
  const isControlled = open !== undefined;
  const opened = isControlled ? open : uncontrolled;

  const setOpened = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const value = React.useMemo<ModalContextValue>(() => ({ opened, setOpened }), [opened, setOpened]);

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};

/* -------------------------------------------------------------------------- */
/* Trigger                                                                    */
/* -------------------------------------------------------------------------- */

interface TriggerProps {
  children?: React.ReactNode;
}

const Trigger = React.forwardRef<HTMLElement, TriggerProps>(({ children }, ref) => {
  const { setOpened } = useModalContext('Trigger');

  if (!React.isValidElement(children)) {
    // Bare string/number children — wrap in a button so we can still attach onClick.
    return (
      <button type="button" ref={ref as React.Ref<HTMLButtonElement>} onClick={() => setOpened(true)}>
        {children}
      </button>
    );
  }

  // Clone the child to compose its onClick with our `open` action.
  type ChildProps = { onClick?: (e: React.MouseEvent) => void };
  const childOnClick = (children.props as ChildProps).onClick;
  return React.cloneElement(children, {
    ref,
    onClick: (event: React.MouseEvent) => {
      childOnClick?.(event);
      if (!event.defaultPrevented) setOpened(true);
    },
  } as Record<string, unknown>);
});
Trigger.displayName = 'Modal.Trigger';

/* -------------------------------------------------------------------------- */
/* Content                                                                    */
/* -------------------------------------------------------------------------- */

interface ContentProps {
  children?: React.ReactNode;
  /** Optional ID for the modal panel. */
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

const Content = React.forwardRef<HTMLDivElement, ContentProps>(({ children, id, className, style }, ref) => {
  const { opened, setOpened } = useModalContext('Content');

  return (
    <MantineModalBase
      ref={ref}
      opened={opened}
      onClose={() => setOpened(false)}
      withCloseButton={false}
      centered
      size="83rem"
      padding={0}
      radius="md"
      zIndex={310}
      id={id}
      className={className}
      style={style}
      data-strapi-modal=""
    >
      {children}
    </MantineModalBase>
  );
});
Content.displayName = 'Modal.Content';

/* -------------------------------------------------------------------------- */
/* Close                                                                      */
/* -------------------------------------------------------------------------- */

interface CloseProps {
  children?: React.ReactNode;
}

const Close = React.forwardRef<HTMLElement, CloseProps>(({ children }, ref) => {
  const { setOpened } = useModalContext('Close');

  if (!React.isValidElement(children)) {
    return (
      <button type="button" ref={ref as React.Ref<HTMLButtonElement>} onClick={() => setOpened(false)}>
        {children}
      </button>
    );
  }

  type ChildProps = { onClick?: (e: React.MouseEvent) => void };
  const childOnClick = (children.props as ChildProps).onClick;
  return React.cloneElement(children, {
    ref,
    onClick: (event: React.MouseEvent) => {
      childOnClick?.(event);
      if (!event.defaultPrevented) setOpened(false);
    },
  } as Record<string, unknown>);
});
Close.displayName = 'Modal.Close';

/* -------------------------------------------------------------------------- */
/* Header                                                                     */
/* -------------------------------------------------------------------------- */

interface HeaderProps extends Omit<FlexProps<'header'>, 'tag'> {
  /** @default 'Close modal' */
  closeLabel?: string;
}

const Header = React.forwardRef<HTMLElement, HeaderProps>(({ children, closeLabel = 'Close modal', ...rest }, ref) => {
  return (
    <Flex
      ref={ref}
      tag="header"
      padding={4}
      paddingLeft={5}
      paddingRight={5}
      background="neutral100"
      justifyContent="space-between"
      data-strapi-modal-header=""
      {...rest}
    >
      {children}
      <Close>
        <IconButton withTooltip={false} label={closeLabel}>
          <Cross />
        </IconButton>
      </Close>
    </Flex>
  );
});
Header.displayName = 'Modal.Header';

/* -------------------------------------------------------------------------- */
/* Title                                                                      */
/* -------------------------------------------------------------------------- */

interface TitleProps extends TypographyProps<'h2'> {}

const Title = React.forwardRef<HTMLHeadingElement, TitleProps>((props, ref) => {
  return <Typography ref={ref} tag="h2" variant="omega" fontWeight="bold" {...props} />;
});
Title.displayName = 'Modal.Title';

/* -------------------------------------------------------------------------- */
/* Body                                                                       */
/* -------------------------------------------------------------------------- */

interface BodyProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Body = React.forwardRef<HTMLDivElement, BodyProps>(({ children, className, style }, ref) => {
  return (
    <div ref={ref} className={className} style={style} data-strapi-modal-body="">
      {children}
    </div>
  );
});
Body.displayName = 'Modal.Body';

/* -------------------------------------------------------------------------- */
/* Footer                                                                     */
/* -------------------------------------------------------------------------- */

interface FooterProps extends Omit<FlexProps<'footer'>, 'tag'> {}

const Footer = React.forwardRef<HTMLElement, FooterProps>(({ children, ...rest }, ref) => {
  return (
    <Flex
      ref={ref}
      tag="footer"
      padding={4}
      paddingLeft={5}
      paddingRight={5}
      background="neutral100"
      justifyContent="space-between"
      data-strapi-modal-footer=""
      {...rest}
    >
      {children}
    </Flex>
  );
});
Footer.displayName = 'Modal.Footer';

/* -------------------------------------------------------------------------- */
/* Exports                                                                    */
/* -------------------------------------------------------------------------- */

export { Root, Trigger, Content, Close, Header, Title, Body, Footer };
export type { RootProps, TriggerProps, ContentProps, CloseProps, HeaderProps, TitleProps, BodyProps, FooterProps };
