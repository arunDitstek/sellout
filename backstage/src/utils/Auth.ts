import client from "../graphql/client";
import * as Checkout from "./Checkout";

const SELLOUT_AUTH_TOKEN = "SELLOUT_AUTH_TOKEN";

export function setToken(token: string) {
  return localStorage.setItem(SELLOUT_AUTH_TOKEN, token);
}

export function getToken(): string | null {
  return localStorage.getItem(SELLOUT_AUTH_TOKEN);
}

export async function logout() {
  localStorage.clear();
  Checkout.initialize();
  // persistor.pause();
  // persistor.purge();
  client.resetStore();
  window.location.href = '/';

}
