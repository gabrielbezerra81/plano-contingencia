import produce from "immer";
import React, { useCallback, useContext, useState } from "react";
import mapLocalDataToUpdatePayload from "shared/utils/mapLocalDataToUpdatePayload";
import { Person, RiskLocation, Resources, Member, PlanData } from "types/Plan";

interface PlanDataContextData {
  planData: PlanData;
  resources: Resources;
  persons: Array<Person>;
  includedPersons: Array<Person>;
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

  const [wasPlanCreated, setWasPlanCreated] = useState(false);

  const [includedPersons, setIncludedPersons] = useState<Person[]>([]);

  const [persons, setPersons] = useState<Person[]>([]);

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

      const payload = mapLocalDataToUpdatePayload(data);

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
        persons,
        addRiskLocation,
        resources,
        updatePlanData,
        includedPersons,
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
