import produce from "immer";
import { WritableDraft } from "immer/dist/internal";
import React, {
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Scenario } from "types/Plan";
import _ from "lodash";

interface ScenarioContextData {
  checkedValues: Array<CheckedValue>;
  setCheckedValues: React.Dispatch<React.SetStateAction<CheckedValue[]>>;
  scenariosList: Scenario[];
  setScenariosList: React.Dispatch<React.SetStateAction<Scenario[]>>;
  previousScenariosList: Scenario[];
  setPreviousScenariosList: React.Dispatch<React.SetStateAction<Scenario[]>>;
  verifyIfPreviousScenariosHasValue: (
    attr: keyof Scenario,
    value: any,
  ) => boolean;
  handleCheckItem: (data: HandleCheckItem) => void;
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
  handleAddValueToScenario: (data: HandleAddValueToScenario) => any;
  verifyIfIsChecked: (data: VerifyIfIsChecked) => boolean;
  scenarioSaveEnabled: boolean;
  setScenarioSaveEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  generateMergeKey: () => number;
}

const ScenarioContext = React.createContext<ScenarioContextData>(
  {} as ScenarioContextData,
);

const emptyScenario: Scenario = {
  addressId: "",
  hypothese: {
    hypothese: "",
    mergeKey: 0,
  },
  id: "",
  measure: {
    description: "",
    id: "",
    mergeKey: 0,
  },
  resourceId: {
    resourceId: "",
    mergeKey: 0,
  },
  responsibles: [],
  risk: { description: "", id: "", mergeKey: 0 },
  threat: { cobrade: "", description: "", mergeKey: 0 },
  title: "",
};

