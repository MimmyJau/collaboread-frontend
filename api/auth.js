import ky from "ky-universal";

const BASE_URL = process.env.SERVER;
const AUTH_BASE_URL = `${BASE_URL}/auth`;

function postLogin(username, password) {
  const route = `${AUTH_BASE_URL}/login/`;
  return ky.post(route, { json: { username, password } }).json();
}

export { postLogin };
