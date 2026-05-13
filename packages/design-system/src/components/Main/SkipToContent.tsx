/**
 * SkipToContent — drop-in port off styled-components.
 *
 * Standard a11y "skip to main content" link. Hidden off-screen by default
 * (left/top: -100%); on focus, jumps into the visible area.
 *
 * Surface color, text color, focus styling, and text-decoration live in
 * `componentPolish.css` keyed on `[data-strapi-skip-to-content]`. The
 * rules read dedicated semantic tokens (--strapi-skip-to-content-*) so
 * the surface can be re-themed without rebranding the primary scale.
 */
import { Box } from '../../primitives/Box';

export interface SkipToContentProps {
  children?: React.ReactNode;
}

export const SkipToContent = ({ children }: SkipToContentProps) => {
  return (
    <Box
      tag="a"
      href="#main-content"
      left="-100%"
      padding={3}
      position="absolute"
      top="-100%"
      hasRadius
      zIndex={9999}
      data-strapi-skip-to-content=""
    >
      {children}
    </Box>
  );
};
