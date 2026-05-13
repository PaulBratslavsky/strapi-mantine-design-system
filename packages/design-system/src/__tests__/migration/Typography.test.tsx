/**
 * Phase 5e — Typography migration tests.
 *
 * Focuses on the migration-specific concerns:
 *   1. Resolver registration — Typography reachable via useDSComponent.
 *   2. DSProvider override swaps entire impl per-subtree.
 *   3. textColor maps onto Box's color prop → token resolution flows
 *      through MantineBox.
 *   4. Box-inherited props (margin, padding, fontWeight override) still
 *      work through translateBoxProps.
 *   5. data-strapi-typography + data-strapi-typography-variant hooks
 *      are stable CSS targets.
 */
import * as React from 'react';

import { render, screen } from '@test/utils';

import { Typography } from '../../primitives/Typography';
import { DSProvider } from '../../resolver';

describe('Typography migration', () => {
  it('textColor token resolves through Box → --strapi-color-* var', () => {
    render(<Typography textColor="primary600">x</Typography>);
    expect(screen.getByText('x')).toHaveStyle('color: var(--strapi-color-primary600)');
  });

  it('textDecoration passes through as inline style', () => {
    render(<Typography textDecoration="underline">x</Typography>);
    expect(screen.getByText('x')).toHaveStyle('text-decoration: underline');
  });

  it('Box-inherited padding still translates via MantineBox', () => {
    render(<Typography padding={2}>x</Typography>);
    expect(screen.getByText('x')).toHaveStyle('padding: var(--strapi-space-2)');
  });

  it('Box-inherited fontWeight override translates to --strapi-font-weight-*', () => {
    render(<Typography fontWeight="bold">x</Typography>);
    expect(screen.getByText('x')).toHaveStyle('font-weight: var(--strapi-font-weight-bold)');
  });

  it('composes through Box — data-strapi-box hook is present', () => {
    render(<Typography>x</Typography>);
    const node = screen.getByText('x');
    expect(node).toHaveAttribute('data-strapi-typography');
    expect(node).toHaveAttribute('data-strapi-box');
  });

  it('per-Typography DSProvider override swaps the entire impl', () => {
    const CustomTypography: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
      <em data-testid="custom-typography">{children}</em>
    );
    render(
      <DSProvider components={{ Typography: { default: CustomTypography } }}>
        <Typography>swap me</Typography>
      </DSProvider>,
    );
    expect(screen.getByTestId('custom-typography')).toHaveTextContent('swap me');
    expect(screen.getByTestId('custom-typography')).not.toHaveAttribute('data-strapi-typography');
  });
});
