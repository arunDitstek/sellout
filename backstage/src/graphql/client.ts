import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';
import errorLink from './links/errorLink';
import removeTypeNameLink from './links/removeTypeNameLink';
import requestLink from './links/requestLink';
import uploadLink from './links/uploadLink';
import debounceLink from '@sellout/models/.dist/graphql/links/debounceLink';


const cache = new InMemoryCache();

const link = ApolloLink.from([
  requestLink,
  errorLink,
  removeTypeNameLink,
  debounceLink,
  uploadLink,
]);

export default new ApolloClient({ link, cache });
