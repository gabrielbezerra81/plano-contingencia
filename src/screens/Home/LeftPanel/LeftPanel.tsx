import React, { useCallback } from "react";
import { Container } from "./styles";

import defesaCivilImg from "assets/images/defesaCivil.png";
import bombeirosImg from "assets/images/bombeiros.png";
import menuIcon from "assets/images/menu.png";
import { useSystem } from "context/System/systemContext";

const LeftPanel: React.FC = () => {
  const { activeAppTab, setActiveAppTab } = useSystem();

  const handleOpenMenu = useCallback(() => {}, []);

  const handleListPlans = useCallback(() => {}, []);

  const handleSearchPlan = useCallback(() => {}, []);

  const handleCreatePlan = useCallback(() => {}, []);

  return (
    <Container>
      <header>
        <img src={defesaCivilImg} alt="Defesa Civil" />
        <h6>DEFESA CIVIL</h6>
        <img src={bombeirosImg} alt="Defesa Civil" />
      </header>
      <div>
        <div className="menuItem">
          <button onClick={handleOpenMenu}>
            <img src={menuIcon} alt="Menu" />
          </button>
          <h6>MENU</h6>
        </div>
        <button onClick={handleListPlans} className="menuItem">
          <div>
            <h6>PLANOS DE CONTINGÊNCIA</h6>
          </div>
        </button>
        <button onClick={handleSearchPlan} className="menuItem">
          <div>
            <h6>PESQUISAR PLANO</h6>
          </div>
        </button>
        <button onClick={handleCreatePlan} className="menuItem">
          <div>
            <h6>CADASTRAR NOVO PLANO</h6>
          </div>
        </button>
      </div>
    </Container>
  );
};

export default LeftPanel;
