import ky from "ky-universal";
import { useQuery, useMutation } from "@tanstack/react-query";

const BASE_URL = process.env.SERVER;
const AUTH_BASE_URL = `${BASE_URL}/auth`;

// API calls
function postLogin(username, password) {
  const route = `${AUTH_BASE_URL}/login/`;
  return ky.post(route, { json: { username, password } }).json();
}

function postLogout(token) {
  const route = `${AUTH_BASE_URL}/logout/`;
  return ky
    .post(route, { headers: { Authorization: `Token ${token}` } })
    .json();
}

function getUser(token) {
  const route = `${AUTH_BASE_URL}/user/`;
  return ky.get(route, { headers: { Authorization: `Token ${token}` } }).json();
}

function postSignup({ username, email, password1, password2 }) {
  const route = `${AUTH_BASE_URL}/registration/`;
  return ky
    .post(route, {
      json: {
        username,
        email,
        password1,
        password2,
      },
    })
    .json();
}

// React Query hooks
function usePostLogin() {
  return useMutation({
    mutationFn: ({ username, password }) => postLogin(username, password),
  });
}

function usePostLogout() {
  return useMutation({
    mutationFn: (token) => postLogout(token),
  });
}

function useGetUser(token) {
  return useQuery({
    enabled: !!token,
    queryKey: ["user", token],
    queryFn: (queryContext) => getUser(token),
  });
}

function usePostSignup() {
  return useMutation({
    mutationFn: ({ username, email, password1, password2 }) =>
      postSignup({ username, email, password1, password2 }),
  });
}

export { useGetUser, usePostLogin, usePostLogout, usePostSignup };
