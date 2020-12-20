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
  ScenarioContextData,
} from "./types";

import { Scenario } from "types/Plan";
import _ from "lodash";
import AddScenarioProvider from "./addScenarioContext";
import RemoveScenarioProvider from "./removeScenarioContext";
import EditScenarioProvider from "./editScenarioContext";

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
    localStorage.setItem(
      "previousCheckedValues",
      JSON.stringify(checkedValues),
    );
  }, [scenariosList, checkedValues]);

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
      } //
      else if (attr === "resourceId") {
        compareValue = value.resourceId;
      }

      return compareValue;
    },
    [],
  );

  const verifyIfScenariosHistoryHasValue = useCallback(
    (attr: keyof Scenario, value: any): boolean => {
      const valueExists = sortedScenarioList.some((scenario: any) => {
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
            (responsible: any) =>
              `${responsible.name} ${responsible.role} ${responsible.permission}` ===
              value,
          );
        }

        return false;
      });

      return valueExists;
    },
    [sortedScenarioList],
  );

  const getIndexesForMergedLines = useCallback(
    ({
      attr,
      isAdding,
      startIndex = 0,
      list = sortedScenarioList,
    }: GetIndexesForMergedLines) => {
      const indexes: number[] = [];
      // Se estiver adicionando, os indices são dos cenários para pegar o id de cada linha
      // Se estiver removendo, os indices são os dos itens que devem ser removidos de CheckedValues

      for (let index = startIndex; index < list.length; index++) {
        const curr = list[index] as any;
        const next = list[index + 1] as any;

        let shouldPushNextAndContinue = false;

        if (curr && typeof curr[attr] === "object") {
          if (attr === "responsibles") {
            shouldPushNextAndContinue =
              next && curr.responsibleMergeKey === next.responsibleMergeKey;
          } //
          else {
            shouldPushNextAndContinue =
              next && curr[attr].mergeKey === next[attr].mergeKey;
          }

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

          if (attr === "responsibles") {
            isAdding = true;
          }

          // indices das linhas mescladas ou indices do CheckedValues
          const indexes = getIndexesForMergedLines({
            attr,
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
        if (checkedItem.attr !== attr) {
          return false;
        }

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

  // Salvar cobrades - A.L.
  useEffect(() => {
    if (scenarioSaveEnabled) {
      localStorage.setItem("checkedValues", JSON.stringify(checkedValues));
    }
  }, [checkedValues, scenarioSaveEnabled]);

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
        verifyIfScenariosHistoryHasValue,
        handleCheckItem,
        scenarioTitle,
        setScenarioTitle,
        disabledColumnsCheckbox,
        verifyIfIsChecked,
        setScenarioSaveEnabled,
        scenarioSaveEnabled,
        savePreviousState,
        getAttrCompareValue,
        getIndexesForMergedLines,
      }}
    >
      <AddScenarioProvider>
        <RemoveScenarioProvider>
          <EditScenarioProvider>{children}</EditScenarioProvider>
        </RemoveScenarioProvider>
      </AddScenarioProvider>
    </ScenarioContext.Provider>
  );
};

export default ScenarioProvider;

export const useScenario = () => {
  const context = useContext(ScenarioContext);

  return context;
};

// Se a coluna tiver so 1 item selecionado, a lista não será filtrada para não  zerar a quantidade de linhas
// e sim o campo vai ser atribuido a "". Isto não vale para o campo de endereço que é a primeira coluna.
// if (filtered.length === 0) {
//   list.forEach((scenario: Scenario) => {
//     if (
//       ["threat", "hypothese", "risk", "measure", "resourceId"].includes(
//         attr,
//       )
//     ) {
//       const column: any = scenario[attr as keyof Scenario];
//       Object.keys(column).forEach((key: any) => {
//         Object.assign(column, { [key]: "" });
//       });
//     }
//   });

//   return list;
// } //
// else {
//   return filtered;
// }
