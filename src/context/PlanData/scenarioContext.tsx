import produce from "immer";
import { WritableDraft } from "immer/dist/internal";
import React, {
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Measure, Risk, Scenario, Threat } from "types/Plan";

interface ScenarioContextData {
  addedCobrades: Threat[];
  setAddedCobrades: React.Dispatch<React.SetStateAction<Threat[]>>;
  addedHypotheses: string[];
  setAddedHypotheses: React.Dispatch<React.SetStateAction<string[]>>;
  addedRisks: Risk[];
  setAddedRisks: React.Dispatch<React.SetStateAction<Risk[]>>;
  addedMeasures: Measure[];
  setAddedMeasures: React.Dispatch<React.SetStateAction<Measure[]>>;
  scenariosList: Scenario[];
  setScenariosList: React.Dispatch<React.SetStateAction<Scenario[]>>;
  previousScenariosList: Scenario[];
  setPreviousScenariosList: React.Dispatch<React.SetStateAction<Scenario[]>>;
  verifyIfPreviousScenariosHasValue: (
    attr: keyof Scenario,
    value: any,
  ) => boolean;
  handleCheckItem: (attr: keyof Scenario, value: any) => void;
  scenarioTitle: string;
  setScenarioTitle: React.Dispatch<React.SetStateAction<string>>;
  disabledColumnsCheckbox: {
    address: boolean;
    threat: boolean;
    hypothese: boolean;
    risk: boolean;
    measure: boolean;
    responsible: boolean;
  };
}

const ScenarioContext = React.createContext<ScenarioContextData>(
  {} as ScenarioContextData,
);

const emptyScenario: Scenario = {
  addressId: "",
  hypothese: "",
  id: "",
  measure: {
    description: "",
    id: "",
  },
  resourceId: "",
  responsibles: [],
  risk: { description: "", id: "" },
  threat: { cobrade: "", description: "" },
  title: "",
};

