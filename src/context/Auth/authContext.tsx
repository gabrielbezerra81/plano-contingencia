import React, { useContext, useState, useCallback, useEffect } from "react";

import moment from "moment";

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

  const [interceptorId, setInterceptorId] = useState(-1);

  const updateAuthData = useCallback((data: any) => {
    const { token_type, access_token } = data;

    api.defaults.headers.authorization = `${token_type} ${access_token}`;

    const tokenDate = new Date().getTime();

    const updatedData = { ...data, token_date: tokenDate };

    setAuthData(updatedData);
    setIsLogged(true);

    localStorage.setItem("@plan:authData", JSON.stringify(updatedData));
  }, []);

  const handleTokenRefresh = useCallback(async () => {
    try {
      const response = await axios.post(
        `https://auth.defesacivil.site/auth/realms/dc_auth/protocol/openid-connect/token`,
        qs.stringify({
          grant_type: "refresh_token",
          client_id: "contingencia_react",
          refresh_token: authData?.refresh_token,
          //   client_secret: "367afb37-8884-42c3-b5b6-b455b9b7db59",
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      updateAuthData(response.data);
    } catch (error) {
      alert("Falha ao manter sua sessão aberta, Faça login novamente");
      console.log(error);
    }
  }, [authData, updateAuthData]);

  const redirectToKeycloak = useCallback(() => {
    keycloak
      .init({
        onLoad: "login-required",
        redirectUri: redirectURL,
      })
      .success((auth) => {
        if (!auth) {
          window.location.reload();
        } else {
          console.log("Authenticated");
        }

        const data = {
          access_token: keycloak.token || "",
          id_token: keycloak.idToken || "",
          refresh_token: keycloak.refreshToken || "",
          token_type: "Bearer",
          expires_in: 3600,
          refresh_expires_in: 4500,
          session_state: "",
          scope: "",
          "not-before-policy": 0,
        };

        updateAuthData(data);
      })
      .error(() => {
        console.log("Authenticated Failed");
      });
  }, [updateAuthData]);

  const authenticate = useCallback(
    async (code: string) => {
      try {
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

        // const { expires_in } = data;

        // if (interceptorId !== -1) {
        //   api.interceptors.request.eject(interceptorId);
        // }

        // const date = new Date().getTime();

        // const interceptor = api.interceptors.request.use(async (config) => {
        //   const isExpired = isTokenExpired(date, expires_in);

        //   console.log(isExpired);

        //   if (isExpired) {
        //     await handleTokenRefresh();
        //   }

        //   return config;
        // });

        // setInterceptorId(interceptor);

        updateAuthData(data);
      } catch (error) {
        alert("Falha de autenticação, atualize a página");
        console.log("authError", error);
      }
    },
    [updateAuthData]
  );

  const signOut = useCallback(async () => {
    try {
      await axios.post(
        "https://auth.defesacivil.site/auth/realms/dc_auth/protocol/openid-connect/logout",
        qs.stringify({
          client_id: "contingencia_react",
          refresh_token: authData?.refresh_token,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      setIsLogged(false);
      setAuthData(null);
      localStorage.removeItem("@plan:authData");
    } catch (error) {
      console.log(error);
      alert("Falha ao encerrar sessão");
    }
  }, [authData]);

  useEffect(() => {
    if (authData) {
      const { token_date, expires_in } = authData;
      if (interceptorId !== -1) {
        api.interceptors.request.eject(interceptorId);
      }
      const interceptor = api.interceptors.request.use(async (config) => {
        const isExpired = isTokenExpired(token_date, expires_in);
        if (isExpired) {
          await handleTokenRefresh();
        }
        return config;
      });
      setInterceptorId(interceptor);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authData, handleTokenRefresh, updateAuthData]);

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

interface AuthData {
  access_token: string;
  expires_in: number;
  id_token: string;
  "not-before-policy": number;
  refresh_expires_in: number;
  refresh_token: string;
  scope: string;
  session_state: string;
  token_type: string;
  token_date: number;
}

// this.props.keycloak.loadUserInfo().then(userInfo => {
//   this.setState({name: userInfo.name, email: userInfo.email, id: userInfo.sub})
// });

function isTokenExpired(tokenDate: number, expiresIn: number) {
  const expireDate = new Date(tokenDate);
  expireDate.setSeconds(expireDate.getSeconds() + expiresIn - 1800); //900
  const currentDate = new Date();

  const isExpired = moment(currentDate).isAfter(expireDate, "milliseconds");

  return isExpired;
}

/*

 useEffect(() => {
    function updateSession() {
      keycloak.init({ onLoad: "check-sso" }).success((result) => {
        keycloak.onTokenExpired = () => {
          console.log("expired " + new Date());
          keycloak
            .updateToken(280)
            .success((refreshed) => {
              if (refreshed) {
                console.log("refreshed " + new Date());
              } else {
                console.log("not refreshed " + new Date());
              }
            })
            .error(() => {
              console.error("Failed to refresh token " + new Date());
            });
        };

        setAuthData((oldData) => {
          if (!oldData) {
            return oldData;
          }

          const updatedData = {
            ...oldData,
            access_token: keycloak.token as any,
            refresh_token: keycloak.refreshToken as any,
            expire_date: new Date().getTime(),
            id_token: keycloak.idToken as any,
          };

          api.defaults.headers.authorization = `Bearer ${keycloak.token}`;

          localStorage.setItem("@plan:authData", JSON.stringify(updatedData));

          return updatedData;
        });
      });
    }
    // updateSession();
  }, []);

*/
