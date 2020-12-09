import { usePlanData } from "context/PlanData/planDataContext";
import { useScenario } from "context/PlanData/scenarioContext";
import React, { useMemo, useState } from "react";
import { Form } from "react-bootstrap";
import { FiPlus } from "react-icons/fi";
import { GrSearch } from "react-icons/gr";
import { TableInstance } from "react-table";
import Input from "shared/components/Input/Input";
import formatResourceAddress from "shared/utils/format/formatResourceAddress";
import formatScenarioAddress from "shared/utils/format/formatScenarioAddress";
import { Responsible, Scenario } from "types/Plan";

import { Table, ItemListingText } from "./styles";

interface Props {
  tableInstance: TableInstance<Scenario>;
}

const ScenarioTable: React.FC<Props> = ({ tableInstance }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;

  const { planData } = usePlanData();

  const {
    verifyIfPreviousScenariosHasValue,
    disabledColumnsCheckbox,
    addedCobrades,
    addedHypotheses,
    addedRisks,
    addedMeasures,
  } = useScenario();

  const formattedRiskLocations = useMemo(() => {
    return planData.riskLocations.map((locationItem) => ({
      ...locationItem,
      formattedAddress: formatScenarioAddress(locationItem),
      checked: verifyIfPreviousScenariosHasValue("addressId", locationItem.id),
    }));
  }, [planData.riskLocations, verifyIfPreviousScenariosHasValue]);

  const formattedResponsibles = useMemo(() => {
    const responsibles: Responsible[] = [];

    planData.resources.forEach((resource) => {
      resource.responsibles.forEach((responsible) => {
        const alreadyIncluded = responsibles.some(
          (includedItem) =>
            `${includedItem.name} ${includedItem.role} ${includedItem.permission}` ===
            `${responsible.name} ${responsible.role} ${responsible.permission}`,
        );

        if (!alreadyIncluded) {
          responsibles.push(responsible);
        }
      });
    });

    return responsibles.map((responsible) => {
      const checked = verifyIfPreviousScenariosHasValue(
        "responsibles",
        `${responsible.name} ${responsible.role} ${responsible.permission}`,
      );

      return { ...responsible, checked };
    });
  }, [planData.resources, verifyIfPreviousScenariosHasValue]);

  const formattedResources = useMemo(() => {
    return planData.resources.map((resource) => {
      const checked = verifyIfPreviousScenariosHasValue(
        "resourceId",
        resource.id,
      );

      const formattedAddress = formatResourceAddress(resource.address);

      let value2;

      if (resource.type === "dinheiro" && resource.value2) {
        value2 = "R$ " + resource.value2;
      }

      return {
        ...resource,
        formattedAddress,
        checked,
        formattedValue2: value2 ? value2 : undefined,
      };
    });
  }, [planData.resources, verifyIfPreviousScenariosHasValue]);

  const notCheckedLocations = useMemo(
    () => formattedRiskLocations.filter((location) => !location.checked),
    [formattedRiskLocations],
  );

  const notCheckedCobrades = useMemo(
    () => addedCobrades.filter((cobrade) => !cobrade.checked),
    [addedCobrades],
  );

  const notCheckedHypotheses = useMemo(
    () => addedHypotheses.filter((item) => !item.checked),
    [addedHypotheses],
  );

  const notCheckedRisks = useMemo(
    () => addedRisks.filter((riskItem) => !riskItem.checked),
    [addedRisks],
  );

  const notCheckedMeasures = useMemo(
    () => addedMeasures.filter((measure) => !measure.checked),
    [addedMeasures],
  );

  const notCheckedResponsibles = useMemo(
    () => formattedResponsibles.filter((responsible) => !responsible.checked),
    [formattedResponsibles],
  );

  const notCheckedResources = useMemo(
    () => formattedResources.filter((resource) => !resource.checked),
    [formattedResources],
  );

  const numberOfUncheckedRows = useMemo(() => {
    return Math.max(
      notCheckedLocations.length,
      notCheckedCobrades.length,
      notCheckedHypotheses.length,
      notCheckedRisks.length,
      notCheckedMeasures.length,
      notCheckedResponsibles.length,
      notCheckedResources.length,
    );
  }, [
    notCheckedLocations,
    notCheckedCobrades,
    notCheckedHypotheses,
    notCheckedRisks,
    notCheckedMeasures,
    notCheckedResponsibles,
    notCheckedResources,
  ]);

  const notCheckedArray: any[] = Array(numberOfUncheckedRows).fill(1);

  return (
    <Table {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()}>
                <FiPlus />
                {column.render("Header")}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          let numCells = row.allCells.length;

          for (let j = 0; j < numCells; j++) {
            let cell = row.allCells[j] as any;
            let column = cell.column as any;

            if (column.enableRowSpan) {
              if (
                column.topCellValue !== cell.value ||
                cell.value === "" ||
                column.topCellValue === null
              ) {
                column.topCellValue = cell.value;
                column.topCellIndex = i;
                cell.spannedRows = [row];
                cell.rowSpan = 1;
                cell.isRowSpanned = false;
              } else {
                cell.isRowSpanned = true;
                const rowsAllCells = rows[column.topCellIndex].allCells[
                  j
                ] as any;
                rowsAllCells.rowSpan++;
                if (rowsAllCells.spannedRows) {
                  rowsAllCells.spannedRows.push(row);
                }
              }
            }
          }

          return (
            <TableRow
              key={row.index}
              row={row}
              formattedRiskLocations={formattedRiskLocations}
              formattedResponsibles={formattedResponsibles}
              formattedResources={formattedResources}
            />
          );
        })}

        {notCheckedArray.map((_, index) => {
          return (
            <tr>
              <td>
                <div>
                  {!!notCheckedLocations[index] && (
                    <CellCheckableItem
                      key={index}
                      checked={notCheckedLocations[index].checked}
                      disabled={disabledColumnsCheckbox.address}
                      text={
                        notCheckedLocations[index].formattedAddress.jsxElement
                      }
                      attr="addressId"
                      value={notCheckedLocations[index].id}
                    />
                  )}
                </div>
              </td>
              <td>
                <div>
                  {!!notCheckedCobrades[index] && (
                    <CellCheckableItem
                      key={index}
                      checked={notCheckedCobrades[index].checked}
                      disabled={disabledColumnsCheckbox.threat}
                      text={notCheckedCobrades[index].description}
                      attr="threat"
                      value={{
                        ...notCheckedCobrades[index],
                        checked: undefined,
                      }}
                    />
                  )}
                </div>
              </td>
              <td>
                <div>
                  {!!notCheckedHypotheses[index] && (
                    <CellCheckableItem
                      key={index}
                      checked={notCheckedHypotheses[index].checked}
                      disabled={disabledColumnsCheckbox.hypothese}
                      text={notCheckedHypotheses[index].hypothese}
                      attr="hypothese"
                      value={notCheckedHypotheses[index].hypothese}
                    />
                  )}
                </div>
              </td>
              <td>
                <div>
                  {!!notCheckedRisks[index] && (
                    <CellCheckableItem
                      key={index}
                      checked={notCheckedRisks[index].checked}
                      disabled={disabledColumnsCheckbox.risk}
                      text={notCheckedRisks[index].description}
                      attr="risk"
                      value={{ ...notCheckedRisks[index], checked: undefined }}
                    />
                  )}
                </div>
              </td>
              <td>
                <div>
                  {!!notCheckedMeasures[index] && (
                    <CellCheckableItem
                      checked={notCheckedMeasures[index].checked}
                      text={notCheckedMeasures[index].description}
                      value={{
                        ...notCheckedMeasures[index],
                        checked: undefined,
                      }}
                      disabled={disabledColumnsCheckbox.measure}
                      attr="measure"
                    />
                  )}
                </div>
              </td>
              <td>
                <div>
                  {!!notCheckedResponsibles[index] && (
                    <CellCheckableItem
                      key={index}
                      checked={notCheckedResponsibles[index].checked}
                      disabled={disabledColumnsCheckbox.responsible}
                      text={`${notCheckedResponsibles[index].name} - ${notCheckedResponsibles[index].role}`}
                      attr="responsibles"
                      value={{
                        ...notCheckedResponsibles[index],
                        checked: undefined,
                      }}
                    />
                  )}
                </div>
              </td>
              <td>
                <div>
                  {!!notCheckedResources[index] && (
                    <CellCheckableItem
                      key={index}
                      checked={notCheckedResources[index].checked}
                      disabled={false}
                      text={
                        notCheckedResources[index].formattedValue2 ||
                        notCheckedResources[index].value1
                      }
                      attr="resourceId"
                      value={notCheckedResources[index].id}
                    />
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default ScenarioTable;

interface TableRowProps {
  row: any;
  formattedRiskLocations: any;
  formattedResponsibles: any;
  formattedResources: any;
}

const TableRow: React.FC<TableRowProps> = ({
  row,
  formattedRiskLocations,
  formattedResponsibles,
  formattedResources,
}) => {
  let cells: any = [];
  let len = row.cells.length;
  for (let i = 0; i < len; i++) {
    let cell = row.cells[i];

    if (!cell.isRowSpanned) {
      cells.push(
        <td rowSpan={cell.rowSpan} key={`cell ${cell.column.id}`}>
          <div>
            <TableCell
              rowIndex={row.index}
              cell={cell}
              formattedRiskLocations={formattedRiskLocations}
              formattedResponsibles={formattedResponsibles}
              formattedResources={formattedResources}
            />
          </div>
        </td>,
      );
    }
  }

  return (
    <tr {...row.getRowProps()} key={`row${row.id}`}>
      {cells}
    </tr>
  );
};

interface TableCellProps {
  rowIndex: number;
  cell: any;
  formattedRiskLocations: any[];
  formattedResponsibles: any[];
  formattedResources: any[];
}

const TableCell: React.FC<TableCellProps> = ({
  rowIndex,
  cell,
  formattedRiskLocations,
  formattedResponsibles,
  formattedResources,
}) => {
  const {
    disabledColumnsCheckbox,
    addedCobrades,
    addedHypotheses,
    addedRisks,
    addedMeasures,
  } = useScenario();

  const [locationFilterText, setLocationFilterText] = useState("");

  const addressFilter = useMemo(() => {
    if (cell.column.id === "addressId" && rowIndex === 0) {
      return (
        <Input
          borderBottomOnly
          rightIcon={<GrSearch />}
          value={locationFilterText}
          onChange={(e) =>
            setLocationFilterText(e.target.value.toLocaleLowerCase())
          }
        />
      );
    }

    return null;
  }, [cell.column.id, locationFilterText, rowIndex]);

  const addressCellContent = useMemo(() => {
    if (cell.column.id === "addressId") {
      const address = formattedRiskLocations.find(
        (item: any) => item.id === cell.value,
      );

      if (!address) {
        return null;
      }

      const filterCondition =
        !!locationFilterText &&
        !address.formattedAddress.fullAddress
          .toLocaleLowerCase()
          .includes(locationFilterText);

      if (filterCondition) {
        return null;
      }

      return (
        <CellCheckableItem
          checked={address.checked}
          disabled={disabledColumnsCheckbox.address}
          text={address.formattedAddress.jsxElement}
          attr="addressId"
          value={address.id}
        />
      );
    }

    return null;
  }, [
    cell,
    formattedRiskLocations,
    locationFilterText,
    disabledColumnsCheckbox.address,
  ]);

  const threatCellContent = useMemo(() => {
    if (cell.column.id === "threat.description") {
      const cobradeItem = addedCobrades.find(
        (cobradeItem) => cobradeItem.description === cell.value,
      );

      if (!cobradeItem) {
        return null;
      }

      return (
        <CellCheckableItem
          checked={cobradeItem.checked}
          disabled={disabledColumnsCheckbox.threat}
          text={cobradeItem.description}
          attr="threat"
          value={{
            cobrade: cobradeItem.cobrade,
            description: cobradeItem.description,
          }}
        />
      );
    }

    return null;
  }, [
    cell.column.id,
    addedCobrades,
    cell.value,
    disabledColumnsCheckbox.threat,
  ]);

  const hypotheseCellContent = useMemo(() => {
    if (cell.column.id === "hypothese") {
      const item = addedHypotheses.find(
        (item) => item.hypothese === cell.value,
      );

      if (!item) {
        return null;
      }

      return (
        <CellCheckableItem
          checked={item.checked}
          text={item.hypothese}
          value={item.hypothese}
          disabled={disabledColumnsCheckbox.hypothese}
          attr="hypothese"
        />
      );
    }

    return null;
  }, [
    cell.column.id,
    cell.value,
    addedHypotheses,
    disabledColumnsCheckbox.hypothese,
  ]);

  const riskCellContent = useMemo(() => {
    if (cell.column.id === "risk.description") {
      const risk = addedRisks.find(
        (riskItem) => riskItem.description === cell.value,
      );

      if (!risk) {
        return null;
      }

      return (
        <CellCheckableItem
          disabled={disabledColumnsCheckbox.risk}
          checked={risk.checked}
          text={risk.description}
          attr="risk"
          value={{ ...risk, checked: undefined }}
        />
      );
    }

    return null;
  }, [cell.column.id, cell.value, addedRisks, disabledColumnsCheckbox.risk]);

  const measureCellContent = useMemo(() => {
    if (cell.column.id === "measure.description") {
      const measure = addedMeasures.find(
        (measure) => measure.description === cell.value,
      );

      if (!measure) {
        return null;
      }

      return (
        <CellCheckableItem
          checked={measure.checked}
          text={measure.description}
          value={{ ...measure, checked: undefined }}
          disabled={disabledColumnsCheckbox.measure}
          attr="measure"
        />
      );
    }

    return null;
  }, [
    cell.column.id,
    cell.value,
    addedMeasures,
    disabledColumnsCheckbox.measure,
  ]);

  const responsiblesCellContent = useMemo(() => {
    if (cell.column.id === "responsibles") {
      const ids = cell.value.split(" ");

      if (!ids) {
        return null;
      }

      return ids.map((responsibleId: string) => {
        const responsible = formattedResponsibles.find(
          (responsible) => responsible.id === responsibleId,
        );

        if (!responsible) {
          return null;
        }

        return (
          <CellCheckableItem
            disabled={disabledColumnsCheckbox.responsible}
            value={responsible}
            checked={responsible.checked}
            text={`${responsible.name} - ${responsible.role}`}
            attr="responsibles"
          />
        );
      });
    }

    return null;
  }, [cell.column.id, cell.value, formattedResponsibles]);

  const resourcesCellContent = useMemo(() => {
    if (cell.column.id === "resourceId") {
      const resource = formattedResources.find(
        (item: any) => item.id === cell.value,
      );

      if (!resource) {
        return null;
      }

      return (
        <CellCheckableItem
          checked={resource.checked}
          disabled={false}
          text={resource.formattedValue2 || resource.value1}
          attr="resourceId"
          value={resource.id}
        />
      );
    }

    return null;
  }, [cell.column.id, cell.value, formattedResources]);

  return (
    <>
      {/* {addressFilter} */}
      {addressCellContent}
      {threatCellContent}
      {hypotheseCellContent}
      {riskCellContent}
      {measureCellContent}
      {responsiblesCellContent}
      {resourcesCellContent}
    </>
  );
};

// cell.render("Cell")}

interface CellCheckableItemProps {
  attr: keyof Scenario;
  value: any;
  checked: boolean;
  text: any;
  disabled: boolean;
}

const CellCheckableItem: React.FC<CellCheckableItemProps> = ({
  attr,
  value,
  checked,
  text,
  disabled,
}) => {
  const { handleCheckItem } = useScenario();

  return (
    <div className="itemListing">
      <Form.Check
        custom
        type="checkbox"
        onChange={() => handleCheckItem(attr, value)}
        checked={checked}
        disabled={disabled}
      />
      <ItemListingText included={checked}>{text}</ItemListingText>
    </div>
  );
};
