export function getErrorMessage(error: any): string {
  const defaultMessage = 'Something went wrong. Please contact support.';

  if (!error) return defaultMessage;

  let errorMsg = error?.graphQLErrors?.[0]?.extensions?.exception?.invalidArgs?.[0].message ?? null;
  if (errorMsg) return errorMsg;
  
  errorMsg = error?.graphQLErrors?.[0]?.message ?? null;
  if (errorMsg) return errorMsg;

  errorMsg = error.networkError?.result?.errors?.[0]?.message ?? null;
  if (errorMsg) return errorMsg;

  return defaultMessage;
}
