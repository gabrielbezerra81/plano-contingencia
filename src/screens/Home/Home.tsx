import React from "react";
import LeftPanel from "./LeftPanel/LeftPanel";
import RightSideMenu from "./RightSideMenu/RightSideMenu";

import { Container } from "./styles";
import MainTabs from "./MainTabs/MainTabs";
import { useSystem } from "context/System/systemContext";
import ListPlans from "screens/ListPlans/ListPlans";
import LogoutMenu from "./LogoutMenu/LogoutMenu";

const Home: React.FC = () => {
  const { activeAppTab } = useSystem();

  return (
    <Container>
      <LogoutMenu />
      <LeftPanel />
      <main>
        {activeAppTab === "plans" && <ListPlans />}

        {activeAppTab === "createPlan" && <MainTabs />}
      </main>
      <RightSideMenu />
    </Container>
  );
};

export default Home;
