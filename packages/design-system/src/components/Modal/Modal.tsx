/**
 * Public Modal entry — re-exports the Mantine-backed compound parts.
 *
 * Modal is a *namespace*, not a single component (`export * as Modal from
 * './Modal'` in index.ts). Unlike Box/Flex/Button which register a single
 * resolver entry, Modal's compound is 8 parts each with its own concerns
 * — we don't currently expose per-part resolver overrides because no
 * consumer needs them. If that changes, register each part under a dotted
 * name (`'Modal.Root'`, `'Modal.Content'`, etc.) in the resolver.
 *
 * The legacy implementation lives in `./legacy/LegacyModal` and uses Radix
 * Dialog + styled-components. Phase 8 will delete it.
 */
export { Root, Trigger, Content, Close, Header, Title, Body, Footer } from './MantineModal';

export type {
  RootProps as Props,
  TriggerProps,
  ContentProps,
  CloseProps,
  HeaderProps,
  TitleProps,
  BodyProps,
  FooterProps,
} from './MantineModal';
