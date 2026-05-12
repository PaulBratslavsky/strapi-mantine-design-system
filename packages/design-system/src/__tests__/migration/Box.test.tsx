/**
 * Phase 5c — Box migration tests.
 *
 * Box.test.tsx (in primitives/Box/) verifies the Box-on-Mantine contract.
 * This file focuses on the migration-specific concerns:
 *   1. Resolver registration — Box is reachable via useDSComponent
 *   2. DSProvider override swaps the entire impl per-subtree
 *   3. Strapi shadow tokens resolve to --strapi-shadow-* vars
 *   4. hasRadius boolean applies the default radius token
 *   5. Responsive prop objects pass through to Mantine intact
 *   6. Theme-named font-weight tokens resolve to --strapi-font-weight-* vars
 */
import * as React from 'react';

import { getRoot, render, screen } from '@test/utils';

import { Box } from '../../primitives/Box';
import { DSProvider } from '../../resolver';

describe('Box migration', () => {
  it('hasRadius applies the default radius token', () => {
    const { container } = render(<Box hasRadius />);
    expect(getRoot(container)).toHaveStyle('border-radius: var(--strapi-radius)');
  });

  it('shadow="filterShadow" resolves to --strapi-shadow-filter', () => {
    const { container } = render(<Box shadow="filterShadow" />);
    expect(getRoot(container)).toHaveStyle('box-shadow: var(--strapi-shadow-filter)');
  });

  it('shadow="popupShadow" resolves to --strapi-shadow-popup', () => {
    const { container } = render(<Box shadow="popupShadow" />);
    expect(getRoot(container)).toHaveStyle('box-shadow: var(--strapi-shadow-popup)');
  });

  it('borderColor without borderStyle auto-applies solid + 1px (legacy parity)', () => {
    const { container } = render(<Box borderColor="primary600" />);
    const root = getRoot(container);
    expect(root).toHaveStyle('border-color: var(--strapi-color-primary600)');
    expect(root).toHaveStyle('border-style: solid');
    expect(root).toHaveStyle('border-width: 1px');
  });

  it('fontWeight token resolves to --strapi-font-weight-*', () => {
    const { container } = render(<Box fontWeight="bold" />);
    expect(getRoot(container)).toHaveStyle('font-weight: var(--strapi-font-weight-bold)');
  });

  it('fontWeight semiBold becomes kebab-case in the CSS var', () => {
    const { container } = render(<Box fontWeight="semiBold" />);
    expect(getRoot(container)).toHaveStyle('font-weight: var(--strapi-font-weight-semi-bold)');
  });

  it('cursor passes through as inline style', () => {
    const { container } = render(<Box cursor="pointer" />);
    expect(getRoot(container)).toHaveStyle('cursor: pointer');
  });

  it('zIndex passes through as inline style', () => {
    const { container } = render(<Box zIndex={100} />);
    expect(getRoot(container)).toHaveStyle('z-index: 100');
  });

  it('renders a data-strapi-box hook for app-side CSS overrides', () => {
    const { container } = render(<Box>x</Box>);
    expect(getRoot(container)).toHaveAttribute('data-strapi-box');
  });

  it('per-Box DSProvider override swaps the entire impl', () => {
    const CustomBox: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
      <section data-testid="custom-box">{children}</section>
    );

    render(
      <DSProvider components={{ Box: { default: CustomBox } }}>
        <Box>swap me</Box>
      </DSProvider>,
    );

    expect(screen.getByTestId('custom-box')).toHaveTextContent('swap me');
    expect(screen.getByTestId('custom-box')).not.toHaveAttribute('data-strapi-box');
  });
});
