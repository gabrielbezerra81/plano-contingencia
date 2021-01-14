import api from "api/config";
import produce from "immer";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import getMainPhoneFromPerson from "shared/utils/getMainPhoneFromPerson";
import mapPersonToPessoa from "shared/utils/typesMapping/person/mapPersonToPessoa";
import mapPessoaToLocalPerson from "shared/utils/typesMapping/person/mapPessoaToLocalPerson";
import mapApiPlanToLocalPlan from "shared/utils/typesMapping/plan/mapApiPlanToLocalPlan";
import mapPlanToAPIPayload from "shared/utils/typesMapping/plan/mapPlanToAPIPayload";
import { Pessoa } from "types/ModelsAPI";
import { Person, RiskLocation, Member, PlanData, Resource } from "types/Plan";

const plan_LocalStorageString = "@plan:planData";
const includedPersons_LocalStorageString = "@plan:includedPersons";
const planId_LocalStorageString = "@plan:planId";

interface PlanDataContextData {
  planData: PlanData;
  persons: Array<Person>;
  includedPersons: Array<Person>;
  updateLocalPlanData: (data: Partial<PlanData>) => void;
  updateAPIPlanData: () => Promise<void>;
  updateLocalPlanFromAPI: () => Promise<void>;
  addUserToWorkGroup: (data: AddToWorkGroupProps) => Promise<void>;
  addNewUser: (person: Person) => Promise<Person | null>;
  addRiskLocation: (riskLocation: RiskLocation) => Promise<void>;
  removeRiskLocation: (index: number) => void;
  notIncludedPersons: Array<Person>;
  addResource: (resource: Resource) => Promise<void>;
  getSequenceId: (seqType: SequenceType) => Promise<string>;
  drawedPolygons: Array<PolygonGeoJSON>;
  setDrawedPolygons: React.Dispatch<React.SetStateAction<any[]>>;
}

const PlanDataContext = React.createContext<PlanDataContextData>(
  {} as PlanDataContextData
);

