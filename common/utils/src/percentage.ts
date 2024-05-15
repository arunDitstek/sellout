const lastChar = string => string.toString().charAt(string.length - 1);

export function input(percentage) {
  percentage = percentage.toString().replace(/\s/g, '');

  if (!percentage) percentage = 0;

  if (Number.isNaN(percentage)) return 0;

  if (percentage.toString().length > 1 && percentage.toString().charAt(0) === '0') {
    const value = parseFloat(percentage.substring(1));
    if (Number.isNaN(value)) return 0;
    return value;
  }

  if (lastChar(percentage) === '.') {
    return percentage;
  }

  return parseFloat(percentage);
}