const ScenarioProvider: React.FC = ({ children }) => {
  const [scenarioSaveEnabled, setScenarioSaveEnabled] = useState(false);

  const [, setMergeKey] = useState(() => {
    const mergeKey = localStorage.getItem("mergeKey");

    if (mergeKey) {
      return Number(mergeKey);
    }

    return 0;
  });

  const [scenarioTitle, setScenarioTitle] = useState(() => {
    const title = localStorage.getItem("scenarioTitle");

    return title || "";
  });

  const [checkedValues, setCheckedValues] = useState<CheckedValue[]>(() => {
    const cobrades = localStorage.getItem("checkedValues");

    if (cobrades) {
      return JSON.parse(cobrades);
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

  const getAttrCompareValue = useCallback(
    (attr: keyof Scenario, value: any) => {
      let compareValue = value;

      if (attr === "threat") {
        compareValue = value.cobrade;
      } //
      else if (["risk", "measure"].includes(attr)) {
        compareValue = value.description;
      } //
      else if (attr === "responsibles") {
        compareValue = `${value.name} ${value.role} ${value.permission}`;
      } //
      else if (attr === "hypothese") {
        compareValue = value.hypothese;
      }

      return compareValue;
    },
    [],
  );

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
        // Deve filtrar a lista de cenarios removendo as linhas que contem o valor no atributo atual
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

        // Se a coluna tiver so 1 item selecionado, a lista não será filtrada para não  zerar a quantidade de linhas
        // e sim o campo vai ser atribuido a "". Isto não vale para o campo de endereço que é a primeira coluna.
        if (filtered.length === 0 && attr !== "addressId") {
          list.forEach((scenario: Scenario) => {
            if (
              ["threat", "hypothese", "risk", "measure", "resourceId"].includes(
                attr,
              )
            ) {
              Object.keys(scenario[attr] as any).forEach((key: any) => {
                Object.assign(scenario[attr], { [key]: "" });
              });
            }
          });
        } //
        else {
          return filtered;
        }
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
      const compareValue = getAttrCompareValue(attr, value);

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
                  !!prevScenario.responsibles.length &&
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
      getAttrCompareValue,
    ],
  );

  const handleCheckItem = useCallback(
    ({ attr, value, rowId }: HandleCheckItem) => {
      const id = (Math.random() * 100).toFixed(2);

      const updatedCheckedValues = produce(checkedValues, (checkedDraft) => {
        const compareValue = getAttrCompareValue(attr, value);

        const index = checkedDraft.findIndex((checkedItem) => {
          const alreadyCheckedValue = getAttrCompareValue(
            attr,
            checkedItem.value,
          );

          const isValueEqual = alreadyCheckedValue === compareValue;

          const isRowIdEqual = checkedItem.rowId === rowId;

          return isValueEqual && isRowIdEqual;
        });

        if (index === -1) {
          checkedDraft.push({ attr, value, rowId: rowId || id });
        } //
        else {
          checkedDraft.splice(index, 1);
        }
      });

      setCheckedValues(updatedCheckedValues);

      setScenariosList((oldScenarioList) => {
        const draft = [...oldScenarioList];

        if (attr === "addressId") {
          const alreadyAdded = verifyIfPreviousScenariosHasValue(attr, value);

          if (!alreadyAdded) {
            draft.push({
              ...emptyScenario,
              addressId: value,
              title: scenarioTitle,
              id,
            });
            setPreviousScenariosList((oldValues) => [
              ...oldValues,
              { ...emptyScenario, addressId: value, id },
            ]);
          } //
          else {
          }
        } //
        else {
          // Para demais atributos
          // return duplicateScenariosLines({
          //   attr,
          //   value,
          //   draftScenariosList: draft,
          // });
        }

        return draft;
      });
    },
    [
      verifyIfPreviousScenariosHasValue,
      scenarioTitle,
      getAttrCompareValue,
      checkedValues,
    ],
  );

  const verifyIfIsChecked = useCallback(
    ({ attr, value, rowId }: VerifyIfIsChecked) => {
      if (!attr) {
        return false;
      }

      const compareValue = getAttrCompareValue(attr, value);

      return checkedValues.some((checkedItem) => {
        const alreadyCheckedValue = getAttrCompareValue(
          attr,
          checkedItem.value,
        );

        const isValueEqual = alreadyCheckedValue === compareValue;

        const isRowIdEqual = rowId === checkedItem.rowId;

        return isValueEqual && isRowIdEqual;
      });
    },
    [checkedValues, getAttrCompareValue],
  );

  const handleAddValueToScenario = useCallback(
    ({ attr, value }: HandleAddValueToScenario) => {
      // const compareValue = getAttrCompareValue(attr, value);

      setScenariosList((oldScenarioList) => {
        const draft = [...oldScenarioList];

        if (attr === "responsibles") {
        } //
        else {
          for (const prevScenario of previousScenariosList) {
            let shouldChangeAttrInLine: boolean = false;
            let nestedFindValue = "";
            let hasPreviousColumnChecked = false;
            let previousAttr: keyof Scenario = "" as any;

            switch (attr) {
              case "threat":
                shouldChangeAttrInLine = !prevScenario.threat.cobrade;
                nestedFindValue = "cobrade";
                previousAttr = "addressId";
                break;
              case "hypothese":
                shouldChangeAttrInLine =
                  !!prevScenario.threat.cobrade &&
                  !prevScenario.hypothese.hypothese;
                nestedFindValue = "hypothese";
                previousAttr = "threat";
                break;
              case "risk":
                shouldChangeAttrInLine =
                  !!prevScenario.hypothese.hypothese &&
                  !prevScenario.risk.description;
                nestedFindValue = "description";
                previousAttr = "hypothese";
                break;
              case "measure":
                shouldChangeAttrInLine =
                  !!prevScenario.risk.description &&
                  !prevScenario.measure.description;
                nestedFindValue = "description";
                previousAttr = "risk";
                break;
              case "resourceId":
                shouldChangeAttrInLine =
                  !!prevScenario.measure.description &&
                  !!prevScenario.responsibles.length &&
                  !prevScenario.resourceId;
                break;
              default:
                break;
            }

            hasPreviousColumnChecked = verifyIfIsChecked({
              attr: previousAttr as any,
              value: prevScenario[previousAttr as keyof Scenario],
              rowId: prevScenario.id,
            });

            console.log(shouldChangeAttrInLine, hasPreviousColumnChecked);

            if (shouldChangeAttrInLine && hasPreviousColumnChecked) {
              let newLineId: any;

              // Procurar cenário que está com o atributo atual vazio
              const scenarioItem = draft.find((scenario) => {
                let findValue: any = scenario[attr];

                if (nestedFindValue) {
                  findValue = findValue[nestedFindValue];
                }

                const isChecked = verifyIfIsChecked({
                  attr: previousAttr,
                  value: scenario[previousAttr],
                  rowId: scenario.id,
                });

                return !findValue && isChecked;
              });

              // Se encontrar um com o atributo vazio, preenche o valor dessa linha. O atributo da linha do prev e da linha atual precisam
              // bater. Os dois cenários precisam ter addressId = 10 para adicionar a ameaça.
              if (
                scenarioItem &&
                _.isEqual(
                  scenarioItem[previousAttr],
                  prevScenario[previousAttr],
                )
              ) {
                scenarioItem[attr] = value;
                newLineId = scenarioItem.id;
              } // Caso contrario, será criada uma nova linha com o nvo valor marcado
              else {
                newLineId = (Math.random() * 100).toFixed(2);
                draft.push({
                  ...prevScenario,
                  [attr]: value,
                  title: scenarioTitle,
                  id: newLineId,
                });
              }

              setPreviousScenariosList((oldValues) => [
                ...oldValues,
                { ...prevScenario, [attr]: value, id: newLineId },
              ]);
            }
          }
        }

        return draft;
      });
    },
    [previousScenariosList, scenarioTitle, verifyIfIsChecked],
  );

  const generateMergeKey = useCallback(() => {
    let currentMergeKey = -1;

    setMergeKey((oldKey) => {
      currentMergeKey = oldKey;

      const newKey = oldKey + 1;

      localStorage.setItem("mergeKey", newKey.toString());

      return newKey;
    });

    return currentMergeKey;
  }, []);

  // Salvar cobrades - A.L.
  useEffect(() => {
    if (scenarioSaveEnabled) {
      localStorage.setItem("checkedValues", JSON.stringify(checkedValues));
    }
  }, [checkedValues, scenarioSaveEnabled]);

  useEffect(() => {
    if (scenarioSaveEnabled) {
      localStorage.setItem(
        "previousScenariosList",
        JSON.stringify(previousScenariosList),
      );
    }
  }, [previousScenariosList, scenarioSaveEnabled]);

  useEffect(() => {
    if (scenarioSaveEnabled) {
      localStorage.setItem("scenariosList", JSON.stringify(scenariosList));
    }
  }, [scenariosList, scenarioSaveEnabled]);

  const disabledColumnsCheckbox = useMemo(() => {
    const disabledColumns = {
      address: false,
      threat: false,
      hypothese: false,
      risk: false,
      measure: false,
      responsible: false,
    };

    return disabledColumns;
  }, []);

  const value = useMemo(
    () => ({
      checkedValues,
      setCheckedValues,
      scenariosList,
      setScenariosList,
      previousScenariosList,
      setPreviousScenariosList,
      verifyIfPreviousScenariosHasValue,
      handleCheckItem,
      scenarioTitle,
      setScenarioTitle,
      disabledColumnsCheckbox,
      handleAddValueToScenario,
      verifyIfIsChecked,
      setScenarioSaveEnabled,
      scenarioSaveEnabled,
      generateMergeKey,
    }),
    [
      checkedValues,
      scenariosList,
      previousScenariosList,
      verifyIfPreviousScenariosHasValue,
      handleCheckItem,
      scenarioTitle,
      setScenarioTitle,
      disabledColumnsCheckbox,
      handleAddValueToScenario,
      verifyIfIsChecked,
      scenarioSaveEnabled,
      generateMergeKey,
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

interface CheckedValue {
  attr: keyof Scenario;
  value: any;
  rowId: string;
}

interface HandleAddValueToScenario {
  attr: keyof Scenario;
  value: any;
}

interface VerifyIfIsChecked {
  attr: keyof Scenario;
  value: any;
  rowId?: string;
  equalityCheck?: boolean;
}

interface HandleCheckItem {
  attr: keyof Scenario;
  value: any;
  rowId?: string;
}
