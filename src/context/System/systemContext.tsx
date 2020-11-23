import React, { useCallback, useContext, useState } from "react";

interface SystemContextData {
  isOpenRightSideMenu: boolean;
  changeRightSideMenuVisibility: () => void;
}

const SystemContext = React.createContext<SystemContextData>(
  {} as SystemContextData,
);

const SystemProvider: React.FC = ({ children }) => {
  const [isOpenRightSideMenu, setIsOpenRightSideMenu] = useState(false);

  const changeRightSideMenuVisibility = useCallback(() => {
    setIsOpenRightSideMenu((oldValue) => !oldValue);
  }, []);

  return (
    <SystemContext.Provider
      value={{ isOpenRightSideMenu, changeRightSideMenuVisibility }}
    >
      {children}
    </SystemContext.Provider>
  );
};

export default SystemProvider;

export const useSystem = () => {
  const context = useContext(SystemContext);

  return context;
};
