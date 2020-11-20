import React from "react";
import LeftPanel from "./LeftPanel/LeftPanel";
import RightSideMenu from "./RightSideMenu/RightSideMenu";

import { Container } from "./styles";
import MainTabs from "./MainTabs/MainTabs";

const Home: React.FC = () => {
  return (
    <Container>
      <LeftPanel />
      <main>
        <MainTabs />
      </main>
      <RightSideMenu />
    </Container>
  );
};

export default Home;
