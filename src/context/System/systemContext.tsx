import React, { useCallback, useContext, useState } from "react";

interface SystemContextData {
  isOpenRightSideMenu: boolean;
  changeRightSideMenuVisibility: () => void;
  activeAppTab: ActiveAppTab;
  setActiveAppTab: React.Dispatch<React.SetStateAction<ActiveAppTab>>;
}

const SystemContext = React.createContext<SystemContextData>(
  {} as SystemContextData,
);

type ActiveAppTab = "plans" | "searchPlan" | "createPlan";

const SystemProvider: React.FC = ({ children }) => {
  const [isOpenRightSideMenu, setIsOpenRightSideMenu] = useState(false);
  const [activeAppTab, setActiveAppTab] = useState<ActiveAppTab>("plans");

  const changeRightSideMenuVisibility = useCallback(() => {
    setIsOpenRightSideMenu((oldValue) => !oldValue);
  }, []);

  return (
    <SystemContext.Provider
      value={{
        isOpenRightSideMenu,
        changeRightSideMenuVisibility,
        activeAppTab,
        setActiveAppTab,
      }}
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
