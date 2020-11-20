import React, { useCallback, useState } from "react";

import { Tab, Nav } from "react-bootstrap";
import StepOne from "screens/stepOne/StepOne";
import StepTwo from "screens/stepTwo/StepTwo";

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

  return (
    <Tab.Container activeKey={selectedTab} onSelect={handleTabChange}>
      <TabHeader>
        <TabItem>
          <Nav.Link eventKey="tab1"></Nav.Link>
        </TabItem>

        <TabItem>
          <Nav.Link eventKey="tab2"></Nav.Link>
        </TabItem>

        <TabItem>
          <Nav.Link eventKey="tab3"></Nav.Link>
        </TabItem>

        <TabItem>
          <Nav.Link eventKey="tab4"></Nav.Link>
        </TabItem>

        <TabItem>
          <Nav.Link eventKey="tab5"></Nav.Link>
        </TabItem>

        <TabItem>
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
      </Content>
    </Tab.Container>
  );
};

export default MainTabs;
