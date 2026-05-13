/**
 * Dialog — drop-in port off styled-components.
 *
 * Substrate is still Radix AlertDialog (Root / Trigger / Portal / Overlay /
 * Content / Title / Description / Cancel / Action). The four styled
 * wrappers are gone:
 *
 *   - Overlay (fixed backdrop, neutral800 at 20% alpha, fade-in animation)
 *     → CSS rules on `[data-strapi-dialog-overlay]` reading semantic
 *       tokens (`--strapi-dialog-overlay-*`).
 *
 *   - ContentImpl (centered modal panel, bg + radius + shadow + pop-in/out
 *     animations) → `[data-strapi-dialog-content]` rules driven by
 *     `--strapi-dialog-*` semantic tokens.
 *
 *   - Title (centered heading with bottom border) →
 *     `[data-strapi-dialog-title]` rules.
 *
 *   - Foot (footer with top border) → `[data-strapi-dialog-footer]` rules.
 *
 * Radix's per-state attrs (`data-state='open|closed'`) drive the
 * pop-in/pop-out animations from CSS. Themes re-skin the modal surface,
 * the backdrop tint/opacity, or the panel border colors independently
 * by overriding the dedicated tokens — no need to rebrand neutral0/800.
 */
import * as React from 'react';

import * as AlertDialog from '@radix-ui/react-alert-dialog';

import { Flex, FlexProps } from '../../primitives/Flex';
import { Typography, TypographyProps } from '../../primitives/Typography';

/* -------------------------------------------------------------------------- */
/* Root                                                                       */
/* -------------------------------------------------------------------------- */

interface Props extends AlertDialog.AlertDialogProps {}

const Root = AlertDialog.Root;

/* -------------------------------------------------------------------------- */
/* Trigger                                                                    */
/* -------------------------------------------------------------------------- */

type TriggerElement = HTMLButtonElement;

interface TriggerProps extends Omit<AlertDialog.AlertDialogTriggerProps, 'asChild'> {}

const Trigger = React.forwardRef<TriggerElement, TriggerProps>((props, forwardedRef) => {
  return <AlertDialog.Trigger {...props} asChild ref={forwardedRef} />;
});

/* -------------------------------------------------------------------------- */
/* Content (Overlay + Content panel)                                          */
/* -------------------------------------------------------------------------- */

type ContentElement = HTMLDivElement;

interface ContentProps extends AlertDialog.AlertDialogContentProps {}

const Content = React.forwardRef<ContentElement, ContentProps>((props, forwardedRef) => {
  return (
    <AlertDialog.Portal>
      <AlertDialog.Overlay data-strapi-dialog-overlay="">
        <AlertDialog.Content data-strapi-dialog-content="" {...props} ref={forwardedRef} />
      </AlertDialog.Overlay>
    </AlertDialog.Portal>
  );
});

/* -------------------------------------------------------------------------- */
/* Header (Title)                                                             */
/* -------------------------------------------------------------------------- */

type HeaderElement = HTMLHeadingElement;

interface HeaderProps extends TypographyProps<'h2'> {}

const Header = React.forwardRef<HeaderElement, HeaderProps>(({ children, ...restProps }, forwardedRef) => {
  return (
    <AlertDialog.Title asChild>
      <Typography<'h2'>
        tag="h2"
        variant="beta"
        ref={forwardedRef}
        padding={6}
        fontWeight="bold"
        data-strapi-dialog-title=""
        {...restProps}
      >
        {children}
      </Typography>
    </AlertDialog.Title>
  );
});

/* -------------------------------------------------------------------------- */
/* Body                                                                       */
/* -------------------------------------------------------------------------- */

type BodyElement = HTMLDivElement;

interface BodyProps extends Omit<FlexProps<'div'>, 'tag'> {
  /**
   * Optional icon to display, only rendered if children is a string.
   * If provided, it is given the height & width of 24px.
   */
  icon?: React.ReactElement;
}

const Body = React.forwardRef<BodyElement, BodyProps>(({ children, icon, ...restProps }, forwardedRef) => {
  return (
    <Flex
      ref={forwardedRef}
      gap={2}
      direction="column"
      paddingTop={8}
      paddingBottom={8}
      paddingLeft={6}
      paddingRight={6}
      {...restProps}
    >
      {typeof children === 'string' ? (
        <>
          {icon
            ? React.cloneElement(icon, {
                width: 24,
                height: 24,
              })
            : null}
          <Description>{children}</Description>
        </>
      ) : (
        children
      )}
    </Flex>
  );
});

/* -------------------------------------------------------------------------- */
/* Description                                                                */
/* -------------------------------------------------------------------------- */

type DescriptionElement = HTMLParagraphElement;

interface DescriptionProps extends Omit<TypographyProps<'p'>, 'tag'> {}

const Description = React.forwardRef<DescriptionElement, DescriptionProps>((props, forwardedRef) => {
  return (
    <AlertDialog.Description asChild>
      <Typography ref={forwardedRef} variant="omega" {...props} tag="p" />
    </AlertDialog.Description>
  );
});

/* -------------------------------------------------------------------------- */
/* Footer                                                                     */
/* -------------------------------------------------------------------------- */

type FooterElement = HTMLDivElement;

interface FooterProps extends Omit<FlexProps<'footer'>, 'tag'> {}

const Footer = React.forwardRef<FooterElement, FooterProps>((props, forwardedRef) => {
  return (
    <Flex
      ref={forwardedRef}
      gap={2}
      padding={4}
      justifyContent="space-between"
      flex={1}
      data-strapi-dialog-footer=""
      {...props}
      tag="footer"
    />
  );
});

/* -------------------------------------------------------------------------- */
/* Cancel                                                                     */
/* -------------------------------------------------------------------------- */

type CancelElement = HTMLButtonElement;

interface CancelProps extends Omit<AlertDialog.AlertDialogCancelProps, 'asChild'> {}

const Cancel = React.forwardRef<CancelElement, CancelProps>((props, forwardedRef) => {
  return <AlertDialog.Cancel {...props} asChild ref={forwardedRef} />;
});

/* -------------------------------------------------------------------------- */
/* Action                                                                     */
/* -------------------------------------------------------------------------- */

type ActionElement = HTMLButtonElement;

interface ActionProps extends Omit<AlertDialog.AlertDialogActionProps, 'asChild'> {}

const Action = React.forwardRef<ActionElement, ActionProps>((props, forwardedRef) => {
  return <AlertDialog.Action {...props} asChild ref={forwardedRef} />;
});

export { Root, Trigger, Content, Header, Body, Description, Footer, Cancel, Action };
export type {
  Props,
  TriggerElement,
  TriggerProps,
  ContentElement,
  ContentProps,
  HeaderElement,
  HeaderProps,
  BodyElement,
  BodyProps,
  DescriptionElement,
  DescriptionProps,
  FooterElement,
  FooterProps,
  CancelElement,
  CancelProps,
  ActionElement,
  ActionProps,
};
