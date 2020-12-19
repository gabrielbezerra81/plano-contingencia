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

  const handleRemoveSpecialCase = useCallback(
    ({
      list,
      indexesToRemove,
      prevAttr,
      attr,
      value,
    }: HandleRemoveSpecialCase) => {
      // Detectar se o previousAttr é diferente para algum desses indices. As que devem limpar entram no remoção com splice, as duplicadas devem entrar
      // no "return filtered"
      // Quem tem só 1 valor do attr atual, faz splice. Quem tem mais de 1, faz o filtered
      // prev omitions[omitions.length - 1]

      let lineIdRemoveMethods: LineIdRemoveMethods = {
        filter: [],
        splice: [],
        clearOnly: [],
      };

      // lines é uma lista de arrays. Supondo que os indices a serem removidos são 0 e 1 e esteja removendo uma medida. Para esse caso, prevAttr é "risk".
      // lines então vai ter 2 arrays como elementos, o elemento o 1 são as linhas que possuem o risco igual a linha de indice 0 e o elemento 2 são as linhas que possuem
      // o risco igual a linha de indice 1. Obtendo essas quantidades de linhas para cada valor, isso é util para identificar quando duas linhas irão
      // ter metodos de remoção diferente. Ex: a linha 0 tendo apenas medida 1, e a linha 1 tendo medida 1 e medida 2. Ao remover a medida 1, ela está mesclada mas a ação
      // para a linha 0 é o caso do splice, ja na linha 1 apenas filtra e remove essa linha, sobrando a linha com medida 2.
      const lines = indexesToRemove.map((index) => {
        const prevAttrValue = list[index][prevAttr];

        const linesWithThisPrevValue = list.filter((scenario) => {
          if (_.isEqual(scenario[prevAttr], prevAttrValue)) {
            return true;
          }

          return false;
        });

        return linesWithThisPrevValue;
      });

      const maxLinesLength = Math.max(
        ...lines.map((lineArray) => lineArray.length),
      );

      const everyDuplicationHasTheSameNumberOfLines = lines.every(
        (lineArray) => lineArray.length === maxLinesLength,
      );

      const shouldHaveDifferentRemoveMethodsForEachLine =
        indexesToRemove.length > 1 && !everyDuplicationHasTheSameNumberOfLines;

      if (!shouldHaveDifferentRemoveMethodsForEachLine) {
        return null;
      }

      // console.log(
      //   lines.map((lineArray) => lineArray.map((line) => ({ ...line }))),
      // );

      lines.forEach((lineArray) => {
        lineArray.forEach((line) => {
          const scenarioItem = list.find(
            (scenario) =>
              line.id === scenario.id && _.isEqual(scenario[attr], value),
          );

          if (!scenarioItem) {
            return false;
          }

          if (lineArray.length === maxLinesLength) {
            if (!lineIdRemoveMethods.filter.includes(scenarioItem.id)) {
              //&& !indexRemoveMethods.filter.includes(index)
              lineIdRemoveMethods.filter.push(scenarioItem.id);
            }
          }

          //
          else if (lineArray.length < maxLinesLength) {
            if (!lineIdRemoveMethods.splice.includes(scenarioItem.id)) {
              //!indexRemoveMethods.splice.includes(lineIndex)
              lineIdRemoveMethods.splice.push(scenarioItem.id);
            }
          }
        });
      });

      return lineIdRemoveMethods;
    },
    [],
  );

  const getClearOmissionsForAttr = useCallback((attr: keyof Scenario) => {
    const omitions: Array<keyof Scenario> = ["id", "title", "addressId"];

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
        omitions.push(
          "threat",
          "hypothese",
          "risk",
          "measure",
          "responsibles",
          "responsiblesMergeKey",
        );
        break;
      default:
        break;
    }

    return omitions;
  }, []);

  const clearLinesValues = useCallback(
    ({
      omitions,
      lineCopies,
      list,
      hasUnmergedInPreviousAttrs,
      indexesToRemove,
      value,
      attr,
      filtered,
      removingFromHistory,
    }: ClearLinesValues) => {
      // Adicionar de volta as linhas removidas apenas com os atributos omitidos
      if (lineCopies.length) {
        const replaceData = _.omit(emptyScenario, omitions);

        const willEmpty = indexesToRemove.length === list.length;

        // Preserva as linhas duplicadas, sobrescrevendo apenas os atributos posteriores
        if (hasUnmergedInPreviousAttrs) {
          // Precisa apagar as linhas também com base na bifurcação. Se for 1+1, não apaga nada. Se for 2+2, precisa apagar as
          // desnessárias e ficar 1+1
          const idsToRemove: any[] = [];

          list.forEach((scenario, index) => {
            const wasCopied = lineCopies.some(
              (lineCopy) => lineCopy.id === scenario.id,
            );

            if (wasCopied) {
              // const isMergeKeyEqual =
              //   (scenario[attr] as any).mergeKey === value.mergeKey;

              if (
                _.isEqual(value, scenario[attr]) &&
                (indexesToRemove.includes(index) || removingFromHistory)
              ) {
                Object.assign(scenario, { ...replaceData });
              }

              const indexes = getIndexesForMergedLines({
                attr: omitions[omitions.length - 1],
                isAdding: true,
                startIndex: index,
                list,
              });

              if (removingFromHistory) {
                idsToRemove.push(...indexes);
              }

              if (indexes.length > 1 && willEmpty) {
                indexes.splice(0, 1);
                indexes.forEach((index) => {
                  idsToRemove.push(list[index].id);
                });
              }
            }
          });

          idsToRemove.forEach((id) => {
            const scenarioIndex = list.findIndex((item) => item.id === id);

            if (scenarioIndex !== -1) {
              list.splice(scenarioIndex, 1);
            }
          });

          return list;
        } //
        else {
          // Como não há linhas duplicadas, remove tudo e adiciona somente a copia que possui todos os attrs anteriores mesclados.
          // Nesse fluxo apenas 1 copia é adicionada, pois só há mais copias quando a flag "hasUnmergedInPreviousAttrs" é true.
          // Aqui é necessário reduzir linhas se houver duplicação posterior, o que é obtido limpando o array e adicionando apenas 1 linha.
          list.splice(0);
          list.push(...filtered);

          lineCopies.forEach((lineCopy) => {
            // Não tem problema comparar pelo mergeKey em vez do indice da linhia ou id da linha, por que remoção
            // de linhas duplicadas não mescladas entra no "return filtered"
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
    [getIndexesForMergedLines],
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

      const omitions = getClearOmissionsForAttr(attr);

      let lineCopies: Scenario[] = [];

      const topRowIndex = findTopCellIndex({ startIndex: rowIndex, attr });

      const indexesToRemove = getIndexesForMergedLines({
        attr,
        isAdding: true,
        startIndex: topRowIndex,
      });

      const removeCount = indexesToRemove.length;

      const willEmpty = list.length === removeCount;

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

        let shouldKeepLine = true;

        if (removingFromHistory) {
          shouldKeepLine = !_.isEqual(value, scenario[attr]);
        } //
        else {
          shouldKeepLine =
            rowCompareValue !== compareValue ||
            !indexesToRemove.includes(index);
        }

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

      const removeMethodsForEachLine = !removingFromHistory
        ? handleRemoveSpecialCase({
            list,
            indexesToRemove,
            prevAttr: omitions[omitions.length - 1],
            attr,
            value,
          })
        : null;

      if (removingFromHistory) {
        const clearedHistory = clearLinesValues({
          omitions,
          lineCopies,
          list,
          attr,
          hasUnmergedInPreviousAttrs: true,
          indexesToRemove,
          value,
          filtered,
          removingFromHistory,
        });
        return clearedHistory;
      }

      if (
        !removeMethodsForEachLine &&
        ((attr === "threat" && !willEmpty) || isLineDuplicated)
      ) {
        return filtered;
      }

      // Limpa as linhas a partir do atributo atual em vez de remover
      clearLinesValues({
        omitions,
        lineCopies,
        list,
        attr,
        hasUnmergedInPreviousAttrs,
        indexesToRemove,
        value,
        filtered,
        removingFromHistory,
      });

      if (removeMethodsForEachLine) {
        removeMethodsForEachLine.filter.forEach((id) => {
          const lineIndex = list.findIndex((scenario) => scenario.id === id);

          if (lineIndex !== -1) {
            list.splice(lineIndex, 1);
          }
        });

        removeMethodsForEachLine.splice.forEach((id, index) => {
          if (index > 0) {
            const lineIndex = list.findIndex((scenario) => scenario.id === id);

            if (lineIndex !== -1) {
              list.splice(lineIndex, 1);
            }
          }
        });
      } //
    },
    [
      getAttrCompareValue,
      removeCheckedValues,
      getIndexesForMergedLines,
      checkIfLineIsDuplicated,
      findTopCellIndex,
      handleRemoveSpecialCase,
      getClearOmissionsForAttr,
      clearLinesValues,
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
      setCheckedValues((oldValues) =>
        oldValues.filter((checkedItem) => {
          const hasLineWithRowId = updatedScenariosList.some(
            (scenario: Scenario) => scenario.id === checkedItem.rowId,
          );

          return hasLineWithRowId;
        }),
      );
    },
    [
      scenariosList,
      savePreviousState,
      handleRemoveAddressOrResponsible,
      scenariosHistory,
      handleRemoveOtherAttrs,
      setScenariosHistory,
      setScenariosList,
      setCheckedValues,
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

interface HandleRemoveSpecialCase {
  list: any[];
  indexesToRemove: Array<number>;
  prevAttr: keyof Scenario;
  attr: keyof Scenario;
  value: any;
}

interface LineIdRemoveMethods {
  filter: any[];
  splice: any[];
  clearOnly: any[];
}

interface ClearLinesValues {
  omitions: Array<keyof Scenario>;
  lineCopies: Array<Scenario>;
  list: Array<Scenario>;
  hasUnmergedInPreviousAttrs: boolean;
  indexesToRemove: Array<number>;
  value: any;
  attr: keyof Scenario;
  filtered: Array<Scenario>;
  removingFromHistory: boolean;
}
