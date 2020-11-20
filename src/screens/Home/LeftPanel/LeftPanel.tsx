import React from "react";
import { Container } from "./styles";

import defesaCivilImg from "assets/images/defesaCivil.png";
import bombeirosImg from "assets/images/bombeiros.png";

const LeftPanel: React.FC = () => {
  return (
    <Container>
      <header>
        <img src={defesaCivilImg} alt="Defesa Civil" />
        <h6>DEFESA CIVIL</h6>
        <img src={bombeirosImg} alt="Defesa Civil" />
      </header>
    </Container>
  );
};

export default LeftPanel;
