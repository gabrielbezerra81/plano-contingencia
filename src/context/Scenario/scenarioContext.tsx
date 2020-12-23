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
  FindTopCellIndex,
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

        if (curr) {
          if (attr === "responsibles") {
            shouldPushNextAndContinue =
              next && curr.responsiblesMergeKey === next.responsiblesMergeKey;
          } //
          else if (attr === "addressId") {
            shouldPushNextAndContinue =
              next && curr.addressId === next.addressId;
          } //
          else if (typeof curr[attr] === "object") {
            console.log(attr);
            shouldPushNextAndContinue =
              next && curr[attr].mergeKey === next[attr].mergeKey;
          }

          if (isAdding) {
            indexes.push(index);
          } //
          else if (attr !== "addressId") {
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
    ({ attr, value }: AddInitialScenarioLines) => {
      const id = (Math.random() * 100).toFixed(2);

      if (attr === "addressId") {
        const updatedScenariosList = produce(sortedScenarioList, (draft) => {
          savePreviousState();

          const alreadyAdded = verifyIfScenariosHistoryHasValue(attr, value);

          if (!alreadyAdded) {
            draft.push({
              ...emptyScenario,
              addressId: value,
              title: scenarioTitle,
              id,
            });
          } //
        });

        setScenariosList(updatedScenariosList);
      }
    },
    [
      verifyIfScenariosHistoryHasValue,
      savePreviousState,
      scenarioTitle,
      sortedScenarioList,
    ],
  );

  const verifyIfIsChecked = useCallback(
    ({ attr, value, rowId, compareMode }: VerifyIfIsChecked) => {
      if (!attr) {
        return false;
      }

      return checkedValues.some((checkedItem) => {
        if (checkedItem.attr !== attr) {
          return false;
        }

        if (compareMode === "attrOnly") {
          return checkedItem.attr === attr;
        }

        const compareValue = getAttrCompareValue(attr, value);

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

  const findTopCellIndex = useCallback(
    ({ startIndex, attr }: FindTopCellIndex) => {
      let topCellIndex = startIndex;

      if (startIndex > 0) {
        const startElement = sortedScenarioList[startIndex];

        for (let index = startIndex - 1; index >= 0; index--) {
          const areValueEquals = _.isEqual(
            startElement[attr],
            sortedScenarioList[index][attr],
          );

          if (areValueEquals) {
            topCellIndex = index;
          } else {
            break;
          }
        }
      }

      return topCellIndex;
    },
    [sortedScenarioList],
  );

  const checkPreviousAttrs = useCallback(
    ({ attr, indexes, checkedDraft }: any) => {
      const pickAttrs: Array<keyof Scenario> = ["addressId"];

      switch (attr) {
        case "threat":
          break;
        case "hypothese":
          pickAttrs.push("threat");
          break;
        case "risk":
          pickAttrs.push("threat", "hypothese");
          break;
        case "measure":
          pickAttrs.push("threat", "hypothese", "risk");
          break;
        case "responsibles":
          pickAttrs.push("threat", "hypothese", "risk", "measure");
          break;
        case "resourceId":
          pickAttrs.push(
            "threat",
            "hypothese",
            "risk",
            "measure",
            "responsibles",
          );
          break;
        default:
          break;
      }

      indexes.forEach((index: number) => {
        const scenario = sortedScenarioList[index];
        Object.keys(scenario).forEach((key) => {
          const previousAttr = key as keyof Scenario;

          if (pickAttrs.includes(previousAttr)) {
            const topRowIndex = findTopCellIndex({
              attr: previousAttr,
              startIndex: index,
            });

            const attrMergedIndexes = getIndexesForMergedLines({
              attr: previousAttr,
              isAdding: true,
              startIndex: topRowIndex,
            });

            if (previousAttr === "responsibles") {
              console.log("responsibles", attrMergedIndexes);
            }

            attrMergedIndexes.forEach((attrIndex) => {
              const line = sortedScenarioList[attrIndex];

              if (previousAttr === "responsibles") {
                line.responsibles.forEach((responsible) => {
                  const alreadyAdded = checkedDraft.some(
                    (checkedItem: any) =>
                      _.isEqual(checkedItem.value, responsible) &&
                      line.id === checkedItem.rowId,
                  );

                  if (!alreadyAdded) {
                    checkedDraft.push({
                      attr: previousAttr,
                      value: responsible,
                      rowId: line.id,
                    });
                  }
                });
              } //
              else {
                const alreadyAdded = checkedDraft.some(
                  (checkedItem: any) =>
                    _.isEqual(checkedItem.value, line[previousAttr]) &&
                    line.id === checkedItem.rowId,
                );

                if (!alreadyAdded) {
                  checkedDraft.push({
                    attr: previousAttr,
                    value: line[previousAttr],
                    rowId: line.id,
                  });
                }
              }
            });
          }
        });
      });
    },
    [sortedScenarioList, getIndexesForMergedLines, findTopCellIndex],
  );

  const alertIfPreviousIsNotChecked = useCallback(
    (attr: keyof Scenario, shouldCheck?: boolean) => {
      let message = "Por favor, selecione ao menos ";

      let previousAttr: keyof Scenario = "" as any;

      switch (attr) {
        case "threat":
          previousAttr = "addressId";
          message += "um local de risco.";
          break;
        case "hypothese":
          previousAttr = "threat";
          message += "uma ameaça.";
          break;
        case "risk":
          previousAttr = "hypothese";
          message += "uma situação hipotética.";
          break;
        case "measure":
          previousAttr = "risk";
          message += "um risco/vulnerabilidade.";
          break;
        case "responsibles":
          previousAttr = "measure";
          message += "uma medida de enfretamento.";
          break;
        case "resourceId":
          previousAttr = "responsibles";
          message += "um responsável.";
          break;
        default:
          break;
      }

      const isPreviousChecked = verifyIfIsChecked({
        attr: previousAttr,
        compareMode: "attrOnly",
      });

      console.log(isPreviousChecked);

      if (!isPreviousChecked) {
        alert(message);
        return false;
      }

      return true;
    },
    [verifyIfIsChecked],
  );

  const handleCheckItem = useCallback(
    ({ attr, value, rowId, rowIndex }: HandleCheckItem) => {
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
          sortedScenarioList.forEach((scenario) => {
            if (checkedIndex === -1 && scenario.addressId === value) {
              checkedDraft.push({ attr, value, rowId: scenario.id || "" });
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
            console.log(indexes);
            indexes.forEach((index) => {
              checkedDraft.push({
                attr,
                value,
                rowId: sortedScenarioList[index].id || rowId || "",
              });
            });
            checkPreviousAttrs({ attr, indexes, checkedDraft });
          } //
          else {
            if (attr === "responsibles") {
              // No caso dos responsaveis, é obtido o indice das linhas de cenarios que tem medidas de enfretamento mescladas

              indexes.forEach((index) => {
                const lineId = sortedScenarioList[index].id;

                const indexToRemove = checkedDraft.findIndex((checkedItem) => {
                  console.log({ ...checkedItem.value });
                  console.log(value);
                  console.log(_.isEqual(checkedItem.value, value));

                  return (
                    _.isEqual(checkedItem.value, value) &&
                    checkedItem.rowId === lineId
                  );
                });

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
      checkPreviousAttrs,
    ],
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
        addInitialScenarioLines,
        alertIfPreviousIsNotChecked,
        findTopCellIndex,
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
