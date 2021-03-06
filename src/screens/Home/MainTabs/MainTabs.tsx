import { usePlanData } from "context/PlanData/planDataContext";
import { useSystem } from "context/System/systemContext";
import React, { useCallback, useEffect, useState } from "react";

import { Tab, Nav, Button } from "react-bootstrap";
import StepOne from "screens/step1/StepOne";
import StepTwo from "screens/step2/StepTwo";
import StepThree from "screens/step3/StepThree";
import StepFour from "screens/step4/StepFour";
import StepFive from "screens/step5/StepFive";
import usePrevious from "shared/utils/usePrevious";

import { TabHeader, TabItem, Content } from "./styles";

const MainTabs = () => {
  const {
    handleTabChange,
    selectedTab,
    selectedTabIndex,
    setSelectedTab,
    isOpenLeftSideMenu,
  } = useSystem();

  const { updateAPIPlanData, planData, updateLocalPlanFromAPI } = usePlanData();

  const previousData = usePrevious(planData);

  const [allowAPIUpdate, setAllowAPIUpdate] = useState(false);

  const handleClickNext = useCallback(() => {
    setSelectedTab(`tab${selectedTabIndex + 1}`);
  }, [selectedTabIndex, setSelectedTab]);

  useEffect(() => {
    if (previousData !== planData) {
      setAllowAPIUpdate(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planData]);

  useEffect(() => {
    if (allowAPIUpdate) {
      updateAPIPlanData();
      setAllowAPIUpdate(false);
    } //

    if (selectedTab === "tab2") {
      // updateLocalPlanFromAPI();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab]);

  return (
    <Tab.Container activeKey={selectedTab} onSelect={handleTabChange}>
      <TabHeader isLeftMenuOpen={isOpenLeftSideMenu}>
        <TabItem styled={{ stepHasPassed: 1 < selectedTabIndex }}>
          <Nav.Link eventKey="tab1"></Nav.Link>
        </TabItem>

        <TabItem styled={{ stepHasPassed: 2 < selectedTabIndex }}>
          <Nav.Link eventKey="tab2"></Nav.Link>
        </TabItem>

        <TabItem styled={{ stepHasPassed: 3 < selectedTabIndex }}>
          <Nav.Link eventKey="tab3"></Nav.Link>
        </TabItem>

        <TabItem styled={{ stepHasPassed: 4 < selectedTabIndex }}>
          <Nav.Link eventKey="tab4"></Nav.Link>
        </TabItem>

        <TabItem styled={{ stepHasPassed: 5 < selectedTabIndex }}>
          <Nav.Link eventKey="tab5"></Nav.Link>
        </TabItem>

        <TabItem styled={{ stepHasPassed: 6 < selectedTabIndex }}>
          <Nav.Link eventKey="tab6"></Nav.Link>
        </TabItem>

        <TabItem styled={{ stepHasPassed: 7 < selectedTabIndex }}>
          <Nav.Link eventKey="tab7"></Nav.Link>
        </TabItem>
      </TabHeader>

      <Content
        className="tab-content"
        isLeftMenuOpen={isOpenLeftSideMenu}
        selectedTab={selectedTab}
      >
        <Tab.Pane eventKey="tab1">
          <h4>1: DESCRIÇÃO GERAL DO PLANO DE CONTINGÊNCIA</h4>
          <StepOne />
          <Button
            onClick={handleClickNext}
            className="darkBlueButton nextButton"
          >
            Próximo
          </Button>
        </Tab.Pane>

        <Tab.Pane eventKey="tab2">
          <h4>2: GRUPO DE TRABALHO</h4>
          <StepTwo />
          <Button
            onClick={handleClickNext}
            className="darkBlueButton nextButton"
          >
            Próximo
          </Button>
        </Tab.Pane>

        <Tab.Pane eventKey="tab3">
          <h4>3: ESPECIFIQUE O ENDEREÇO DOS LOCAIS DE RISCO</h4>
          <StepThree />
        </Tab.Pane>

        <Tab.Pane eventKey="tab4">
          <StepFour />
          <Button
            onClick={handleClickNext}
            className="darkBlueButton nextButton"
          >
            Próximo
          </Button>
        </Tab.Pane>

        <Tab.Pane eventKey="tab5">
          <StepFive />
          <Button
            onClick={handleClickNext}
            className="darkBlueButton nextButton"
          >
            Próximo
          </Button>
        </Tab.Pane>
      </Content>
    </Tab.Container>
  );
};

export default MainTabs;
