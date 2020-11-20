import React from "react";
import GlobalStyle from "../assets/global";
import SystemProvider from "./System/systemContext";

const AppProvider: React.FC = ({ children }) => {
  return (
    <SystemProvider>
      <GlobalStyle />
      {children}
    </SystemProvider>
  );
};

export default AppProvider;
