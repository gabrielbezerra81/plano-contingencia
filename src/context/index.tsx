import React from "react";
import GlobalStyle from "../assets/global";
import AuthProvider from "./Auth/authContext";
import PlanDataProvider from "./PlanData/planDataContext";
import ScenarioProvider from "./Scenario/scenarioContext";
import SystemProvider from "./System/systemContext";

const AppProvider: React.FC = ({ children }) => {
  return (
    <AuthProvider>
      <SystemProvider>
        <PlanDataProvider>
          <ScenarioProvider>
            <GlobalStyle />
            {children}
          </ScenarioProvider>
        </PlanDataProvider>
      </SystemProvider>
    </AuthProvider>
  );
};

export default AppProvider;
