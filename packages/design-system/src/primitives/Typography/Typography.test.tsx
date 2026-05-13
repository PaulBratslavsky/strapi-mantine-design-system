/**
 * Typography unit tests against the Mantine substrate.
 *
 * Updated for Phase 5e: variant styling lives in `theming/componentPolish.css`
 * as `[data-strapi-typography-variant="..."]` rules with `@media` queries
 * (drop-in for the legacy styled-components emission). jsdom doesn't apply
 * external stylesheets, so we verify the **contract** the substrate exposes
 * (correct data-attribute hooks, polymorphic tag, ellipsis hook) rather than
 * resolved font-size/line-height pixel values. The runtime CSS is exercised
 * by the live admin smoke check + by browsers in production.
 */
import * as React from 'react';

import { render, screen } from '@test/utils';

import { TEXT_VARIANTS } from '../../styles/type';

import { Typography, TypographyProps } from './Typography';

describe('Typography', () => {
  it('renders a span element by default', () => {
    render(<Typography>Hello World</Typography>);
    expect(screen.getByText('Hello World').tagName).toBe('SPAN');
  });

  it('stamps the data-strapi-typography hook for CSS targeting', () => {
    render(<Typography>Hello World</Typography>);
    expect(screen.getByText('Hello World')).toHaveAttribute('data-strapi-typography');
  });

  it("stamps data-strapi-typography-ellipsis when the 'ellipsis' prop is passed", () => {
    render(<Typography ellipsis>Hello World</Typography>);
    expect(screen.getByText('Hello World')).toHaveAttribute('data-strapi-typography-ellipsis');
  });

  it('does not stamp ellipsis hook when ellipsis is unset', () => {
    render(<Typography>Hello World</Typography>);
    expect(screen.getByText('Hello World')).not.toHaveAttribute('data-strapi-typography-ellipsis');
  });

  describe('Variants', () => {
    TEXT_VARIANTS.forEach((variant) => {
      it(`stamps data-strapi-typography-variant="${variant}" for variant ${variant}`, () => {
        const props: TypographyProps = { variant };
        render(<Typography {...props}>Hello {variant}</Typography>);
        expect(screen.getByText(`Hello ${variant}`)).toHaveAttribute(
          'data-strapi-typography-variant',
          variant,
        );
      });
    });

    it('defaults to the omega variant when no variant prop is passed', () => {
      render(<Typography>Hello World</Typography>);
      expect(screen.getByText('Hello World')).toHaveAttribute(
        'data-strapi-typography-variant',
        'omega',
      );
    });
  });

  describe('Polymorphic component', () => {
    it('accepts native style overrides via the style prop', () => {
      render(<Typography style={{ color: 'pink' }}>x</Typography>);
      expect(screen.getByText('x')).toHaveStyle('color: pink');
    });

    it('renders as an anchor when tag is "a"', () => {
      const { rerender } = render(<Typography>placeholder</Typography>);
      rerender(
        <Typography tag="a" href="https://strapi.io">
          Strapi
        </Typography>,
      );
      expect(screen.getByText('Strapi')).toHaveAttribute('href', 'https://strapi.io');
      expect(screen.getByText('Strapi').tagName).toBe('A');
    });

    it('renders with a custom component when tag is a React component', () => {
      const MyLink = ({ to, ...props }: { to: string; children?: React.ReactNode }) => (
        <a href={to} {...props} />
      );
      const { rerender } = render(<Typography>placeholder</Typography>);
      rerender(
        <Typography tag={MyLink} to="https://strapi.io">
          Strapi
        </Typography>,
      );
      expect(screen.getByText('Strapi')).toHaveAttribute('href', 'https://strapi.io');
    });

    it('forwards refs through to the rendered element', () => {
      const MyLink = () => {
        const linkRef = React.useRef<HTMLAnchorElement>(null);
        return (
          <Typography tag="a" href="https://strapi.io" ref={linkRef}>
            click me!
          </Typography>
        );
      };
      render(<MyLink />);
      expect(screen.getByRole('link', { name: 'click me!' })).toBeInTheDocument();
    });
  });
});
