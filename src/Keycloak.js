import Keycloak from "keycloak-js";

//keycloak init options
let initOptions = {
  url: "https://auth.defesacivil.site/auth",
  realm: "dc_auth",
  clientId: "contingencia_react",
  onLoad: "login-required",
};

let keycloak = Keycloak(initOptions);

export default keycloak;
