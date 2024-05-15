import client from "../graphql/client";

const AUTH_TOKEN = "AUTH_TOKEN";

export async function setToken(token: string) {
  await localStorage.clear();
  return await localStorage.setItem(AUTH_TOKEN, token);
}

export async function getToken() {
  return await localStorage.getItem(AUTH_TOKEN);
}

export async function logout() {
  localStorage.clear();
  client.resetStore();
  window.location.href = '/';
}
