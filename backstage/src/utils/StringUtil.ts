
/**
 * Capitalizes the first Character in the string passed in and lowercases everything else.
 * @param s is the string to pass in
 */
export const capitalizeFirstLetter = (s: string) => {
  return !s ? '' : `${s.charAt(0).toUpperCase()}${s.slice(1).toLowerCase()}`
}

/**
 * Truncates the text when css is not available to use and adds an ellipsis at the end
 * of the pretdetermined character length.
 * @param s is the string to pass in
 * @param maxChars is the max amount of charcters before text is truncated
 */
export const truncateTextWithEllipsis = (s: string, maxChars: number) => {
  return maxChars < s.length ? `${s.slice(0, maxChars)}...` : s;
};
