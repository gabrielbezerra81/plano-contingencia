import { useSystem } from "context/System/systemContext";
import React, { useCallback } from "react";
import { FiPower } from "react-icons/fi";

import moment from "moment";
import "moment/locale/pt-br";

import { Container } from "./styles";
import { useAuth } from "context/Auth/authContext";

let dayOfWeek = moment().format("dddd");

dayOfWeek = dayOfWeek.substr(0, 1).toLocaleUpperCase() + dayOfWeek.substr(1);

const date = moment().format("DD [de] MMMM");

const homeURL =
  // eslint-disable-next-line no-restricted-globals
  location.hostname === "localhost"
    ? "http://localhost:3000/"
    : "https://plano-contingencia.herokuapp.com/";

const url =
  "https://auth.defesacivil.website/auth/realms/dc_auth/protocol/openid-connect/logout?redirect_uri=" +
  homeURL;

const LogoutMenu: React.FC = () => {
  const { changeLogoutMenuVisibility, isOpenLogoutMenu } = useSystem();

  const { signOut, name } = useAuth();

  const handleLogout = useCallback(() => {
    signOut();
    changeLogoutMenuVisibility(false);
  }, [changeLogoutMenuVisibility, signOut]);

  return (
    <Container isOpen={isOpenLogoutMenu}>
      <div className="menuItem">
        <h6>{name}</h6>
      </div>
      <button onClick={handleLogout} className="menuItem">
        <div>
          <FiPower />
          <h6>LOGOUT</h6>
        </div>
        <div>
          <span className="connectedCircle" />
          <span>CONECTADO</span>
        </div>
      </button>
      <div className="menuItem">
        <h6>
          {dayOfWeek}
          <br />
          {date}
        </h6>
      </div>
    </Container>
  );
};

export default LogoutMenu;
