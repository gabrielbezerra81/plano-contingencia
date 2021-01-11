import React, { useCallback, useEffect } from "react";
import { Container } from "./styles";

import defesaCivilImg from "assets/images/defesaCivil.png";
import bombeirosImg from "assets/images/bombeiros.png";
import menuIcon from "assets/images/menu.png";
import { useSystem } from "context/System/systemContext";

const LeftPanel: React.FC = () => {
  const {
    activeAppTab,
    selectedTab,
    isOpenLeftSideMenu,
    changeLeftSideMenuVisibility,
    handleAppTabChange,
  } = useSystem();

  const handleOpenMenu = useCallback(() => {}, []);

  const handleListPlans = useCallback(
    (e) => {
      handleAppTabChange(e.currentTarget.name);
    },
    [handleAppTabChange]
  );

  const handleSearchPlan = useCallback(
    (e) => {
      handleAppTabChange(e.currentTarget.name);
    },
    [handleAppTabChange]
  );

  const handleCreatePlan = useCallback(
    (e) => {
      handleAppTabChange(e.currentTarget.name);
    },
    [handleAppTabChange]
  );

  useEffect(() => {
    if (
      ["tab3", "tab4"].includes(selectedTab) &&
      activeAppTab === "createPlan"
    ) {
      changeLeftSideMenuVisibility(false);
    } //
    else {
      changeLeftSideMenuVisibility(true);
    }
  }, [selectedTab, changeLeftSideMenuVisibility, activeAppTab]);

  return (
    <Container activeAppTab={activeAppTab} isOpen={isOpenLeftSideMenu}>
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
        {isOpenLeftSideMenu && (
          <>
            <button onClick={handleListPlans} name="plans" className="menuItem">
              <div>
                <h6>PLANOS DE CONTINGÊNCIA</h6>
              </div>
            </button>
            <button
              onClick={handleSearchPlan}
              name="searchPlan"
              className="menuItem"
            >
              <div>
                <h6>PESQUISAR PLANO</h6>
              </div>
            </button>
            <button
              onClick={handleCreatePlan}
              name="createPlan"
              className="menuItem"
            >
              <div>
                <h6>CADASTRAR NOVO PLANO</h6>
              </div>
            </button>
          </>
        )}
      </div>
    </Container>
  );
};

export default LeftPanel;
