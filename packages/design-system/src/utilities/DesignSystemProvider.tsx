import { MantineProvider } from '@mantine/core';
import { Provider as TooltipProvider, TooltipProviderProps } from '@radix-ui/react-tooltip';
import { DefaultTheme, ThemeProvider } from 'styled-components';

import { LiveRegions } from '../components/LiveRegions';
import { createContext } from '../helpers/context';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
import { DSProvider } from '../resolver';
import { lightTheme } from '../themes';
import { mantineTheme } from '../theming';

import type { DSOverrides } from '../resolver';

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
          </ThemeProvider>
        </DSProvider>
      </MantineProvider>
    </Provider>
  );
};

export { useDesignSystem, DesignSystemProvider };
export type { DesignSystemProviderProps, DesignSystemContextValue };
