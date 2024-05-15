import * as url from 'url';

export function parse(inputUrl: string) {
  return url.parse(inputUrl, true)  
}

export function setQueryString(paramObj: any, replaceState = false, clearExisting = false) {
  const { query } = url.parse(window.location.href, true);

  let newParams = {
    ...query,
    ...paramObj,
  };

  if (clearExisting) {
    newParams = {
      ...paramObj,
    };
  }

  let queryString = Object.keys(newParams)
    .map((key) => {
      return (newParams[key]) ? `${key}=${newParams[key]}` : null;
    })
    .filter(item => !!item)
    .join('&');

  if(queryString) queryString = '?' + queryString;

  const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}${queryString}`;

  if (replaceState && window.history.replaceState) {
    window.history.replaceState({ path: newUrl }, '', newUrl);
  } else if (window.history.pushState) {
    window.history.pushState({ path: newUrl }, '', newUrl);
  }
  return newUrl;
}
