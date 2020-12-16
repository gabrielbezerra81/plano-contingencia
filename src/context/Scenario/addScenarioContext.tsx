import produce from "immer";
import React, { useCallback, useContext, useState } from "react";
import _ from "lodash";

import { Scenario } from "types/Plan";
import { useScenario } from "./scenarioContext";

import {
  CheckedValue,
  DuplicateCheckedValuesWhenAddingLine,
  HandleAddValueToScenario,
} from "./types";

interface AddScenarioContextData {
  handleAddValueToScenario: ({ attr, value }: HandleAddValueToScenario) => void;
  generateMergeKey: () => number;
}

const AddScenarioContext = React.createContext<AddScenarioContextData>(
  {} as AddScenarioContextData,
);

const AddScenarioProvider: React.FC = ({ children }) => {
  const {
    setCheckedValues,
    setScenariosList,
    verifyIfIsChecked,
    scenariosHistory,
    scenarioTitle,
    setScenariosHistory,
    savePreviousState,
  } = useScenario();

  const [, setMergeKey] = useState(() => {
    const mergeKey = localStorage.getItem("mergeKey");

    if (mergeKey) {
      return Number(mergeKey);
    }

    return 0;
  });

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

  const duplicateCheckedValuesWhenAddingLine = useCallback(
    ({ rowId, newRowId }: DuplicateCheckedValuesWhenAddingLine) => {
      setCheckedValues((oldCheckedValues) => {
        return produce(oldCheckedValues, (draft) => {
          const itemsToAdd: CheckedValue[] = [];

          draft.forEach((checkedItem) => {
            if (checkedItem.rowId === rowId) {
              console.log(checkedItem.rowId, newRowId);
              const newItem = { ...checkedItem, rowId: newRowId };
              itemsToAdd.push(newItem);
            }
          });

          draft.push(...itemsToAdd);
        });
      });
    },
    [setCheckedValues],
  );

  const handleAddValueToScenario = useCallback(
    ({ attr, value }: HandleAddValueToScenario) => {
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
              scenario.responsiblesMergeKey = value.mergeKey;
              scenario.responsibles.push(...value.responsibles);
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
            let newLineResponsiblesMergeKey = undefined;

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
                newLineResponsiblesMergeKey =
                  correspondentLine.responsiblesMergeKey;
              }
            } //
            // Se encontrar um com o atributo vazio, preenche o valor dessa linha. O atributo da linha do prev e da linha atual precisam
            // bater. Os dois cenários precisam ter addressId = 10 para adicionar a ameaça.
            if (
              scenarioItem &&
              _.isEqual(scenarioItem[previousAttr], prevScenario[previousAttr])
            ) {
              Object.assign(scenarioItem, { [attr]: value });
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
                responsiblesMergeKey: newLineResponsiblesMergeKey,
              });

              duplicateCheckedValuesWhenAddingLine({
                rowId: prevScenario.id || "",
                newRowId: newLineId,
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
    [
      scenariosHistory,
      scenarioTitle,
      verifyIfIsChecked,
      savePreviousState,
      duplicateCheckedValuesWhenAddingLine,
      setScenariosHistory,
      setScenariosList,
    ],
  );

  return (
    <AddScenarioContext.Provider
      value={{ generateMergeKey, handleAddValueToScenario }}
    >
      {children}
    </AddScenarioContext.Provider>
  );
};

export default AddScenarioProvider;

export const useAddScenario = () => {
  const context = useContext(AddScenarioContext);

  return context;
};
