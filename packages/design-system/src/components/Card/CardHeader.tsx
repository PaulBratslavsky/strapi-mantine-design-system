/**
 * CardHeader — drop-in port off styled-components.
 *
 * Only styled rule was a bottom border. Moved to a CSS rule on
 * `[data-strapi-card-header]` in `componentPolish.css`.
 */
import { Flex, FlexProps } from '../../primitives/Flex';

export type CardHeaderProps = FlexProps;

export const CardHeader = (props: CardHeaderProps) => {
  return <Flex position="relative" justifyContent="center" data-strapi-card-header="" {...props} />;
};
