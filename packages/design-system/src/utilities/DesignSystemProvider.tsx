import { MantineProvider, createTheme, MantineColorsTuple } from '@mantine/core';
import { Provider as TooltipProvider, TooltipProviderProps } from '@radix-ui/react-tooltip';
import { DefaultTheme, ThemeProvider } from 'styled-components';

import { LiveRegions } from '../components/LiveRegions';
import { createContext } from '../helpers/context';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
import { DSProvider } from '../resolver';
import { GlobalStyle } from '../styles/global';
import { lightTheme } from '../themes';

import type { DSOverrides } from '../resolver';

/**
 * Mantine theme aliased to Strapi tokens (Phase 1).
 *
 * Mantine reads through CSS custom properties at runtime — so swapping a token's
 * value in :root cascades into every Mantine component automatically. The DS's
 * legacy styled-components system reads the same numbers from its JS theme
 * object; both come from the same source of truth (themes/lightTheme/* etc.).
 *
 * Mantine requires 10-stop color tuples for its named colors. We map roughly:
 *   100 → tuple[0], 200 → tuple[1], 500 → tuple[5], 600 → tuple[6], 700 → tuple[7]
 * and pad the missing stops with var() refs to the nearest neighbour. Strapi
 * doesn't have 300/400/800/900/1000 tones for most palettes, so consumers who
 * need them via Mantine will get reasonable approximations. Phase 8 can fill
 * in real values once the migration's complete.
 */
const tupleFromStrapi = (name: string): MantineColorsTuple => [
  `var(--strapi-color-${name}100)`,
  `var(--strapi-color-${name}200)`,
  `var(--strapi-color-${name}200)`,
  `var(--strapi-color-${name}200)`,
  `var(--strapi-color-${name}500)`,
  `var(--strapi-color-${name}500)`,
  `var(--strapi-color-${name}600)`,
  `var(--strapi-color-${name}700)`,
  `var(--strapi-color-${name}700)`,
  `var(--strapi-color-${name}700)`,
];

const mantineTheme = createTheme({
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
  defaultRadius: 'var(--strapi-radius)',
  primaryColor: 'primary',
  primaryShade: 6,
  colors: {
    primary: tupleFromStrapi('primary'),
    secondary: tupleFromStrapi('secondary'),
    success: tupleFromStrapi('success'),
    warning: tupleFromStrapi('warning'),
    danger: tupleFromStrapi('danger'),
    alternative: tupleFromStrapi('alternative'),
    neutral: [
      'var(--strapi-color-neutral0)',
      'var(--strapi-color-neutral100)',
      'var(--strapi-color-neutral150)',
      'var(--strapi-color-neutral200)',
      'var(--strapi-color-neutral300)',
      'var(--strapi-color-neutral400)',
      'var(--strapi-color-neutral500)',
      'var(--strapi-color-neutral600)',
      'var(--strapi-color-neutral700)',
      'var(--strapi-color-neutral800)',
    ],
  },
  spacing: {
    xs: 'var(--strapi-space-1)',
    sm: 'var(--strapi-space-2)',
    md: 'var(--strapi-space-4)',
    lg: 'var(--strapi-space-7)',
    xl: 'var(--strapi-space-9)',
  },
  fontSizes: {
    xs: 'var(--strapi-font-size-0)',
    sm: 'var(--strapi-font-size-1)',
    md: 'var(--strapi-font-size-2)',
    lg: 'var(--strapi-font-size-3)',
    xl: 'var(--strapi-font-size-4)',
  },
  lineHeights: {
    xs: 'var(--strapi-line-height-0)',
    sm: 'var(--strapi-line-height-2)',
    md: 'var(--strapi-line-height-3)',
    lg: 'var(--strapi-line-height-4)',
    xl: 'var(--strapi-line-height-6)',
  },
  radius: {
    xs: 'var(--strapi-radius)',
    sm: 'var(--strapi-radius)',
    md: 'var(--strapi-radius)',
    lg: 'var(--strapi-radius)',
    xl: 'var(--strapi-radius)',
  },
  shadows: {
    xs: 'var(--strapi-shadow-table)',
    sm: 'var(--strapi-shadow-filter)',
    md: 'var(--strapi-shadow-popup)',
    lg: 'var(--strapi-shadow-popup)',
    xl: 'var(--strapi-shadow-popup)',
  },
});

const DEFAULT_LOCALE = 'en-EN';

const getDefaultLocale = () => {
  if (typeof navigator === 'undefined') {
    return DEFAULT_LOCALE;
  }

  if (navigator.language) {
    return navigator.language;
  }

  return DEFAULT_LOCALE;
};

interface DesignSystemContextValue {
  locale: string;
}

const [Provider, useDesignSystem] = createContext<DesignSystemContextValue>('StrapiDesignSystem', {
  locale: getDefaultLocale(),
});

interface DesignSystemProviderProps extends Partial<DesignSystemContextValue> {
  children?: React.ReactNode;
  theme?: DefaultTheme;
  tooltipConfig?: Omit<TooltipProviderProps, 'children'>;
  /**
   * WordPress-style component overrides. Apps and plugins can swap any
   * registered DS component for a custom implementation in this subtree.
   *
   * See notes/ds-migration/principles.md (override surface 6). Reach for
   * this only when Mantine's native mechanisms (theme.components, styles
   * prop, polymorphic component) cannot express what you want.
   */
  overrides?: DSOverrides;
}

const DesignSystemProvider = ({
  children,
  locale = getDefaultLocale(),
  theme = lightTheme,
  tooltipConfig,
  overrides,
}: DesignSystemProviderProps) => {
  useIsomorphicLayoutEffect(() => {
    /**
     * Switching themes should not trigger transitions and animations on elements.
     * The following code will remove all transitions and animations when the theme changes.
     */
    const css = document.createElement('style');
    css.type = 'text/css';
    css.appendChild(
      document.createTextNode(`
        * {
          -webkit-transition: none !important;
          -moz-transition: none !important;
          -o-transition: none !important;
          -ms-transition: none !important;
          transition: none !important;
          animation: none !important;
        }
    `),
    );
    document.head.appendChild(css);

    const _ = window.getComputedStyle(css).opacity;
    document.head.removeChild(css);
  }, [theme]);

  return (
    <Provider locale={locale}>
      <MantineProvider theme={mantineTheme} withCssVariables defaultColorScheme="light">
        <DSProvider components={overrides}>
          <ThemeProvider theme={theme}>
            <TooltipProvider {...tooltipConfig}>{children}</TooltipProvider>
            <LiveRegions />
            <GlobalStyle />
          </ThemeProvider>
        </DSProvider>
      </MantineProvider>
    </Provider>
  );
};

export { useDesignSystem, DesignSystemProvider };
export type { DesignSystemProviderProps, DesignSystemContextValue };
