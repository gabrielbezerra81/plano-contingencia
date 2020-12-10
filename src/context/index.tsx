import React from "react";
import GlobalStyle from "../assets/global";
import PlanDataProvider from "./PlanData/planDataContext";
import ScenarioProvider from "./PlanData/scenarioContext";
import SystemProvider from "./System/systemContext";

const AppProvider: React.FC = ({ children }) => {
  return (
    <SystemProvider>
      <PlanDataProvider>
        <ScenarioProvider>
          <GlobalStyle />
          {children}
        </ScenarioProvider>
      </PlanDataProvider>
    </SystemProvider>
  );
};

export default AppProvider;
