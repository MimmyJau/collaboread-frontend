import ky from "ky-universal";
import { useMutation } from "@tanstack/react-query";

const BASE_URL = process.env.SERVER;
const AUTH_BASE_URL = `${BASE_URL}/auth`;

function postLogin(username, password) {
  const route = `${AUTH_BASE_URL}/login/`;
  return ky.post(route, { json: { username, password } }).json();
}

function usePostLogin() {
  return useMutation({
    mutationFn: ({ username, password }) => postLogin(username, password),
  });
}

export default usePostLogin;
