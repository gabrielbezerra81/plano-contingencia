import produce from "immer";
import React, { useCallback, useContext } from "react";

import _ from "lodash";

import { Scenario } from "types/Plan";
import { useScenario } from "./scenarioContext";

interface RemoveScenarioContextData {
  handleRemoveItem: ({
    attr,
    value,
    rowId,
    rowIndex,
  }: HandleRemoveItem) => void;
}

const RemoveScenarioContext = React.createContext<RemoveScenarioContextData>(
  {} as RemoveScenarioContextData,
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

const RemoveScenarioProvider: React.FC = ({ children }) => {
  const {
    scenariosList,
    scenariosHistory,
    savePreviousState,
    setScenariosList,
    setScenariosHistory,
    setCheckedValues,
    getAttrCompareValue,
    getIndexesForMergedLines,
  } = useScenario();

  const removeCheckedValues = useCallback(
    ({ attrKeys, rowId }: RemoveCheckedValues) => {
      // console.log(rowId, attrKeys);
      setCheckedValues((oldValues) => {
        const filterIndexes: number[] = [];

        const updatedValues = produce(oldValues, (draft) => {
          draft.forEach((checkedItem, index) => {
            if (
              attrKeys.includes(checkedItem.attr) &&
              checkedItem.rowId === rowId
            ) {
              filterIndexes.push(index);
            }
          });

          return draft.filter((_, index) => !filterIndexes.includes(index));
        });

        return updatedValues;
      });
    },
    [setCheckedValues],
  );

  const findTopCellIndex = useCallback(
    ({ startIndex, attr }: FindTopCellIndex) => {
      let topCellIndex = startIndex;

      if (startIndex > 0) {
        const startElement = scenariosList[startIndex];

        for (let index = startIndex - 1; index >= 0; index--) {
          const areValueEquals = _.isEqual(
            startElement[attr],
            scenariosList[index][attr],
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
    [scenariosList],
  );

  const checkIfLineIsDuplicated = useCallback(
    ({ previousAttr, attr, startIndex }: CheckIfLineIsDuplicated) => {
      const topCellIndex = findTopCellIndex({ startIndex, attr: previousAttr });

      const previousAttrIndexes = getIndexesForMergedLines({
        attr: previousAttr,
        isAdding: true,
        startIndex: topCellIndex,
      });

      if (previousAttrIndexes.length === 1) {
        return false;
      }

      // Obtém-se os indices das linhas que tem a coluna anterior mesclada. Se a quantidade de indices for 1, logo a coluna atual não está duplicada.
      // Em seguida, é verificado se todas as linhas possuem o mesmo valor para o atributo atual. Se tiverem o mesmo valor, a linha não está duplicada.

      const topElement = scenariosList[previousAttrIndexes[0]];

      let isLineDuplicated = false;

      for (const index of previousAttrIndexes) {
        const areValueEquals = _.isEqual(
          topElement[attr],
          scenariosList[index][attr],
        );

        if (!areValueEquals) {
          isLineDuplicated = true;
        }
      }

      return isLineDuplicated;
    },
    [getIndexesForMergedLines, scenariosList, findTopCellIndex],
  );

  const handleRemoveOtherAttrs = useCallback(
    ({
      list,
      attr,
      value,
      rowIndex,
      removingFromHistory,
    }: FilterScenariosList): any => {
      if (rowIndex === undefined) {
        return list;
      }

      const compareValue = getAttrCompareValue(attr, value);

      const omitions: Array<keyof Scenario> = ["id", "title", "addressId"];

      let lineCopies: Scenario[] = [];

      const willEmpty = list.every((scenario: Scenario) => {
        const rowCompareValue = getAttrCompareValue(attr, scenario[attr]);

        return (
          rowCompareValue === compareValue &&
          (scenario[attr] as any).mergeKey === value.mergeKey
        );
      });

      const removeCount = list.filter((scenario) => {
        const rowCompareValue = getAttrCompareValue(
          attr,
          scenario[attr as keyof Scenario],
        );

        return (
          rowCompareValue === compareValue &&
          (scenario[attr] as any).mergeKey === value.mergeKey
        );
      }).length;

      if (willEmpty !== (list.length === removeCount)) {
        alert("Error");
      }

      switch (attr) {
        case "threat":
          break;
        case "hypothese":
          omitions.push("threat");
          break;
        case "risk":
          omitions.push("threat", "hypothese");
          break;
        case "measure":
          omitions.push("threat", "hypothese", "risk");
          break;
        case "resourceId":
          omitions.push("threat", "hypothese", "risk");
          break;
        default:
          break;
      }

      const hasUnmergedInPreviousAttrs = omitions.some((omition) => {
        const indexes = getIndexesForMergedLines({
          attr: omition,
          isAdding: true,
          startIndex: rowIndex,
        });

        return !!(indexes.length && indexes.length < removeCount);
      });

      const isLineDuplicated = removingFromHistory
        ? false
        : checkIfLineIsDuplicated({
            previousAttr: omitions[omitions.length - 1],
            startIndex: rowIndex,
            attr,
          });

      // Deve filtrar a lista de cenarios removendo as linhas que contem o valor no atributo atual
      const filtered: any[] = list.filter((scenario: Scenario, index) => {
        const rowCompareValue = getAttrCompareValue(attr, scenario[attr]);

        let shouldKeepLine =
          rowCompareValue !== compareValue &&
          (scenario[attr] as any).mergeKey !== value.mergeKey;

        if (!shouldKeepLine && !lineCopies.length) {
          lineCopies.push(scenario);
        } //
        // Se houver colunas anteriores não mescladas, faz a copia para manter a duplicação
        else if (!shouldKeepLine && hasUnmergedInPreviousAttrs) {
          lineCopies.push(scenario);
        }

        if (!shouldKeepLine && !removingFromHistory) {
          let attrKeys = Object.keys(scenario);

          if (lineCopies.some((lineCopy) => scenario.id === lineCopy?.id)) {
            // Adiciona os attrs que estão nas omissões como exceção
            attrKeys = attrKeys.filter((key) => !omitions.includes(key as any));
          }

          removeCheckedValues({
            attrKeys,
            rowId: scenario.id || "",
          });
        }

        return shouldKeepLine;
      });

      if (
        removingFromHistory ||
        (attr === "threat" && !willEmpty) ||
        isLineDuplicated
      ) {
        return filtered;
      }

      // Adicionar de volta as linhas removidas apenas com os atributos omitidos
      if (lineCopies.length) {
        const replaceData = _.omit(emptyScenario, omitions);

        // Preserva as linhas duplicadas, sobrescrevendo apenas os atributos posteriores
        if (hasUnmergedInPreviousAttrs) {
          list.forEach((scenario) => {
            const wasCopied = lineCopies.some(
              (lineCopy) => lineCopy.id === scenario.id,
            );

            if (wasCopied) {
              const isMergeKeyEqual =
                (scenario[attr] as any).mergeKey === value.mergeKey;

              if (_.isEqual(value, scenario[attr]) && isMergeKeyEqual) {
                Object.assign(scenario, { ...replaceData });
              }
            }
          });
        } //
        else {
          // Como não há linhas duplicadas, remove tudo e adiciona somente a copia que possui todos os attrs anteriores mesclados.
          // Nesse fluxo apenas 1 copia é adicionada, pois só há mais copias quando a flag "hasUnmergedInPreviousAttrs" é true.
          // Aqui é necessário reduzir linhas se houver duplicação posterior, o que é obtido limpando o array e adicionando apenas 1 linha.
          list.splice(0);
          list.push(...filtered);

          lineCopies.forEach((lineCopy) => {
            const isMergeKeyEqual =
              (lineCopy[attr] as any).mergeKey === value.mergeKey;

            if (_.isEqual(lineCopy[attr], value) && isMergeKeyEqual) {
              Object.assign(lineCopy, { ...replaceData });

              list.push(lineCopy);
            }
          });
        }
      } //
    },
    [
      getAttrCompareValue,
      removeCheckedValues,
      getIndexesForMergedLines,
      checkIfLineIsDuplicated,
    ],
  );

  const handleRemoveAddressOrResponsible = useCallback(
    ({ list, attr, value, rowId, responsiblesMergeKey }: any) => {
      const compareValue = getAttrCompareValue(attr, value);

      if (attr === "responsibles") {
        list.forEach((scenario: Scenario) => {
          scenario.responsibles = scenario.responsibles.filter(
            (responsible) => {
              const isValueEqual =
                `${responsible.name} ${responsible.role} ${responsible.permission}` ===
                compareValue;

              if (rowId) {
                const isRowIdEqual = scenario.id === rowId;

                return !(isValueEqual && isRowIdEqual);
              }

              if (responsiblesMergeKey) {
                const isRowMergeKeysEqual =
                  scenario.responsiblesMergeKey === responsiblesMergeKey;

                return !(isValueEqual && isRowMergeKeysEqual);
              }

              return true;
            },
          );
        });
        return list;
      } //
      else if (attr === "addressId") {
        // Deve filtrar a lista de cenarios removendo as linhas que contem o valor no atributo atual
        const filtered = list.filter((scenario: Scenario) => {
          return scenario.addressId !== compareValue;
        });
        return filtered;
      }
    },
    [getAttrCompareValue],
  );

  const handleRemoveItem = useCallback(
    ({ attr, value, rowId, rowIndex }: HandleRemoveItem) => {
      savePreviousState();

      const updatedHistory = produce(scenariosHistory, (historyDraft) => {
        if (["addressId", "responsibles"].includes(attr)) {
          const history = handleRemoveAddressOrResponsible({
            list: historyDraft,
            attr,
            value,
            rowId,
          });

          if (history) {
            return history;
          }
        } //
        else {
          const history = handleRemoveOtherAttrs({
            list: historyDraft,
            attr,
            value,
            rowIndex,
            removingFromHistory: true,
          });

          if (history) {
            return history;
          }
        }
      });

      const updatedScenariosList = produce(scenariosList, (draft) => {
        if (rowIndex || rowIndex === 0) {
          const { responsiblesMergeKey } = draft[rowIndex];

          if (["addressId", "responsibles"].includes(attr)) {
            const filtered = handleRemoveAddressOrResponsible({
              list: draft,
              attr,
              value,
              responsiblesMergeKey,
            });

            if (filtered) {
              return filtered;
            }
          } //
          else {
            const filtered = handleRemoveOtherAttrs({
              list: draft,
              attr,
              value,
              removingFromHistory: false,
              rowIndex,
            });

            if (filtered) {
              return filtered;
            }
          }
        }
      });

      setScenariosHistory(updatedHistory);
      setScenariosList(updatedScenariosList);
    },
    [
      scenariosList,
      savePreviousState,
      handleRemoveAddressOrResponsible,
      scenariosHistory,
      handleRemoveOtherAttrs,
      setScenariosHistory,
      setScenariosList,
    ],
  );

  return (
    <RemoveScenarioContext.Provider value={{ handleRemoveItem }}>
      {children}
    </RemoveScenarioContext.Provider>
  );
};

export default RemoveScenarioProvider;

export const useRemoveScenario = () => {
  const context = useContext(RemoveScenarioContext);

  return context;
};

interface RemoveCheckedValues {
  attrKeys: Array<string>;
  rowId: string;
}

interface FilterScenariosList {
  list: any[];
  attr: keyof Scenario;
  value: any;
  rowIndex?: number;
  removingFromHistory: boolean;
}

interface HandleRemoveItem {
  attr: keyof Scenario;
  value: any;
  rowId?: string;
  rowIndex?: number;
}

interface CheckIfLineIsDuplicated {
  previousAttr: keyof Scenario;
  attr: keyof Scenario;
  startIndex: number;
}

interface FindTopCellIndex {
  startIndex: number;
  attr: keyof Scenario;
}
