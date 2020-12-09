import { usePlanData } from "context/PlanData/planDataContext";
import React, { useCallback, useMemo, useState } from "react";
import { Form } from "react-bootstrap";
import { FiPlus } from "react-icons/fi";
import { GrSearch } from "react-icons/gr";
import { TableInstance } from "react-table";
import Input from "shared/components/Input/Input";
import formatScenarioAddress from "shared/utils/format/formatScenarioAddress";
import { Scenario } from "types/Plan";
import { ScenarioDTO } from "../types";

import { Table, ItemListingText } from "./styles";

interface Props {
  tableInstance: TableInstance<Scenario>;
  scenarioDTO: ScenarioDTO;
}

const ScenarioTable: React.FC<Props> = ({ tableInstance, scenarioDTO }) => {
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
    handleCheckItem,
  } = scenarioDTO;

  const formattedRiskLocations = useMemo(() => {
    return planData.riskLocations.map((locationItem) => ({
      ...locationItem,
      formattedAddress: formatScenarioAddress(locationItem),
      checked: verifyIfPreviousScenariosHasValue("addressId", locationItem.id),
    }));
  }, [planData.riskLocations, verifyIfPreviousScenariosHasValue]);

  const numberOfUncheckedRows = useMemo(() => {
    const notCheckedLocations = formattedRiskLocations.filter(
      (location) => !location.checked,
    ).length;

    return Math.max(notCheckedLocations);
  }, [formattedRiskLocations]);

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
              scenarioDTO={scenarioDTO}
              formattedRiskLocations={formattedRiskLocations}
            />
          );
        })}

        {notCheckedArray.map((_, index) => {
          return (
            <tr>
              <td>
                <div>
                  {formattedRiskLocations
                    .filter((location) => !location.checked)
                    .map((location, index) => (
                      <CellCheckableItem
                        key={index}
                        scenarioDTO={scenarioDTO}
                        checked={location.checked}
                        disabled={disabledColumnsCheckbox.address}
                        text={location.formattedAddress.jsxElement}
                        attr="addressId"
                        value={location.id}
                      />
                    ))}
                </div>
              </td>
              <td>
                <div></div>
              </td>
              <td>
                <div></div>
              </td>
              <td>
                <div></div>
              </td>
              <td>
                <div></div>
              </td>
              <td>
                <div></div>
              </td>
              <td>
                <div></div>
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
  scenarioDTO: ScenarioDTO;
  formattedRiskLocations: any;
}

const TableRow: React.FC<TableRowProps> = ({
  row,
  scenarioDTO,
  formattedRiskLocations,
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
              scenarioDTO={scenarioDTO}
              formattedRiskLocations={formattedRiskLocations}
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
  scenarioDTO: ScenarioDTO;
  cell: any;
  formattedRiskLocations: any;
}

const TableCell: React.FC<TableCellProps> = ({
  rowIndex,
  scenarioDTO,
  cell,
  formattedRiskLocations,
}) => {
  const { disabledColumnsCheckbox, handleCheckItem } = scenarioDTO;

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
          scenarioDTO={scenarioDTO}
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
    scenarioDTO,
  ]);

  const resourcesCellContent = useMemo(() => {}, []);

  return (
    <>
      {/* {addressFilter} */}
      {cell.column.id === "addressId"
        ? addressCellContent
        : cell.render("Cell")}
    </>
  );
};

interface CellCheckableItemProps {
  scenarioDTO: ScenarioDTO;
  attr: any;
  value: any;
  checked: boolean;
  text: any;
  disabled: boolean;
}

const CellCheckableItem: React.FC<CellCheckableItemProps> = ({
  scenarioDTO,
  attr,
  value,
  checked,
  text,
  disabled,
}) => {
  const { handleCheckItem } = scenarioDTO;

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
