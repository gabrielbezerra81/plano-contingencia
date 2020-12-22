import React, { useCallback, useContext, useMemo, useState } from "react";

interface SystemContextData {
  isOpenRightSideMenu: boolean;
  isOpenLeftSideMenu: boolean;
  changeRightSideMenuVisibility: (visibility?: boolean) => void;
  changeLeftSideMenuVisibility: (visibility?: boolean) => void;
  activeAppTab: ActiveAppTab;
  setActiveAppTab: React.Dispatch<React.SetStateAction<ActiveAppTab>>;
  handleTabChange: (key: string | null) => void;
  selectedTab: string;
  selectedTabIndex: number;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}

const SystemContext = React.createContext<SystemContextData>(
  {} as SystemContextData,
);

type ActiveAppTab = "plans" | "searchPlan" | "createPlan";

const SystemProvider: React.FC = ({ children }) => {
  const [isOpenRightSideMenu, setIsOpenRightSideMenu] = useState(false);
  const [isOpenLeftSideMenu, setIsOpenLeftSideMenu] = useState(true);

  const [activeAppTab, setActiveAppTab] = useState<ActiveAppTab>("plans");

  const [selectedTab, setSelectedTab] = useState<string>(() => {
    const tabKey = localStorage.getItem("@plan:selectedTab");

    if (tabKey) {
      return tabKey;
    }

    return "tab1";
  });

  const handleTabChange = useCallback((key: string | null) => {
    if (key) {
      localStorage.setItem("@plan:selectedTab", key);
      setSelectedTab(key);
    }
  }, []);

  const changeRightSideMenuVisibility = useCallback((visibility?: boolean) => {
    if (visibility === true || visibility === false) {
      setIsOpenRightSideMenu(visibility);
    } //
    else {
      setIsOpenRightSideMenu((oldValue) => !oldValue);
    }
  }, []);

  const changeLeftSideMenuVisibility = useCallback((visibility?: boolean) => {
    if (visibility === true || visibility === false) {
      setIsOpenLeftSideMenu(visibility);
    } //
    else {
      setIsOpenLeftSideMenu((oldValue) => !oldValue);
    }
  }, []);

  const selectedTabIndex = useMemo(() => {
    return Number(selectedTab.replace("tab", ""));
  }, [selectedTab]);

  return (
    <SystemContext.Provider
      value={{
        isOpenRightSideMenu,
        changeRightSideMenuVisibility,
        isOpenLeftSideMenu,
        changeLeftSideMenuVisibility,
        activeAppTab,
        setActiveAppTab,
        handleTabChange,
        selectedTab,
        selectedTabIndex,
        setSelectedTab,
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
