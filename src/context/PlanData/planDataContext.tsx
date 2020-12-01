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
import mapPessoaToLocalPerson from "shared/utils/typesMapping/person/mapPessoaToLocalPerson";
import mapApiPlanToLocalPlan from "shared/utils/typesMapping/plan/mapApiPlanToLocalPlan";
import mapPlanToAPIPayload from "shared/utils/typesMapping/plan/mapPlanToAPIPayload";
import { Pessoa } from "types/ModelsAPI";
import { Person, RiskLocation, Member, PlanData } from "types/Plan";

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
  addUserToWorkGroup: (
    person: Person & { permission: any; anotherRole?: string },
  ) => void;
  addNewUser: (person: Person) => Promise<Person | null>;
  addRiskLocation: (riskLocation: RiskLocation) => void;
  removeRiskLocation: (index: number) => void;
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
    resources: [
      {
        id: "",
        address: {
          cep: "64660-000",
          city: "Pio IX",
          complement: "",
          lat: "0",
          long: "0",
          name: "Pio IX",
          neighbor: "Centro",
          refPoint: "",
          state: "PI",
          street: "Rua Major Vitalino Bezerra",
          number: "370",
        },
        responsibles: [
          {
            name: "Gabriel",
            permission: "editor",
            personId: "",
            phone: "(86) 99831-9883",
            role: "Dev web",
            status: 0,
          },
        ],
      },
      {
        id: "",
        address: {
          cep: "64660-000",
          city: "Pio IX",
          complement: "",
          lat: "0",
          long: "0",
          name: "Pio IX",
          neighbor: "Centro",
          refPoint: "",
          state: "PI",
          street: "Rua Major Vitalino Bezerra",
          number: "370",
        },
        responsibles: [
          {
            name: "Gabriel",
            permission: "editor",
            personId: "",
            phone: "(86) 99831-9883",
            role: "Dev web",
            status: 0,
          },
        ],
      },
    ],
  });

  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);

  const [includedPersons, setIncludedPersons] = useState<Person[]>([]);

  const [persons, setPersons] = useState<Person[]>([]);

  const updateLocalPlanData = useCallback(
    (planData: Partial<PlanData>) => {
      try {
        const updatedPlanData = produce(data, (draft) => {
          Object.assign(draft, planData);
        });

        setData(updatedPlanData);
        localStorage.setItem(
          plan_LocalStorageString,
          JSON.stringify(updatedPlanData),
        );
      } catch (error) {}
    },
    [data],
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
            JSON.stringify(updatedPlan),
          );
        }
      }
    } catch (error) {}
  }, [currentPlanId]);

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

      newMember.phone = getMainPhoneFromPerson(person);

      localStorage.setItem(
        includedPersons_LocalStorageString,
        JSON.stringify(updatedIncludedPersons),
      );

      updateLocalPlanData({ workGroup: [...data.workGroup, newMember] });
    },
    [includedPersons, updateLocalPlanData, data],
  );

  const addNewUser = useCallback(
    async (person: Person) => {
      try {
        console.log(person.birthDate);
        const payload: Partial<Pessoa> = {
          nome: person.name,
          sobrenome: person.surname,
          emails: person.emails,
          nascimento: person.birthDate,
          sexo: person.gender,
          enderecos: person.addresses.map((address) => ({
            localidade: address.city,
            bairro: address.neighbor,
            cep: address.cep,
            logradouro: address.street,
            numero: address.number,
            complemento: address.complement,
            uf: address.state,
            latitude: address.latitude,
            longitude: address.longitude,
            identificacao: address.identification,
          })),
          telefones: person.phones.map((phone) => ({
            ddd_numero: phone.phone,
            observacao: phone.obs,
            prioridade: phone.priority,
            tipo: phone.type,
          })),
        };

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
    [persons],
  );

  const addRiskLocation = useCallback(
    (riskLocation: RiskLocation) => {
      const updatedPlanData = produce(data, (draft) => {
        const [street, number] = riskLocation.street.split(",");

        draft.riskLocations.push({
          ...riskLocation,
          street,
          number: number ? number.trimStart() : "",
        });
      });

      updateLocalPlanData(updatedPlanData);
    },
    [data, updateLocalPlanData],
  );

  const removeRiskLocation = useCallback(
    (index: number) => {
      const updatedPlanData = produce(data, (draft) => {
        draft.riskLocations.splice(index, 1);
      });

      updateLocalPlanData(updatedPlanData);
    },
    [data, updateLocalPlanData],
  );

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
      includedPersons_LocalStorageString,
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
          includedItem.id === personItem.id,
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
            response.data.map((endereco) => mapPessoaToLocalPerson(endereco)),
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