const PlanDataProvider: React.FC = ({ children }) => {
  const [data, setData] = useState<PlanData>({
    generalDescription: {
      title: "",
      description: "",
    },
    workGroup: [],
    riskLocations: [],
    resources: [],
    scenarios: [],
  });

  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);

  const [includedPersons, setIncludedPersons] = useState<Person[]>([]);

  const [persons, setPersons] = useState<Person[]>([]);

  const [drawedPolygons, setDrawedPolygons] = useState<PolygonGeoJSON[]>(() => {
    const data = localStorage.getItem("drawedPolygons");

    if (data) {
      return JSON.parse(data);
    }

    return [];
  });

  const getSequenceId = useCallback(async (seqType: SequenceType) => {
    try {
      const response = await api.get(`sequences/${seqType}`);

      console.log(`sequence ${seqType}`, response.data);

      return `${response.data}`;
    } catch (error) {
      console.log(error.response);
      return "";
    }
  }, []);

  const updateLocalPlanData = useCallback(
    (planData: Partial<PlanData>) => {
      try {
        const updatedPlanData = produce(data, (draft) => {
          Object.assign(draft, planData);
        });

        setData(updatedPlanData);
        localStorage.setItem(
          plan_LocalStorageString,
          JSON.stringify(updatedPlanData)
        );
      } catch (error) {}
    },
    [data]
  );

  const updateAPIPlanData = useCallback(async () => {
    try {
      const payload = mapPlanToAPIPayload(data);

      if (currentPlanId) {
        await api.put(`planos/${currentPlanId}`, payload);
      } //
      else {
        const response = await api.post("planos", payload);

        setCurrentPlanId(response.data);
        localStorage.setItem(planId_LocalStorageString, response.data);
      }
    } catch (error) {}
  }, [currentPlanId, data]);

  const updateLocalPlanFromAPI = useCallback(async () => {
    try {
      if (currentPlanId) {
        const response = await api.get(`planos/${currentPlanId}`);

        if (response.data) {
          const updatedPlan = mapApiPlanToLocalPlan(response.data);

          setData(updatedPlan);
          localStorage.setItem(
            plan_LocalStorageString,
            JSON.stringify(updatedPlan)
          );
        }
      }
    } catch (error) {}
  }, [currentPlanId]);

  const addUserToWorkGroup = useCallback(
    async ({ anotherRole, permission, ...person }: AddToWorkGroupProps) => {
      const updatedIncludedPersons = produce(includedPersons, (draft) => {
        draft.push(person);
      });

      setIncludedPersons(updatedIncludedPersons);

      const id = await getSequenceId("membros");

      // Para adicionar um membro com pessoa já existente é utilizado anotherRole
      // Para adicionar um membro logo após adicionar uma pessoa, é utilizado Role
      const newMember: Member = {
        name: person.name,
        role: anotherRole || person.role,
        personId: person.id,
        status: 0,
        permission: permission,
        phone: "",
        id,
      };

      newMember.phone = getMainPhoneFromPerson(person);

      localStorage.setItem(
        includedPersons_LocalStorageString,
        JSON.stringify(updatedIncludedPersons)
      );

      updateLocalPlanData({ workGroup: [...data.workGroup, newMember] });
    },
    [includedPersons, updateLocalPlanData, data, getSequenceId]
  );

  const addNewUser = useCallback(
    async (person: Person) => {
      try {
        const payload = mapPersonToPessoa(person);

        const response = await api.post("pessoas", payload);

        const newPerson = { ...person, id: response.data };

        const updatedPersons = produce(persons, (draft) => {
          draft.push(newPerson);
        });

        setPersons(updatedPersons);

        return newPerson;
      } catch (error) {
        console.log(error);
        alert("Erro ao cadastrar usuário");
        return null;
      }
    },
    [persons]
  );

  const addRiskLocation = useCallback(
    async (riskLocation: RiskLocation) => {
      const id = await getSequenceId("enderecos");

      const updatedPlanData = produce(data, (draft) => {
        const [street, number] = riskLocation.street.split(",");

        draft.riskLocations.push({
          ...riskLocation,
          street,
          number: number ? number.trimStart() : "",
          id,
        });
      });

      updateLocalPlanData(updatedPlanData);
    },
    [data, updateLocalPlanData, getSequenceId]
  );

  const removeRiskLocation = useCallback(
    (index: number) => {
      const updatedPlanData = produce(data, (draft) => {
        draft.riskLocations.splice(index, 1);
      });

      updateLocalPlanData(updatedPlanData);
    },
    [data, updateLocalPlanData]
  );

  const addResource = useCallback(
    async (resource: Resource) => {
      const id = await getSequenceId("recursos");

      const updatedPlanData = produce(data, (draft) => {
        draft.resources.push({ ...resource, id });
      });

      updateLocalPlanData(updatedPlanData);
    },
    [data, updateLocalPlanData, getSequenceId]
  );

  // carregar dados do armazenamento local
  useEffect(() => {
    const id = localStorage.getItem(planId_LocalStorageString);

    if (id) {
      setCurrentPlanId(id);
    }

    const planString = localStorage.getItem(plan_LocalStorageString);

    if (planString) {
      setData(JSON.parse(planString));
    }

    const includedPersonsString = localStorage.getItem(
      includedPersons_LocalStorageString
    );

    if (includedPersonsString) {
      setIncludedPersons(JSON.parse(includedPersonsString));
    }
  }, []);

  const notIncludedPersons = useMemo(() => {
    return persons.filter((personItem) => {
      const alreadyIncluded = includedPersons.some(
        (includedItem) =>
          includedItem.name === personItem.name &&
          includedItem.id === personItem.id
      );

      return !alreadyIncluded;
    });
  }, [persons, includedPersons]);

  useEffect(() => {
    api
      .get<Pessoa[]>("pessoas")
      .then((response) => {
        if (response.data) {
          setPersons(
            response.data.map((endereco) => mapPessoaToLocalPerson(endereco))
          );
        }
      })
      .catch();
  }, []);

  return (
    <PlanDataContext.Provider
      value={{
        planData: data,
        addUserToWorkGroup,
        addNewUser,
        persons,
        addRiskLocation,
        removeRiskLocation,
        updateLocalPlanData,
        includedPersons,
        updateAPIPlanData,
        notIncludedPersons,
        updateLocalPlanFromAPI,
        addResource,
        getSequenceId,
        drawedPolygons,
        setDrawedPolygons,
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

type SequenceType = "cenarios" | "enderecos" | "membros" | "recursos";

interface AddToWorkGroupProps extends Person {
  permission: any;
  anotherRole?: string;
}

interface PolygonGeoJSON {
  type: string;
  properties: {
    id: number;
    type: "polygon";
    [key: string]: any;
  };
  geometry: {
    type: "Polygon";
    coordinates: Array<Array<[number, number]>>;
  };
}
