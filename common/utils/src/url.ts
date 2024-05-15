export function parseUrl(url: string): any {
  const parse_url = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;
  const result: string[] = parse_url.exec(url) as string[];
  return {
    url: result[0],
    scheme: result[1],
    slash: result[2],
    host: result[3],
    port: result[4],
    path: result[5],
    query: result[6],
    hash: result[7],
  };
}

export function parseQueryString(url: string = window.location.href) {
  const currentQuery = parseUrl(url).query;

  if (!currentQuery) {
    return {};
  }

  return currentQuery.split('&')
    .reduce((cur, next) => {
      const keyAndValue = next.split('=');
      cur[keyAndValue[0]] = keyAndValue[1];
      return cur;
    }, {});
}

export function setQueryString(paramObj, urlToParse, replaceState = false, clearExisting = false): string {
  const workingUrl = (urlToParse) || window.location;
  const currentParams = parseQueryString(workingUrl);

  let newParams = {
    ...currentParams,
    ...paramObj,
  };

  if (clearExisting) {
    newParams = {
      ...paramObj,
    };
  }

  const queryString = Object.keys(newParams)
    .map((key) => {
      return (newParams[key]) ? `${key}=${newParams[key]}` : null;
    })
    .filter((item) => !!item)
    .join('&');

  const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${queryString}`;

  if (replaceState && window.history.replaceState) {
    window.history.replaceState({ path: newUrl }, '', newUrl);
  } else if (window.history.pushState) {
    window.history.pushState({ path: newUrl }, '', newUrl);
  }

  return newUrl;
}


export function serializeUrlParams(object: any): string {
  const holder: string[] = [];
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      holder.push((`${encodeURIComponent(key)}=${encodeURIComponent(object[key])}`));
    }
  }
  return holder.join('&');
}
