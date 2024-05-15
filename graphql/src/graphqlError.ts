import {
  DEBUG_ENABLED
} from './env';

import {
  ApolloError,
  UserInputError,
  AuthenticationError,
  ForbiddenError,
} from 'apollo-server-express';


export {
  ApolloError,
  UserInputError,
  AuthenticationError,
  ForbiddenError,
}


export const errorSpan = (span, error) => {
  if (DEBUG_ENABLED) {
    console.error(error);
  }

  if(typeof error === 'object') {
    error = error.message;
  }

  span.setTag('error', true);
  span.log({ errors: error });
  span.finish();
}