const ScenarioProvider: React.FC = ({ children }) => {
  const [scenarioTitle, setScenarioTitle] = useState(() => {
    const title = localStorage.getItem("scenarioTitle");

    return title || "";
  });

  const [addedCobrades, setAddedCobrades] = useState<Threat[]>(() => {
    const cobrades = localStorage.getItem("addedCobrades");

    if (cobrades) {
      return JSON.parse(cobrades);
    }
    return [];
  });
  const [addedHypotheses, setAddedHypotheses] = useState<string[]>(() => {
    const hypotheses = localStorage.getItem("addedHypotheses");

    if (hypotheses) {
      return JSON.parse(hypotheses);
    }
    return [];
  });
  const [addedRisks, setAddedRisks] = useState<Risk[]>(() => {
    const risks = localStorage.getItem("addedRisks");

    if (risks) {
      return JSON.parse(risks);
    }
    return [];
  });
  const [addedMeasures, setAddedMeasures] = useState<Measure[]>(() => {
    const risks = localStorage.getItem("addedMeasures");

    if (risks) {
      return JSON.parse(risks);
    }
    return [];
  });

  const [scenariosList, setScenariosList] = useState<Scenario[]>(() => {
    const scenarios = localStorage.getItem("scenariosList");

    if (scenarios) {
      return JSON.parse(scenarios);
    }

    return [];
  });
  const [previousScenariosList, setPreviousScenariosList] = useState<
    Scenario[]
  >(() => {
    const scenarios = localStorage.getItem("previousScenariosList");

    if (scenarios) {
      return JSON.parse(scenarios);
    }

    return [];
  });

  const filterScenariosList = useCallback(
    ({ list, attr, value }: FilterScenarioList) => {
      if (attr === "responsibles") {
        list.forEach((scenario: Scenario) => {
          scenario.responsibles.forEach((responsible, index) => {
            if (
              `${responsible.name} ${responsible.role} ${responsible.permission}` ===
              value
            ) {
              scenario.responsibles.splice(index, 1);
            }
          });
        });
      } //
      else {
        const filtered = list.filter((scenario: Scenario) => {
          switch (attr) {
            case "addressId":
              return scenario.addressId !== value;
            case "threat":
              return scenario.threat.cobrade !== value;
            case "hypothese":
              return scenario.hypothese !== value;
            case "risk":
              return scenario.risk.description !== value;
            case "measure":
              return scenario.measure.description !== value;
            case "resourceId":
              return scenario.resourceId !== value;
            default:
              return true;
          }
        });

        return filtered;
      }
    },
    [],
  );

  const verifyIfPreviousScenariosHasValue = useCallback(
    (attr: keyof Scenario, value: any): boolean => {
      const valueExists = previousScenariosList.some((scenario) => {
        if (["addressId", "hypothese", "resourceId"].includes(attr)) {
          return scenario[attr] === value;
        }

        if (attr === "threat") {
          return scenario.threat.cobrade === value;
        }

        if (attr === "risk" || attr === "measure") {
          return scenario[attr].description === value;
        }

        if (attr === "responsibles") {
          return scenario.responsibles.some(
            (responsible) =>
              `${responsible.name} ${responsible.role} ${responsible.permission}` ===
              value,
          );
        }

        return false;
      });

      return valueExists;
    },
    [previousScenariosList],
  );

  const duplicateScenariosLines = useCallback(
    ({ attr, value, draftScenariosList }: DuplicateScenariosLines) => {
      let compareValue = value;

      if (attr === "threat") {
        compareValue = value.cobrade;
      } //
      else if (["risk", "measure"].includes(attr)) {
        compareValue = value.description;
      } //
      else if (attr === "responsibles") {
        compareValue = `${value.name} ${value.role} ${value.permission}`;
      }

      const alreadyAdded = verifyIfPreviousScenariosHasValue(
        attr,
        compareValue,
      );

      if (!alreadyAdded) {
        // Cenario possui um array de responsaveis, então so precisa fazer o push
        if (attr === "responsibles") {
          draftScenariosList.forEach((scenario) => {
            scenario.responsibles.push(value);
          });
          setPreviousScenariosList((previousScenarios) => {
            const updatedPreviousScenarios = produce(
              previousScenarios,
              (previousDraft) => {
                previousDraft.forEach((previousScenario) => {
                  previousScenario.responsibles.push(value);
                });
              },
            );

            return updatedPreviousScenarios;
          });
        } // Demais atributos que possuem que cada cenario possui apenas 1 irão ramificar
        else {
          previousScenariosList.forEach((prevScenario) => {
            let shouldChangeAttrInLine: boolean = false;
            let nestedFindValue = "";

            switch (attr) {
              case "threat":
                shouldChangeAttrInLine = !prevScenario.threat.cobrade;
                nestedFindValue = "cobrade";
                break;
              case "hypothese":
                shouldChangeAttrInLine =
                  !!prevScenario.threat.cobrade && !prevScenario.hypothese;
                break;
              case "risk":
                shouldChangeAttrInLine =
                  !!prevScenario.hypothese && !prevScenario.risk.description;
                nestedFindValue = "description";
                break;
              case "measure":
                shouldChangeAttrInLine =
                  !!prevScenario.risk.description &&
                  !prevScenario.measure.description;
                nestedFindValue = "description";
                break;
              case "resourceId":
                shouldChangeAttrInLine =
                  !!prevScenario.measure.description &&
                  !prevScenario.resourceId;
                break;
              default:
                break;
            }

            if (shouldChangeAttrInLine) {
              // Procurar cenário que está com o atributo atual vazio
              const scenarioItem = draftScenariosList.find((scenario) => {
                let findValue: any = scenario[attr];

                if (nestedFindValue) {
                  findValue = findValue[nestedFindValue];
                }

                return !findValue;
              });

              // Se encontrar um com o atributo vazio, preenche o valor dessa linha
              if (scenarioItem) {
                scenarioItem[attr] = value;
              } // Caso contrario, será criada uma nova linha com o nvo valor marcado
              else {
                draftScenariosList.push({
                  ...prevScenario,
                  [attr]: value,
                  title: scenarioTitle,
                });
              }
              setPreviousScenariosList((oldValues) => [
                ...oldValues,
                { ...prevScenario, [attr]: value },
              ]);
            }
          });
        }
      } //
      else {
        setPreviousScenariosList((oldList) => {
          const updatedOldList = produce(oldList, (oldListDraft) => {
            return filterScenariosList({
              list: oldListDraft,
              attr,
              value: compareValue,
            });
          });
          return updatedOldList;
        });

        return filterScenariosList({
          list: draftScenariosList,
          attr,
          value: compareValue,
        });
      }
    },
    [
      verifyIfPreviousScenariosHasValue,
      filterScenariosList,
      previousScenariosList,
      scenarioTitle,
    ],
  );

  const handleCheckItem = useCallback(
    (attr: keyof Scenario, value: any) => {
      const updatedScenarios = produce(scenariosList, (draft) => {
        if (attr === "addressId") {
          const alreadyAdded = verifyIfPreviousScenariosHasValue(attr, value);

          if (!alreadyAdded) {
            draft.push({
              ...emptyScenario,
              addressId: value,
              title: scenarioTitle,
            });
            setPreviousScenariosList((oldValues) => [
              ...oldValues,
              { ...emptyScenario, addressId: value },
            ]);
          } //
          else {
            setPreviousScenariosList((oldValues) => {
              const updatedOldValues = produce(oldValues, (oldValuesDraft) => {
                return filterScenariosList({
                  list: oldValuesDraft,
                  attr: "addressId",
                  value,
                });
              });

              return updatedOldValues;
            });
            return filterScenariosList({
              list: draft,
              attr: "addressId",
              value,
            });
          }
        } //
        else {
          // Para demais atributos
          return duplicateScenariosLines({
            attr,
            value,
            draftScenariosList: draft,
          });
        }
      });

      setScenariosList(updatedScenarios);
    },
    [
      scenariosList,
      verifyIfPreviousScenariosHasValue,
      filterScenariosList,
      duplicateScenariosLines,
      scenarioTitle,
    ],
  );

  // Salvar hipoteses - armazenamento local
  useEffect(() => {
    localStorage.setItem("addedHypotheses", JSON.stringify(addedHypotheses));
  }, [addedHypotheses]);

  // Salvar cobrades - A.L.
  useEffect(() => {
    localStorage.setItem("addedCobrades", JSON.stringify(addedCobrades));
  }, [addedCobrades]);

  // Salvar hipoteses - A.L.
  useEffect(() => {
    localStorage.setItem("addedRisks", JSON.stringify(addedRisks));
  }, [addedRisks]);

  // Salvar medidas - A.L.
  useEffect(() => {
    localStorage.setItem("addedMeasures", JSON.stringify(addedMeasures));
  }, [addedMeasures]);

  // useEffect(() => {
  //   localStorage.setItem(
  //     "previousScenariosList",
  //     JSON.stringify(previousScenariosList),
  //   );
  // }, [previousScenariosList]);

  // useEffect(() => {
  //   localStorage.setItem("scenariosList", JSON.stringify(scenariosList));
  // }, [scenariosList]);

  const disabledColumnsCheckbox = useMemo(() => {
    const disabledColumns = {
      address: false,
      threat: false,
      hypothese: false,
      risk: false,
      measure: false,
      responsible: false,
    };

    scenariosList.forEach((scenario) => {
      if (!!scenario.threat.cobrade) {
        disabledColumns.address = true;
      }

      if (!!scenario.hypothese) {
        disabledColumns.threat = true;
      }

      if (!!scenario.risk.description) {
        disabledColumns.hypothese = true;
      }

      if (!!scenario.measure.description) {
        disabledColumns.risk = true;
      }

      if (!!scenario.responsibles.length) {
        disabledColumns.measure = true;
      }

      if (!!scenario.resourceId) {
        disabledColumns.responsible = true;
      }
    });

    return disabledColumns;
  }, [scenariosList]);

  const value = useMemo(
    () => ({
      addedCobrades,
      setAddedCobrades,
      addedHypotheses,
      setAddedHypotheses,
      addedRisks,
      setAddedRisks,
      addedMeasures,
      setAddedMeasures,
      scenariosList,
      setScenariosList,
      previousScenariosList,
      setPreviousScenariosList,
      verifyIfPreviousScenariosHasValue,
      handleCheckItem,
      scenarioTitle,
      setScenarioTitle,
      disabledColumnsCheckbox,
    }),
    [
      addedCobrades,
      addedHypotheses,
      addedRisks,
      addedMeasures,
      scenariosList,
      previousScenariosList,
      verifyIfPreviousScenariosHasValue,
      handleCheckItem,
      scenarioTitle,
      setScenarioTitle,
      disabledColumnsCheckbox,
    ],
  );

  return (
    <ScenarioContext.Provider value={value}>
      {children}
    </ScenarioContext.Provider>
  );
};

export default ScenarioProvider;

export const useScenario = () => {
  const context = useContext(ScenarioContext);

  return context;
};

interface FilterScenarioList {
  list: any[];
  attr: keyof Scenario;
  value: any;
}

interface DuplicateScenariosLines {
  attr: keyof Scenario;
  value: any;
  draftScenariosList: WritableDraft<Scenario>[];
}
