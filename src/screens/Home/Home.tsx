import React from "react";
import LeftPanel from "./LeftPanel/LeftPanel";
import RightSideMenu from "./RightSideMenu/RightSideMenu";

import { Container } from "./styles";
import MainTabs from "./MainTabs/MainTabs";
import { useSystem } from "context/System/systemContext";

const Home: React.FC = () => {
  const { activeAppTab } = useSystem();

  return (
    <Container>
      <LeftPanel />
      <main>{activeAppTab === "createPlan" && <MainTabs />}</main>
      <RightSideMenu />
    </Container>
  );
};

export default Home;
