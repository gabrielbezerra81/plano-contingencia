import { usePlanData } from "context/PlanData/planDataContext";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Tab, Nav, Button } from "react-bootstrap";
import StepOne from "screens/step1/StepOne";
import StepTwo from "screens/step2/StepTwo";
import StepThree from "screens/step3/StepThree";
import StepFour from "screens/step4/StepFour";

import { TabHeader, TabItem, Content } from "./styles";

const MainTabs = () => {
  const { updateAPIPlanData } = usePlanData();

  const [selectedTab, setSelectedTab] = useState<string>(() => {
    const tabKey = localStorage.getItem("@plan:selectedTab");

    if (tabKey) {
      return tabKey;
    }

    return "tab1";
  });

  const handleTabChange = useCallback((key: string | null) => {
    if (key) {
      localStorage.setItem("@plan:selectedTab", key);
      setSelectedTab(key);
    }
  }, []);

  const selectedTabIndex = useMemo(() => {
    return Number(selectedTab.replace("tab", ""));
  }, [selectedTab]);

  const handleClickNext = useCallback(() => {
    setSelectedTab(`tab${selectedTabIndex + 1}`);
  }, [selectedTabIndex]);

  useEffect(() => {
    updateAPIPlanData();
  }, [updateAPIPlanData, selectedTab]);

  return (
    <Tab.Container activeKey={selectedTab} onSelect={handleTabChange}>
      <TabHeader>
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

      <Content className="tab-content">
        <Tab.Pane eventKey="tab1">
          <h3>1: DESCRIÇÃO GERAL DO PLANO DE CONTINGÊNCIA</h3>
          <StepOne />
          <Button
            onClick={handleClickNext}
            className="darkBlueButton nextButton"
          >
            Próximo
          </Button>
        </Tab.Pane>

        <Tab.Pane eventKey="tab2">
          <h3>2: GRUPO DE TRABALHO</h3>
          <StepTwo />
          <Button
            onClick={handleClickNext}
            className="darkBlueButton nextButton"
          >
            Próximo
          </Button>
        </Tab.Pane>

        <Tab.Pane eventKey="tab3">
          <h3>3: ESPECIFIQUE O ENDEREÇO DOS LOCAIS DE RISCO</h3>
          <StepThree selectedTabIndex={selectedTabIndex} />
          <Button
            onClick={handleClickNext}
            className="darkBlueButton nextButton"
          >
            Próximo
          </Button>
        </Tab.Pane>

        <Tab.Pane eventKey="tab4">
          <h3>4: CONSTRUÇÃO DE CENÁRIO</h3>
          <StepFour />
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
