import { ApolloLink, Observable, Operation } from "apollo-link";
import * as Auth from '../../utils/Auth';

interface IHeaders {
  authorization?: string;
}

const request = (operation: Operation) => {
  return new Promise<void>(async (resolve, reject) => {
    const headers: IHeaders = {};
    const token = await Auth.getToken();
    if (token) {
      headers.authorization = `Bearer ${token}`;
    }
    operation.setContext({ headers });
    resolve();
  });
};

const requestLink = new ApolloLink(
  (operation, forward) =>
    new Observable(observer => {
      let handle: any;
      Promise.resolve(operation)
        .then(oper => request(oper))
        .then(() => {
          handle = forward(operation).subscribe({
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer)
          });
        })
        .catch(observer.error.bind(observer));

      return () => {
        if (handle) handle.unsubscribe();
      };
    })
);

export default requestLink;


