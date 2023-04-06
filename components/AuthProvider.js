import { useState } from "react";
import AuthContext from "contexts/auth";
import usePostLogin from "api/auth";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const postLogin = usePostLogin();

  const login = (username, password) => {
    postLogin.mutate(
      { username: username, password: password },
      {
        onSuccess: (data) => {
          console.log(data);
          window.sessionStorage.setItem("token", data.key);
          setUser(username);
        },
      }
    );
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={[user, login, logout]}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
