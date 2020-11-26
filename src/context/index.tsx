import React from "react";
import GlobalStyle from "../assets/global";
import PlanDataProvider from "./PlanData/planDataContext";
import SystemProvider from "./System/systemContext";

const AppProvider: React.FC = ({ children }) => {
  return (
    <SystemProvider>
      <PlanDataProvider>
        <GlobalStyle />
        {children}
      </PlanDataProvider>
    </SystemProvider>
  );
};

export default AppProvider;
