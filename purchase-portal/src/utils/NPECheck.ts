// /////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// NPECheck
//
// Usage: NPECheck(param1, param2, param3)
//        param1 = the JS object being used as a hashmap
//        param2 = the nested property value path in JSON pointer syntax, https://tools.ietf.org/html/rfc6901
//        param3 = a message to display if the property does not exist or the property value is
//                 null, undefined, or empty string.
//
// Example in JSX:
//
// return (<span>{ NPECheck(this.props.dockerImage, "layers/count", "Not specified") }</span>);
//
// /////////////////////////////////////////////////////////////////////////////////////////////////////////////

export default function (object: any, nestedProps: any, substitute: any = 'Not specified') {
  if (!object) return null;
  const nested = nestedProps.split('/');
  let val = object;

  while (nested.length > 0) {
    const prop = nested.shift();
    if (!val[prop] && val[prop] !== 0) {
      return substitute;
    }
    val = val[prop];
  }

  if (!val && val !== 0) {
    return substitute;
  }
  return val;
}
