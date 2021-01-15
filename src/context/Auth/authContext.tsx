import React, { useContext, useState, useCallback, useEffect } from "react";
import keycloak from "Keycloak";
import qs from "qs";
import axios from "axios";
import api from "api/config";

interface AuthContextData {
  isLogged: boolean;
  authenticate: (code: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = React.createContext<AuthContextData>({} as AuthContextData);

const redirectURL =
  // eslint-disable-next-line no-restricted-globals
  location.hostname === "localhost"
    ? "http://localhost:3000/logged"
    : "https://plano-contingencia.herokuapp.com/logged";

const homeURL =
  // eslint-disable-next-line no-restricted-globals
  location.hostname === "localhost"
    ? "http://localhost:3000/"
    : "https://plano-contingencia.herokuapp.com/";

const AuthProvider: React.FC = ({ children }) => {
  const [isLogged, setIsLogged] = useState(() => {
    const string = localStorage.getItem("@plan:authData");

    if (string) {
      return true;
    }

    return false;
  });
  const [authData, setAuthData] = useState<AuthData | null>(() => {
    const data = localStorage.getItem("@plan:authData");

    if (data) {
      const parsedData = JSON.parse(data);

      const { token_type, access_token } = parsedData;

      api.defaults.headers.authorization = `${token_type} ${access_token}`;

      return parsedData;
    }

    return null;
  });

  const redirectToKeycloak = useCallback(() => {
    keycloak
      .init({ onLoad: "login-required", redirectUri: redirectURL })
      .success((auth) => {
        if (!auth) {
          window.location.reload();
        } else {
          console.log("Authenticated");
        }
      })
      .error(() => {
        console.log("Authenticated Failed");
      });
  }, []);

  const authenticate = useCallback(async (code: string) => {
    try {
      console.log("tentou buscar os dados de auth");

      const response = await axios.post(
        `https://auth.defesacivil.site/auth/realms/dc_auth/protocol/openid-connect/token`,
        qs.stringify({
          code,
          redirect_uri: redirectURL,
          grant_type: "authorization_code",
          client_id: "contingencia_react",
          //   client_secret: "367afb37-8884-42c3-b5b6-b455b9b7db59",
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const { data } = response;

      const { token_type, access_token } = data;

      console.log("buscou os dados ", access_token);

      api.defaults.headers.authorization = `${token_type} ${access_token}`;

      console.log(data);
      setAuthData(data);
      setIsLogged(true);

      localStorage.setItem("@plan:authData", JSON.stringify(data));
    } catch (error) {
      alert("Falha de autenticação, atualize a página");
      console.log("authError", error);
    }
  }, []);

  const signOut = useCallback(async () => {
    const url =
      "https://auth.defesacivil.site/auth/realms/dc_auth/protocol/openid-connect/logout?redirect_uri=" +
      homeURL;

    window.open(url, "_self");

    setTimeout(() => {
      setIsLogged(false);
      setAuthData(null);
      localStorage.removeItem("@plan:authData");
    }, 200);
  }, []);

  useEffect(() => {
    if (!isLogged) {
      redirectToKeycloak();
    }
  }, [isLogged, redirectToKeycloak]);

  return (
    <AuthContext.Provider value={{ isLogged, authenticate, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};

interface AuthData {}
