import api from "api/config";
import produce from "immer";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import mapPlanToAPIPayload from "shared/utils/mapPlanToAPIPayload";
import usePrevious from "shared/utils/usePrevious";
import { Person, RiskLocation, Resources, Member, PlanData } from "types/Plan";

const planLocalStorageString = "@plan:planData";
const personsLocalStorageString = "@plan:persons";
const includedPersonsLocalStorageString = "@plan:includedPersons";

interface PlanDataContextData {
  planData: PlanData;
  // resources: Resources;
  persons: Array<Person>;
  includedPersons: Array<Person>;
  updateLocalPlanData: (data: Partial<PlanData>) => void;
  updateAPIPlanData: () => Promise<void>;
  addUserToWorkGroup: (
    person: Person & { permission: any; anotherRole?: string },
  ) => void;
  addNewUser: (person: Person) => void;
  addRiskLocation: () => void;
  notIncludedPersons: Array<Person>;
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

  const previousData = usePrevious(data);

  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);

  const [includedPersons, setIncludedPersons] = useState<Person[]>([]);

  const [persons, setPersons] = useState<Person[]>([]);

  // const [resources, setResources] = useState<Resources>({
  //   people: [],
  //   vehicles: [],
  //   materials: [],
  //   foods: [],
  //   homes: [],
  //   moneys: [],
  // });

  const updateLocalPlanData = useCallback(
    async (planData: Partial<PlanData>) => {
      try {
        const updatedPlanData = produce(data, (draft) => {
          Object.assign(draft, planData);
        });

        setData(updatedPlanData);
        localStorage.setItem(
          planLocalStorageString,
          JSON.stringify(updatedPlanData),
        );
      } catch (error) {}
    },
    [data],
  );

  const updateAPIPlanData = useCallback(async () => {
    const payload = mapPlanToAPIPayload(data);

    if (previousData === data) {
      return;
    }

    // if (currentPlanId) {
    //   await api.put(`planos/${currentPlanId}`, payload);
    // } //
    // else {
    //   const response = await api.post("planos", payload);

    //   // const id = response.headers.location.replace(
    //   //   "	https://contingencia.defesacivil.site/planos/",
    //   //   "",
    //   // );

    //   // setCurrentPlanId(id);
    // }
  }, [currentPlanId, data, previousData]);

  const addUserToWorkGroup = useCallback(
    (person: Person & { permission: any; anotherRole?: string }) => {
      const updatedIncludedPersons = produce(includedPersons, (draft) => {
        draft.push(person);
      });

      setIncludedPersons(updatedIncludedPersons);

      const newMember: Member = {
        name: person.name,
        role: person.anotherRole || person.role,
        personId: person.id,
        status: 0,
        permission: person.permission,
        phone: "",
      };

      const mainPhone = person.phones.find(
        (phoneItem) => phoneItem.priority === 1,
      );

      if (mainPhone) {
        newMember.phone = mainPhone.phone;
      } //
      else if (person.phones.length > 0) {
        newMember.phone = person.phones[0].phone;
      }

      localStorage.setItem(
        includedPersonsLocalStorageString,
        JSON.stringify(updatedIncludedPersons),
      );

      updateLocalPlanData({ workGroup: [...data.workGroup, newMember] });
    },
    [includedPersons, updateLocalPlanData, data],
  );

  const addNewUser = useCallback(
    (person: Person) => {
      const updatedPersons = produce(persons, (draft) => {
        draft.push(person);
      });

      setPersons(updatedPersons);
      localStorage.setItem(
        personsLocalStorageString,
        JSON.stringify(updatedPersons),
      );
    },
    [persons],
  );

  const addRiskLocation = useCallback(() => {}, []);

  useEffect(() => {
    const planString = localStorage.getItem(planLocalStorageString);
    const personsString = localStorage.getItem(personsLocalStorageString);
    const includedPersonsString = localStorage.getItem(
      includedPersonsLocalStorageString,
    );

    if (planString) {
      setData(JSON.parse(planString));
    }

    if (personsString) {
      setPersons(JSON.parse(personsString));
    }

    if (includedPersonsString) {
      setIncludedPersons(JSON.parse(includedPersonsString));
    }
  }, []);

  const notIncludedPersons = useMemo(() => {
    return persons.filter((personItem) => {
      const alreadyIncluded = includedPersons.some(
        (includedItem) =>
          includedItem.name === personItem.name &&
          includedItem.id === personItem.id,
      );

      return !alreadyIncluded;
    });
  }, [persons, includedPersons]);

  return (
    <PlanDataContext.Provider
      value={{
        planData: data,
        addUserToWorkGroup,
        addNewUser,
        persons,
        addRiskLocation,
        updateLocalPlanData,
        includedPersons,
        updateAPIPlanData,
        notIncludedPersons,
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
