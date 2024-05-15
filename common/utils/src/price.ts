// I know this sucks, I'm sorry. You can re-write it, but
// make sure you test it thoroughly.
export const input = (price: any) => {
  price = price.replace(/[^0-9.]/g, '');

  if (price.indexOf('.') > -1) {
    let [first, second] = price.toString().split('.');

    second = second.replace(/[^0-9]/g, '');

    price = `${first}.${second}`;
  }

  if (price.toString().split('')[price.length - 1] === '.') {
    return price;
  }

  if (price.toString().split('')[price.length - 1] === '0'
    && price.toString().split('')[price.length - 2] === '.') {
    price = parseInt(price);
  }

  if (Number.isNaN(price) || Number.isNaN(price)) return 0;

  return price * 100;
};

// export const output = (price: any, withFixed = false) => {
//   if (price && price.toString().split('')[price.length - 1] === '.') {
//     return (price / 100).toLocaleString("en-US");
//   }

//   if (withFixed) {
//     price /= 100;
//     return price.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,').toLocaleString("en-US");
//   }

//   return price;
// };

export const output = (price, withFixed = false, currencyFormat = false) => {
  if (price && price.toString().split("")[price.length - 1] === ".") {
    // price = price.replace(".", "");
   return price
  }
  price /= 100;
  if (withFixed) {
    if (currencyFormat) {
      return price
        .toFixed(2)
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,").toLocaleString("en-US")
    }
    return price
      .toFixed(2)
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  }

  return currencyFormat ? price.toLocaleString("en-US") : price;
};

export const format = (price: string) => {
  const value = parseFloat(price.replace(/,/g, ''))
    .toFixed(2)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return parseFloat(value).toFixed(2);
};
