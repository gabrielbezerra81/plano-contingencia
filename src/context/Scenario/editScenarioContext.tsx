import produce from "immer";
import React, { useCallback, useContext, useMemo, useState } from "react";

import _ from "lodash";

import { Scenario } from "types/Plan";
import { useScenario } from "./scenarioContext";

interface EditScenarioContextData {
  handleEditItem: (data: HandleEditItem) => void;
  openModalToEdit: (data: OpenModalToEdit) => void;
  editingProps: OpenModalToEdit | null;
  setEditingProps: React.Dispatch<React.SetStateAction<OpenModalToEdit | null>>;
}

const EditScenarioContext = React.createContext<EditScenarioContextData>(
  {} as EditScenarioContextData,
);

const EditScenarioProvider: React.FC = ({ children }) => {
  const {
    setScenariosList,
    savePreviousState,
    scenariosList,
    getIndexesForMergedLines,
    setCheckedValues,
  } = useScenario();

  const [editingProps, setEditingProps] = useState<OpenModalToEdit | null>(
    null,
  );

  const openModalToEdit = useCallback((data: OpenModalToEdit) => {
    setEditingProps(data);
  }, []);

  const handleEditItem = useCallback(
    ({ newValue }: HandleEditItem) => {
      if (!editingProps) {
        return;
      }

      const { attr, rowIndex, value } = editingProps;

      const updatedValue = { ...value, ...newValue };

      savePreviousState();

      const indexesToUpdate = getIndexesForMergedLines({
        attr,
        isAdding: true,
        startIndex: rowIndex,
      });

      setCheckedValues((checkedValues) =>
        produce(checkedValues, (draft) => {
          indexesToUpdate.forEach((index) => {
            const rowIdToUpdate = scenariosList[index].id;

            draft.forEach((checkedItem) => {
              if (
                checkedItem.rowId === rowIdToUpdate &&
                _.isEqual(value, checkedItem.value)
              ) {
                checkedItem.value = updatedValue;
              }
            });
          });
        }),
      );

      const updatedScenariosList = produce(scenariosList, (draft) => {
        indexesToUpdate.forEach((index) => {
          Object.assign(draft[index], { [attr]: updatedValue });
        });
      });

      setScenariosList(updatedScenariosList);
    },
    [
      setScenariosList,
      savePreviousState,
      getIndexesForMergedLines,
      editingProps,
      setCheckedValues,
      scenariosList,
    ],
  );

  const value = useMemo(() => {
    return {
      handleEditItem,
      openModalToEdit,
      editingProps,
      setEditingProps,
    };
  }, [handleEditItem, openModalToEdit, editingProps]);

  return (
    <EditScenarioContext.Provider value={value}>
      {children}
    </EditScenarioContext.Provider>
  );
};

export default EditScenarioProvider;

export const useEditScenario = () => {
  const context = useContext(EditScenarioContext);

  return context;
};

interface OpenModalToEdit {
  attr: keyof Scenario;
  value: any;
  rowIndex?: number;
}

interface HandleEditItem {
  newValue: any;
}
