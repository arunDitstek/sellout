import React from 'react';
import client from '../graphql/client';
import CREATE_STRIPE_TERMINAL_CONNECTION_TOKEN from '@sellout/models/.dist/graphql/mutations/createStripeTerminalConnectionToken.mutation';
import { loadStripeTerminal, Terminal } from '@stripe/terminal-js';
import * as StripeService from '../utils/StripeService';

type UseStripeTerminal = {
  terminal: Terminal | undefined,
  error: Error | undefined;
};

type UseStripeTerminalHook = () => UseStripeTerminal;

// HANDLE ERROR
const useStripeTerminalHook: UseStripeTerminalHook = () => {
  const [terminal, setTerminal] = React.useState<Terminal | undefined>();

  React.useEffect(() => {
    const doEffect = async () => {
      const StripeTerminal = await loadStripeTerminal();
      const terminal = StripeTerminal?.create({
        onFetchConnectionToken: async () => {
          const { data } = await client.mutate({
            mutation: CREATE_STRIPE_TERMINAL_CONNECTION_TOKEN,
          });

          return data?.createStripeTerminalConnectionToken;
        },
        onUnexpectedReaderDisconnect: (e) => {
          console.error(e);
        }

      });
      setTerminal(terminal);
      StripeService.setStripeTerminal(terminal || null);
    };
    doEffect();
  }, []);

  return {
    terminal,
    error: undefined,
  };
};

export default useStripeTerminalHook;
