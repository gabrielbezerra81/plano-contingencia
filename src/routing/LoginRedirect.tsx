import { useAuth } from "context/Auth/authContext";
import React, { useEffect } from "react";
import { Redirect, useLocation } from "react-router-dom";

const LoginRedirect: React.FC = () => {
  const routerLocation = useLocation();

  const { isLogged, authenticate } = useAuth();

  const [, code] = routerLocation.hash.split("code=");

  useEffect(() => {
    async function login() {
      if (code) {
        await authenticate(code);
      }
    }

    login();
  }, [code, authenticate]);

  if (!isLogged) {
    return null;
  }

  return <Redirect to="/" />;
};

export default LoginRedirect;
