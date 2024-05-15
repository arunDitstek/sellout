import { ApolloLink } from 'apollo-link';

const omitTypeNameLink = new ApolloLink((operation, forward) => {
  if (operation.variables && operation.operationName !== 'uploadFiles') {
    operation.variables = omitDeep(operation.variables, '__typename');
  }
  return forward(operation).map((data) => {
    return data;
  });
});

function omitDeep(obj: any, key: any) {
  const keys = Object.keys(obj);
  const newObj: any = {};
  keys.forEach((i) => {
    if (i !== key) {
      const val = obj[i];
      if (Array.isArray(val)) newObj[i] = omitDeepArrayWalk(val, key);
      else if (typeof val === 'object' && val !== null) newObj[i] = omitDeep(val, key);
      else newObj[i] = val;
    }
  });
  return newObj;
}

function omitDeepArrayWalk(arr: any, key: any) {
  return arr.map((val: any) => {
    if (Array.isArray(val)) return omitDeepArrayWalk(val, key);
    if (typeof val === 'object') return omitDeep(val, key);
    return val;
  });
}

export default omitTypeNameLink;
