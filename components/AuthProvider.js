import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AuthContext from "contexts/auth";
import {
  useGetUser,
  usePostLogin,
  usePostLogout,
  usePostSignup,
} from "api/auth.js";

function setTokenLocalStorage(token) {
  window.localStorage.setItem("token", token);
}

function getTokenLocalStorage() {
  return window.localStorage.getItem("token");
}

function removeTokenLocalStorage() {
  return window.localStorage.removeItem("token");
}

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const postLogin = usePostLogin();
  const postLogout = usePostLogout();
  const postSignup = usePostSignup();
  const router = useRouter();

  // Wait for React to finish loading in browser before checking for token
  useEffect(() => {
    setToken(getTokenLocalStorage());
  }, []);

  // Using token, check it token is valid
  const { data: userData, isSuccess, isError } = useGetUser(token);

  // Set whether we're logged in or not
  useEffect(() => {
    if (isSuccess) {
      setUser(userData);
    } else if (isError) {
      setUser(null);
      removeTokenLocalStorage();
    }
  }, [userData, isSuccess, isError]);

  const login = (username, password) => {
    postLogin.mutate(
      { username: username, password: password },
      {
        onSuccess: (data) => {
          setTokenLocalStorage(data.key);
          setUser(username);
          router.push("/");
        },
      }
    );
  };

  const logout = () => {
    postLogout.mutate(getTokenLocalStorage(), {
      onSuccess: (data) => {
        setUser(null);
        removeTokenLocalStorage();
      },
    });
  };

  const signup = ({ username, email, password1, password2 }) => {
    postSignup.mutate(
      {
        username,
        email,
        password1,
        password2,
      },
      {
        onSuccess: () => {
          router.push("/signup/successful");
        },
        onError: () => {
          router.push("/signup/error");
        },
      }
    );
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
