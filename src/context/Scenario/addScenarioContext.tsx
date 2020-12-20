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

const AddScenarioProvider: React.FC = ({ children }) => {
  const {
    setCheckedValues,
    setScenariosList,
    verifyIfIsChecked,
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
        const updatedList = produce(oldScenarioList, (draft) => {
          savePreviousState();

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

          draft.forEach((scenarioItem) => {
            let shouldChangeAttrInLine: boolean = false;
            let isPreviousColumnChecked = false;
            let previousAttr: keyof Scenario = "" as any;
            const pickAttrs: Array<keyof Scenario> = ["title"];

            switch (attr) {
              case "threat":
                shouldChangeAttrInLine = !scenarioItem.threat.cobrade;
                previousAttr = "addressId";
                pickAttrs.push("addressId");
                break;
              case "hypothese":
                shouldChangeAttrInLine =
                  !!scenarioItem.threat.cobrade &&
                  !scenarioItem.hypothese.hypothese;
                previousAttr = "threat";
                pickAttrs.push("addressId", "threat");

                break;
              case "risk":
                shouldChangeAttrInLine =
                  !!scenarioItem.hypothese.hypothese &&
                  !scenarioItem.risk.description;
                previousAttr = "hypothese";
                pickAttrs.push("addressId", "threat", "hypothese");

                break;
              case "measure":
                shouldChangeAttrInLine =
                  !!scenarioItem.risk.description &&
                  !scenarioItem.measure.description;
                pickAttrs.push("addressId", "threat", "hypothese", "risk");

                previousAttr = "risk";
                break;

              case "resourceId":
                shouldChangeAttrInLine =
                  !!scenarioItem.measure.description &&
                  !scenarioItem.resourceId.resourceId;
                pickAttrs.push(
                  "addressId",
                  "threat",
                  "hypothese",
                  "risk",
                  "measure",
                  "responsibles",
                  "responsiblesMergeKey",
                );
                previousAttr = "responsibles";
                break;
              default:
                break;
            }

            // Verificação por rowId individualiza as linhas. Celulas em linhas separadas podem ter o mesmo mergeKey se tiver ocorrido duplicação
            // E para conseguir adicionar um valor na coluna seguinte para apenas um desses itens de mesmo mergeKey, só é possivel usando o rowId

            if (attr === "resourceId") {
              isPreviousColumnChecked = scenarioItem.responsibles.some(
                (responsible) =>
                  verifyIfIsChecked({
                    attr: "responsibles",
                    value: responsible,
                    compareMode: "rowId",
                    rowId: scenarioItem.id,
                  }),
              );
            } //
            else {
              isPreviousColumnChecked = verifyIfIsChecked({
                attr: previousAttr,
                value: scenarioItem[previousAttr],
                compareMode: "rowId",
                rowId: scenarioItem.id,
              });
            }

            if (!isPreviousColumnChecked) {
              return;
            }

            if (shouldChangeAttrInLine) {
              Object.assign(scenarioItem, { [attr]: value });
            } //
            else {
              const newLineId = (Math.random() * 100).toFixed(2);

              const duplicateData = _.pick(scenarioItem, pickAttrs);

              draft.push({
                ...emptyScenario,
                ...duplicateData,
                [attr]: value,
                id: newLineId,
              });

              duplicateCheckedValuesWhenAddingLine({
                rowId: scenarioItem.id || "",
                newRowId: newLineId,
              });
            }
          });
        });

        return updatedList;
      });
    },
    [
      verifyIfIsChecked,
      savePreviousState,
      duplicateCheckedValuesWhenAddingLine,
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
