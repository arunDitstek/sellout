import "./styles/index.css";
import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from "@apollo/react-hooks";
import { Provider as ReduxProvider } from 'react-redux';
import App from './App';
import client from './graphql/client';
import store from './redux/store';
import * as Sentry from '@sentry/browser';
import {
  NODE_ENV,
  SENTRY_DSN,
} from './env';

// Configure Sentry
if (SENTRY_DSN) {
  console.log(`Sentry - Initializing with environment ${NODE_ENV}...`);
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: NODE_ENV,
  });
} else {
  console.warn('Sentry - No DSN supplied, skipping initialization...');
}

ReactDOM.render(
  <ApolloProvider client={client}>
    <ReduxProvider store={store}>
      <App />
    </ReduxProvider>
  </ApolloProvider>,
  document.getElementById("root")
);
