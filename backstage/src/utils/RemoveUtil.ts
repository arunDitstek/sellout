export const removeField = (obj: any, field: string, fn: (field: string) => boolean) => {
  const copy = Array.isArray(obj) ? [...obj] : { ...obj };

  if (Object.prototype.hasOwnProperty.call(copy, field) && fn(copy[field])) {
    delete copy[field];
  }

  if (typeof copy === 'object') {
    Object.keys(copy).forEach((k) => {
      if (Array.isArray(copy[k]) && typeof copy[k][0] === 'object') {
        copy[k] = copy[k].map((o: any) => removeField(o, field, fn));
      }
    });
  }

  return copy;
};

export const removeEmptyArray = (obj: any) => {
  Object.keys(obj).forEach((k: string) => {
    if (Array.isArray(obj[k]) && obj[k].length === 0) {
      delete obj[k];
    }
  });
  return obj;
};


export const removeNull = (obj: any) => {
  Object.keys(obj).forEach((k: string) => {
    if (obj[k] === null || obj[k] === undefined) {
      delete obj[k];
    }
  });
  return obj;
};


export const removeEmptyString = (obj: any) => {
  Object.keys(obj).forEach((k) => {
    if (obj[k] === "") {
      delete obj[k];
    }
  });
  return obj;
};

export const removeEmpty = (obj: any) => {
  let copy = { ...obj };
  // copy = removeNull(copy);
  copy = removeEmptyString(copy);
  copy = removeEmptyArray(copy);

  Object.keys(copy).forEach((k) => {
    if (
      Array.isArray(copy[k]) &&
      copy[k].length &&
      typeof copy[k][0] === "object"
    ) {
      copy[k] = copy[k].map((o: any) => removeEmpty(o));
    }
  });

  return copy;
};