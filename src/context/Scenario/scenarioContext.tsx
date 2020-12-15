import produce, { setAutoFreeze } from "immer";
import React, {
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  HandleCheckItem,
  VerifyIfIsChecked,
  AddInitialScenarioLines,
  CheckedValue,
  GetIndexesForMergedLines,
  HandleAddValueToScenario,
  HandleRemoveItem,
  ScenarioContextData,
} from "./types";

import { Scenario } from "types/Plan";
import _ from "lodash";

setAutoFreeze(false);

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
  const [scenariosHistory, setScenariosHistory] = useState<Scenario[]>(() => {
    const scenarios = localStorage.getItem("scenariosHistory");

    if (scenarios) {
      return JSON.parse(scenarios);
    }

    return [];
  });

  const sortedScenarioList = useMemo(() => {
    return _.orderBy(scenariosList, [
      "addressId",
      "threat.mergeKey",
      "hypothese.mergeKey",
      "risk.mergeKey",
      "measure.mergeKey",
      "resourceId.mergeKey",
    ]);
  }, [scenariosList]);

  const savePreviousState = useCallback(() => {
    localStorage.setItem(
      "previousScenariosList",
      JSON.stringify(scenariosList),
    );
    localStorage.setItem("previousHistory", JSON.stringify(scenariosHistory));
    localStorage.setItem(
      "previousCheckedValues",
      JSON.stringify(checkedValues),
    );
  }, [scenariosList, scenariosHistory, checkedValues]);

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

  const verifyIfScenariosHistoryHasValue = useCallback(
    (attr: keyof Scenario, value: any): boolean => {
      const valueExists = scenariosHistory.some((scenario) => {
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
    [scenariosHistory],
  );

  const filterScenariosList = useCallback(
    ({ list, attr, value }: any) => {
      const compareValue = getAttrCompareValue(attr, value);

      if (attr === "responsibles") {
        list.forEach((scenario: Scenario) => {
          scenario.responsibles.forEach((responsible, index) => {
            if (
              `${responsible.name} ${responsible.role} ${responsible.permission}` ===
              compareValue
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
              return scenario.addressId !== compareValue;
            case "threat":
              return scenario.threat.cobrade !== compareValue;
            case "hypothese":
              return scenario.hypothese.hypothese !== compareValue;
            case "risk":
              return scenario.risk.description !== compareValue;
            case "measure":
              return scenario.measure.description !== compareValue;
            case "resourceId":
              return scenario.resourceId !== compareValue;
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
              const column: any = scenario[attr as keyof Scenario];
              Object.keys(column).forEach((key: any) => {
                Object.assign(column, { [key]: "" });
              });
            }
          });
        } //
        else {
          return filtered;
        }
      }
    },
    [getAttrCompareValue],
  );

  const handleRemoveItem = useCallback(
    ({ attr, value, rowId, rowIndex }: HandleRemoveItem) => {
      savePreviousState();

      const updatedScenariosList = produce(sortedScenarioList, (draft) => {
        if (rowIndex || rowIndex === 0) {
          // const excludedKeys = ["id", "title"];

          setScenariosHistory((oldHistory) =>
            filterScenariosList({
              list: oldHistory,
              attr,
              value,
            }),
          );

          const filtered = filterScenariosList({
            list: draft,
            attr,
            value,
          });

          if (filtered) {
            return filtered;
          }
        }
      });

      setScenariosList(updatedScenariosList);
    },
    [sortedScenarioList, savePreviousState, filterScenariosList],
  );

  const getIndexesForMergedLines = useCallback(
    ({ attr, isAdding, startIndex = 0 }: GetIndexesForMergedLines) => {
      const indexes: number[] = [];
      // Se estiver adicionando, os indices são dos cenários para pegar o id de cada linha
      // Se estiver removendo, os indices são os dos itens que devem ser removidos de CheckedValues

      for (let index = startIndex; index < sortedScenarioList.length; index++) {
        const curr = sortedScenarioList[index] as any;
        const next = sortedScenarioList[index + 1] as any;

        let shouldPushNextAndContinue = false;

        if (curr && typeof curr[attr] === "object") {
          shouldPushNextAndContinue =
            next && curr[attr].mergeKey === next[attr].mergeKey;

          if (isAdding) {
            indexes.push(index);
          } //
          else {
            const removeIndex = checkedValues.findIndex(
              (checkedItem) =>
                checkedItem.rowId === curr.id &&
                checkedItem.value.mergeKey === curr[attr].mergeKey,
            );
            if (removeIndex !== -1) {
              indexes.push(removeIndex);
            }
          }
        }

        if (!shouldPushNextAndContinue) {
          break;
        }
      }

      return indexes;
    },
    [sortedScenarioList, checkedValues],
  );

  const addInitialScenarioLines = useCallback(
    ({ attr, value, rowId }: AddInitialScenarioLines) => {
      let list: Scenario[] = [];

      if (attr === "addressId") {
        setScenariosList((oldScenarioList) => {
          savePreviousState();

          const draft = [...oldScenarioList];

          const alreadyAdded = verifyIfScenariosHistoryHasValue(attr, value);

          if (!alreadyAdded) {
            draft.push({
              ...emptyScenario,
              addressId: value,
              title: scenarioTitle,
              id: rowId,
            });
            setScenariosHistory((oldValues) => [
              ...oldValues,
              { ...emptyScenario, addressId: value, id: rowId },
            ]);
          } //

          list = draft.map((item) => item);

          return draft;
        });
      }

      return list;
    },
    [verifyIfScenariosHistoryHasValue, savePreviousState, scenarioTitle],
  );

  const handleCheckItem = useCallback(
    ({ attr, value, rowId, rowIndex }: HandleCheckItem) => {
      const id = (Math.random() * 100).toFixed(2);

      // push inicial das linhas de cenário se o attr for "addressId"
      let list: Scenario[] = addInitialScenarioLines({
        attr,
        value,
        rowId: id,
      });

      const updatedCheckedValues = produce(checkedValues, (checkedDraft) => {
        const compareValue = getAttrCompareValue(attr, value);

        const checkedIndex = checkedDraft.findIndex((checkedItem) => {
          const alreadyCheckedValue = getAttrCompareValue(
            attr,
            checkedItem.value,
          );

          const isValueEqual = alreadyCheckedValue === compareValue;

          const isRowIdEqual = checkedItem.rowId === rowId;

          return isValueEqual && isRowIdEqual;
        });

        if (attr === "addressId") {
          const filterIndexes: number[] = [];
          list.forEach((scenario) => {
            if (checkedIndex === -1 && scenario.addressId === value) {
              checkedDraft.push({ attr, value, rowId: scenario.id || id });
            } //
            else {
              const removeIndex = checkedDraft.findIndex(
                (checkedItem) =>
                  checkedItem.rowId === scenario.id &&
                  checkedItem.value === value,
              );
              if (removeIndex !== -1) {
                filterIndexes.push(removeIndex);
              }
            }
          });

          if (checkedIndex !== -1) {
            return checkedDraft.filter(
              (_, index) => !filterIndexes.includes(index),
            );
          }
        } //
        else if (rowIndex || rowIndex === 0) {
          let isAdding = checkedIndex === -1;

          let attrToCheckMergedLines = attr;

          if (attr === "responsibles") {
            isAdding = true;
            attrToCheckMergedLines = "measure";
          }

          // indices das linhas mescladas ou indices do CheckedValues
          const indexes = getIndexesForMergedLines({
            attr: attrToCheckMergedLines,
            isAdding,
            startIndex: rowIndex,
          });

          // Volta ao valor real quando for attr === "responsibles"
          isAdding = checkedIndex === -1;

          if (isAdding) {
            indexes.forEach((index) => {
              checkedDraft.push({
                attr,
                value,
                rowId: sortedScenarioList[index].id || rowId || "",
              });
            });
          } //
          else {
            if (attr === "responsibles") {
              // No caso dos responsaveis, é obtido o indice das linhas de cenarios que tem medidas de enfretamento mescladas
              indexes.forEach((index) => {
                const lineId = sortedScenarioList[index].id;

                const indexToRemove = checkedDraft.findIndex(
                  (checkedItem) =>
                    _.isEqual(checkedItem.value, value) &&
                    checkedItem.rowId === lineId,
                );

                if (indexToRemove !== -1) {
                  checkedDraft.splice(indexToRemove, 1);
                }
              });
            } //
            else {
              return checkedDraft.filter(
                (_, index) => !indexes.includes(index),
              );
            }
          }
        }
      });

      setCheckedValues(updatedCheckedValues);
    },
    [
      getAttrCompareValue,
      checkedValues,
      sortedScenarioList,
      getIndexesForMergedLines,
      addInitialScenarioLines,
    ],
  );

  const verifyIfIsChecked = useCallback(
    ({ attr, value, rowId, compareMode }: VerifyIfIsChecked) => {
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

        if (compareMode === "rowId") {
          const isRowIdEqual = rowId === checkedItem.rowId;

          return isValueEqual && isRowIdEqual;
        }

        const isMergeKeyEqual = checkedItem.value.mergeKey === value.mergeKey;

        return isValueEqual && isMergeKeyEqual;
      });
    },
    [checkedValues, getAttrCompareValue],
  );

  const handleAddValueToScenario = useCallback(
    ({ attr, value }: HandleAddValueToScenario) => {
      // const compareValue = getAttrCompareValue(attr, value);

      setScenariosList((oldScenarioList) => {
        savePreviousState();

        const draft = [...oldScenarioList];

        if (attr === "responsibles") {
          draft.forEach((scenario) => {
            const isMeasureChecked = verifyIfIsChecked({
              attr: "measure",
              value: scenario.measure,
              compareMode: "rowId",
              rowId: scenario.id,
            });

            if (isMeasureChecked) {
              scenario.responsibles.push(...value);
            }
          });

          return draft;
        }

        for (const prevScenario of scenariosHistory) {
          let shouldChangeAttrInLine: boolean = false;
          let nestedFindValue = "";
          let isPreviousColumnChecked = false;
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
                !prevScenario.resourceId.resourceId;
              nestedFindValue = "resourceId";
              previousAttr = "measure";
              break;
            default:
              break;
          }

          isPreviousColumnChecked = verifyIfIsChecked({
            attr: previousAttr as any,
            value: prevScenario[previousAttr as keyof Scenario],
            compareMode: "rowId",
            rowId: prevScenario.id,
          });

          console.log(shouldChangeAttrInLine, isPreviousColumnChecked);

          if (shouldChangeAttrInLine && isPreviousColumnChecked) {
            let newLineId: any;
            let newLineResponsibles: any[] = [];

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
                compareMode: "rowId",
              });

              return !findValue && isChecked;
            });

            // Como os responsaveis não vão para o historico, é necessário copiar diretamente da linha correspondente
            if (attr === "resourceId") {
              const correspondentLine = draft.find(
                (scenario) => scenario.id === prevScenario.id,
              );

              if (correspondentLine) {
                newLineResponsibles = correspondentLine.responsibles;
              }
            } //
            // Se encontrar um com o atributo vazio, preenche o valor dessa linha. O atributo da linha do prev e da linha atual precisam
            // bater. Os dois cenários precisam ter addressId = 10 para adicionar a ameaça.
            if (
              scenarioItem &&
              _.isEqual(scenarioItem[previousAttr], prevScenario[previousAttr])
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
                responsibles: newLineResponsibles,
              });
            }

            setScenariosHistory((oldValues) => [
              ...oldValues,
              { ...prevScenario, [attr]: value, id: newLineId },
            ]);
          }
        }

        return draft;
      });
    },
    [scenariosHistory, scenarioTitle, verifyIfIsChecked, savePreviousState],
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
        "scenariosHistory",
        JSON.stringify(scenariosHistory),
      );
    }
  }, [scenariosHistory, scenarioSaveEnabled]);

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

  return (
    <ScenarioContext.Provider
      value={{
        checkedValues,
        setCheckedValues,
        scenariosList: sortedScenarioList,
        setScenariosList,
        scenariosHistory,
        setScenariosHistory,
        verifyIfScenariosHistoryHasValue,
        handleCheckItem,
        scenarioTitle,
        setScenarioTitle,
        disabledColumnsCheckbox,
        handleAddValueToScenario,
        verifyIfIsChecked,
        setScenarioSaveEnabled,
        scenarioSaveEnabled,
        generateMergeKey,
        handleRemoveItem,
      }}
    >
      {children}
    </ScenarioContext.Provider>
  );
};

export default ScenarioProvider;

export const useScenario = () => {
  const context = useContext(ScenarioContext);

  return context;
};
