import { useEffect, useState } from 'react';
import { css } from 'styled-components';

const mediaQuery = (queryTemplate: any, ...queryRest: any[]) => (rulesTemplate: any, ...rulesRest: any[]): any => {
  return css`
    @media ${css(queryTemplate as any, ...queryRest)} {
      ${css(rulesTemplate as any, ...rulesRest)}
    }
  `
};

const sizes = {
  tablet: 768,
  desktop: 992,
  largeDesktop: 1281, // change from 1200
  extraLargeDesktop: 1536,
  giant: 1920,
};

const queryStrings = {
  handheld: `(max-width: ${(sizes.tablet - 1) / 16}em)`,
  tablet: `(min-width: ${sizes.tablet / 16}em)`,
  tabletOnly: `(min-width: ${sizes.tablet / 16}em) and (max-width: ${(sizes.desktop - 1) / 16}em)`,
  mobile: `(max-width: ${(sizes.desktop - 1) / 16}em)`,
  desktop: `(min-width: ${sizes.desktop / 16}em)`,
  largeDesktop: `(min-width: ${sizes.largeDesktop / 16}em)`,
  extraLargeDesktop: `(min-width: ${sizes.extraLargeDesktop / 16}em)`,
  giant: `(min-width: ${sizes.giant / 16}em)`,
  print: 'print',
}

export const media = {
  handheld: mediaQuery`${queryStrings.handheld}`,
  tablet: mediaQuery`${queryStrings.tablet}`,
  tabletOnly: mediaQuery`${queryStrings.tabletOnly}`,
  mobile: mediaQuery`${queryStrings.mobile}`,
  desktop: mediaQuery`${queryStrings.desktop}`,
  largeDesktop: mediaQuery`${queryStrings.largeDesktop}`,
  extraLargeDesktop: mediaQuery`${queryStrings.extraLargeDesktop}`,
  giant: mediaQuery`${queryStrings.giant}`,
  print: mediaQuery`${queryStrings.print}`,
  minWidth: (pxValue: any) => mediaQuery`(min-width: ${pxValue / 16}em)`,
};

export const useMedia = (query: any) => {
  const matchQuery = window && window.matchMedia(query);
  const [isMatch, setIsMatch] = useState(matchQuery.matches);

  useEffect(() => {
    const handler = () => setIsMatch(matchQuery.matches);
    matchQuery.addListener(handler);
    return () => matchQuery.removeListener(handler);
  }, [query, matchQuery]);

  return isMatch;
};

export const useMobileMedia = () => useMedia(`${queryStrings.mobile}`);
export const useTabletMedia = () => useMedia(`${queryStrings.tablet}`);
export const useDesktopMedia = () => useMedia(`${queryStrings.desktop}`);
export const useLargeDesktopMedia = () => useMedia(`${queryStrings.largeDesktop}`);
export const useGiantMedia = () => useMedia(`${queryStrings.giant}`);
