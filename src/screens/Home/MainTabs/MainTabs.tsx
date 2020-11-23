import React, { useCallback, useMemo, useState } from "react";

import { Tab, Nav } from "react-bootstrap";
import StepOne from "screens/step1/StepOne";
import StepTwo from "screens/step2/StepTwo";
import StepThree from "screens/step3/StepThree";

import { TabHeader, TabItem, Content } from "./styles";

const MainTabs = () => {
  const [selectedTab, setSelectedTab] = useState<string>(() => {
    const tabKey = localStorage.getItem("@plano:selectedTab");

    if (tabKey) {
      return tabKey;
    }

    return "tab1";
  });

  const handleTabChange = useCallback((key: string | null) => {
    if (key) {
      localStorage.setItem("@plano:selectedTab", key);
      setSelectedTab(key);
    }
  }, []);

  const selectedTabIndex = useMemo(() => {
    return Number(selectedTab.replace("tab", ""));
  }, [selectedTab]);

  return (
    <Tab.Container activeKey={selectedTab} onSelect={handleTabChange}>
      <TabHeader>
        <TabItem stepHasPassed={1 < selectedTabIndex}>
          <Nav.Link eventKey="tab1"></Nav.Link>
        </TabItem>

        <TabItem stepHasPassed={2 < selectedTabIndex}>
          <Nav.Link eventKey="tab2"></Nav.Link>
        </TabItem>

        <TabItem stepHasPassed={3 < selectedTabIndex}>
          <Nav.Link eventKey="tab3"></Nav.Link>
        </TabItem>

        <TabItem stepHasPassed={4 < selectedTabIndex}>
          <Nav.Link eventKey="tab4"></Nav.Link>
        </TabItem>

        <TabItem stepHasPassed={5 < selectedTabIndex}>
          <Nav.Link eventKey="tab5"></Nav.Link>
        </TabItem>

        <TabItem stepHasPassed={6 < selectedTabIndex}>
          <Nav.Link eventKey="tab6"></Nav.Link>
        </TabItem>

        <TabItem>
          <Nav.Link eventKey="tab7"></Nav.Link>
        </TabItem>
      </TabHeader>

      <Content className="tab-content">
        <Tab.Pane eventKey="tab1">
          <h3>1: DESCRIÇÃO GERAL DO PLANO DE CONTINGÊNCIA</h3>
          <StepOne />
        </Tab.Pane>

        <Tab.Pane eventKey="tab2">
          <h3>2: GRUPO DE TRABALHO</h3>
          <StepTwo />
        </Tab.Pane>

        <Tab.Pane eventKey="tab3">
          <h3>3: ESPECIFIQUE O ENDEREÇO DOS LOCAIS DE RISCO</h3>
          <StepThree />
        </Tab.Pane>
      </Content>
    </Tab.Container>
  );
};

export default MainTabs;
