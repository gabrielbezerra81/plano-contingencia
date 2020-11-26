import produce from "immer";
import React, { useCallback, useContext, useState } from "react";
import { User, RiskLocation, Resources } from "types/Plan";

interface PlanData {
  generalDescription: {
    title: string;
    description: string;
  };
  workGroup: Array<User>;
  riskLocations: Array<RiskLocation>;
}

interface PlanDataContextData {
  planData: PlanData;
  resources: Resources;
  users: Array<User>;
  updatePlanData: (data: Partial<PlanData>) => void;
  addUserToWorkGroup: () => void;
  addNewUser: () => void;
  addRiskLocation: () => void;
}

const PlanDataContext = React.createContext<PlanDataContextData>(
  {} as PlanDataContextData,
);

const PlanDataProvider: React.FC = ({ children }) => {
  const [data, setData] = useState<PlanData>({
    generalDescription: {
      title: "",
      description: "",
    },
    workGroup: [],
    riskLocations: [],
  });

  const [users, setUsers] = useState<User[]>([]);

  const [resources, setResources] = useState<Resources>({
    people: [],
    vehicles: [],
    materials: [],
    foods: [],
    homes: [],
    moneys: [],
  });

  const updatePlanData = useCallback(
    (planData: Partial<PlanData>) => {
      const updatedPlanData = produce(data, (draft) => {
        Object.assign(draft, planData);
      });

      setData(updatedPlanData);
    },
    [data],
  );

  const addUserToWorkGroup = useCallback(() => {}, []);

  const addNewUser = useCallback(() => {}, []);

  const addRiskLocation = useCallback(() => {}, []);

  return (
    <PlanDataContext.Provider
      value={{
        planData: data,
        addUserToWorkGroup,
        addNewUser,
        users,
        addRiskLocation,
        resources,
        updatePlanData,
      }}
    >
      {children}
    </PlanDataContext.Provider>
  );
};

export default PlanDataProvider;

export const usePlanData = () => {
  const context = useContext(PlanDataContext);

  return context;
};
