import NPECheck from '../utils/NPECheck';

export function getErrorMessage(error: any): string {
  const defaultMessage = 'Something went wrong. Please contact support.';

  if (!error) return defaultMessage;

  let errorMsg = NPECheck(error, 'graphQLErrors/0/message', null);
  if (errorMsg) return errorMsg;

  errorMsg = NPECheck(error, 'networkError/result/errors/0/message', null);
  if (errorMsg) return errorMsg;

  errorMsg = NPECheck(error, 'graphQLErrors/0/extensions/exception/invalidArgs', null);
  if (errorMsg) return errorMsg;

  return defaultMessage;
}
