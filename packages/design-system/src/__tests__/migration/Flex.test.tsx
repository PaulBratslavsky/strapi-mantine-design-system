/**
 * Phase 5d — Flex migration tests.
 *
 * Verifies:
 *   1. Default behavior matches legacy (display: flex, align-items: center,
 *      flex-direction: row).
 *   2. `direction="column"` flips flex-direction.
 *   3. `inline` swaps to inline-flex.
 *   4. `gap={N}` resolves to --strapi-space-N.
 *   5. alignItems/justifyContent/wrap pass through as CSS.
 *   6. Flex composes through Box — `data-strapi-box` is also present, and
 *      Strapi Box props (color, padding) still translate.
 *   7. Per-Flex DSProvider override swaps the entire impl.
 */
import * as React from 'react';

import { getRoot, render, screen } from '@test/utils';

import { Flex } from '../../primitives/Flex';
import { DSProvider } from '../../resolver';

describe('Flex migration', () => {
  it('does not emit display/direction/align defaults to inline style', () => {
    // Defaults must come from Mantine's `mantine-Flex-root` class +
    // `[data-strapi-flex]` CSS rule — NOT inline style. Otherwise consumer
    // styled() wrappers can't override (inline beats class). See
    // MantineFlex.tsx header for the SideNavContainer / Column / MenuDetails
    // breakage that prompted this.
    const { container } = render(<Flex>x</Flex>);
    const root = getRoot(container);
    const style = root.getAttribute('style') || '';
    expect(root).toHaveAttribute('data-strapi-flex');
    expect(style).not.toContain('display:');
    expect(style).not.toContain('align-items');
    expect(style).not.toContain('flex-direction');
  });

  it('inline=true emits display:inline-flex inline (explicit override case)', () => {
    const { container } = render(<Flex inline>x</Flex>);
    expect(getRoot(container).getAttribute('style') || '').toContain('display: inline-flex');
  });

  it('direction="column" emits flex-direction: column', () => {
    const { container } = render(<Flex direction="column">x</Flex>);
    expect(getRoot(container)).toHaveStyle('flex-direction: column');
  });

  it('gap={N} resolves to --strapi-space-N', () => {
    const { container } = render(<Flex gap={3}>x</Flex>);
    expect(getRoot(container)).toHaveStyle('gap: var(--strapi-space-3)');
  });

  it('alignItems="flex-end" emits the corresponding CSS', () => {
    const { container } = render(<Flex alignItems="flex-end">x</Flex>);
    expect(getRoot(container)).toHaveStyle('align-items: flex-end');
  });

  it('justifyContent="space-between" emits the corresponding CSS', () => {
    const { container } = render(<Flex justifyContent="space-between">x</Flex>);
    expect(getRoot(container)).toHaveStyle('justify-content: space-between');
  });

  it('wrap="wrap" emits flex-wrap: wrap', () => {
    const { container } = render(<Flex wrap="wrap">x</Flex>);
    expect(getRoot(container)).toHaveStyle('flex-wrap: wrap');
  });

  it('composes through Box — Strapi Box props still translate', () => {
    const { container } = render(
      <Flex padding={2} color="primary600">
        x
      </Flex>,
    );
    const root = getRoot(container);
    expect(root).toHaveAttribute('data-strapi-flex');
    expect(root).toHaveAttribute('data-strapi-box');
    expect(root).toHaveStyle('padding: var(--strapi-space-2)');
    expect(root).toHaveStyle('color: var(--strapi-color-primary600)');
  });

  it('per-Flex DSProvider override swaps the entire impl', () => {
    const CustomFlex: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
      <section data-testid="custom-flex">{children}</section>
    );

    render(
      <DSProvider components={{ Flex: { default: CustomFlex } }}>
        <Flex>swap me</Flex>
      </DSProvider>,
    );

    expect(screen.getByTestId('custom-flex')).toHaveTextContent('swap me');
    expect(screen.getByTestId('custom-flex')).not.toHaveAttribute('data-strapi-flex');
  });
});
