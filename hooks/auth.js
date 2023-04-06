import { useMutation } from "@tanstack/react-query";

import { postLogin } from "api/auth";

function usePostLogin() {
  return useMutation({
    mutationFn: ({ username, password }) => postLogin(username, password),
    onSuccess: (data) => {
      console.log(data);
      window.localStorage.setItem("token", data.key);
    },
  });
}

export { usePostLogin };
