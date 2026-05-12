/**
 * Box unit tests against the Mantine substrate.
 *
 * Updated for Phase 5c: assertions now verify the CSS-variable contract
 * rather than the styled-components-resolved hex/px output. Behaviorally
 * identical in a real browser (where `--strapi-*` vars resolve), and
 * verifiable in jsdom because the emitted CSS property names + `var(...)`
 * references are checkable as strings.
 *
 * Logical-vs-physical mapping preserved from the legacy:
 *   - marginLeft/paddingLeft   → margin-inline-start / padding-inline-start
 *   - marginRight/paddingRight → margin-inline-end / padding-inline-end
 *   (Block-axis props stayed physical, matching writing-modes semantics.)
 */
import * as React from 'react';

import { getRoot, render, screen } from '@test/utils';
import { styled } from 'styled-components';

import { Box } from './Box';

describe('Box', () => {
  describe('Theme props', () => {
    it.each(['color', 'background'])('resolves %s prop to the matching --strapi-color-* var', (colorProp) => {
      const { container } = render(<Box {...{ [colorProp]: 'primary500' }} />);
      const cssProp = colorProp === 'background' ? 'background' : 'color';
      expect(getRoot(container)).toHaveStyle(`${cssProp}: var(--strapi-color-primary500)`);
    });

    it('resolves padding shorthand to --strapi-space-N', () => {
      const { container } = render(<Box padding={4} />);
      expect(getRoot(container)).toHaveStyle('padding: var(--strapi-space-4)');
    });

    it('resolves paddingTop to padding-top + space var', () => {
      const { container } = render(<Box paddingTop={1} />);
      expect(getRoot(container)).toHaveStyle('padding-top: var(--strapi-space-1)');
    });

    it('resolves paddingBottom to padding-bottom + space var', () => {
      const { container } = render(<Box paddingBottom={2} />);
      expect(getRoot(container)).toHaveStyle('padding-bottom: var(--strapi-space-2)');
    });

    it('resolves paddingLeft to logical inline-start (RTL-aware)', () => {
      const { container } = render(<Box paddingLeft={1} />);
      expect(getRoot(container)).toHaveStyle('padding-inline-start: var(--strapi-space-1)');
    });

    it('resolves paddingRight to logical inline-end (RTL-aware)', () => {
      const { container } = render(<Box paddingRight={2} />);
      expect(getRoot(container)).toHaveStyle('padding-inline-end: var(--strapi-space-2)');
    });

    it('resolves margin shorthand to --strapi-space-N', () => {
      const { container } = render(<Box margin={4} />);
      expect(getRoot(container)).toHaveStyle('margin: var(--strapi-space-4)');
    });

    it('resolves marginTop to margin-top + space var', () => {
      const { container } = render(<Box marginTop={1} />);
      expect(getRoot(container)).toHaveStyle('margin-top: var(--strapi-space-1)');
    });

    it('resolves marginBottom to margin-bottom + space var', () => {
      const { container } = render(<Box marginBottom={2} />);
      expect(getRoot(container)).toHaveStyle('margin-bottom: var(--strapi-space-2)');
    });

    it('resolves marginLeft to logical inline-start (RTL-aware)', () => {
      const { container } = render(<Box marginLeft={1} />);
      expect(getRoot(container)).toHaveStyle('margin-inline-start: var(--strapi-space-1)');
    });

    it('resolves marginRight to logical inline-end (RTL-aware)', () => {
      const { container } = render(<Box marginRight={2} />);
      expect(getRoot(container)).toHaveStyle('margin-inline-end: var(--strapi-space-2)');
    });
  });

  describe('CSS props', () => {
    it.each([{ height: '100%' }, { width: '100%' }])(
      'passes through %s without rendering as HTML attribute',
      (prop) => {
        const { container } = render(<Box {...prop} />);
        const [key, value] = Object.entries(prop)[0];
        const root = getRoot(container);

        expect(root).not.toHaveAttribute(key);
        expect(root).toHaveStyle(`${key}: ${value}`);
      },
    );
  });

  describe('Polymorphic component', () => {
    it('accepts native style overrides', () => {
      const { container } = render(<Box style={{ color: 'pink' }} />);
      expect(getRoot(container)).toHaveStyle('color: pink');
    });

    it('renders as an anchor when tag is "a"', () => {
      // @ts-expect-error – href is not a valid attribute for a div, this error asserts it's not allowed
      const { container, rerender } = render(<Box href="https://strapi.io" />);

      rerender(<Box tag="a" href="https://strapi.io" />);
      expect(getRoot(container)).toHaveAttribute('href', 'https://strapi.io');
      expect(getRoot(container).tagName.toLowerCase()).toBe('a');
    });

    it('renders with custom component when tag is a React component', () => {
      const MyLink = ({ to, ...props }: { to: string; children?: React.ReactNode }) => <a href={to} {...props} />;

      // @ts-expect-error – to is not a valid attribute for a div, this error asserts it's not allowed
      const { container, rerender } = render(<Box to="https://strapi.io" />);

      rerender(<Box tag={MyLink} to="https://strapi.io" />);
      expect(getRoot(container)).toHaveAttribute('href', 'https://strapi.io');
    });

    it('forwards refs through to the rendered element', () => {
      const MyLink = () => {
        const linkRef = React.useRef<HTMLAnchorElement>(null);

        return (
          <Box tag="a" href="https://strapi.io" ref={linkRef}>
            click me!
          </Box>
        );
      };

      render(<MyLink />);

      expect(screen.getByRole('link', { name: 'click me!' })).toBeInTheDocument();
    });

    it('does not let me pass component props to styled(Box) if the prop does not exist', () => {
      const MyBox = styled<typeof Box<'div'>>(Box)``;

      // @ts-expect-error – fake is not a valid attribute on Box, this error asserts the styled wrapper preserves Box's typing
      render(<MyBox fake="yes" />);
    });
  });
});
