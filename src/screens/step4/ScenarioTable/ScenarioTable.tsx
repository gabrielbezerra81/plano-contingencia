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

import { Table, ItemListingText, THContainer } from "./styles";

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
              <th {...column.getHeaderProps()}>{column.render("Header")}</th>
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
                column.topCellValue === null
                //  cell.value === "" ||
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
                      item={notCheckedLocations[index]}
                      attr="addressId"
                    />
                  )}
                </div>
              </td>
              <td>
                <div>
                  {!!notCheckedCobrades[index] && (
                    <CellCheckableItem
                      item={notCheckedCobrades[index]}
                      attr="threat"
                    />
                  )}
                </div>
              </td>
              <td>
                <div>
                  {!!notCheckedHypotheses[index] && (
                    <CellCheckableItem
                      item={notCheckedHypotheses[index]}
                      attr="hypothese"
                    />
                  )}
                </div>
              </td>
              <td>
                <div>
                  {!!notCheckedRisks[index] && (
                    <CellCheckableItem
                      item={notCheckedRisks[index]}
                      attr="risk"
                    />
                  )}
                </div>
              </td>
              <td>
                <div>
                  {!!notCheckedMeasures[index] && (
                    <CellCheckableItem
                      item={notCheckedMeasures[index]}
                      attr="measure"
                    />
                  )}
                </div>
              </td>
              <td>
                <div>
                  {!!notCheckedResponsibles[index] && (
                    <CellCheckableItem
                      attr="responsibles"
                      item={notCheckedResponsibles[index]}
                    />
                  )}
                </div>
              </td>
              <td>
                <div>
                  {!!notCheckedResources[index] && (
                    <CellCheckableItem
                      attr="resourceId"
                      item={notCheckedResources[index]}
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

interface THProps {
  containerClass?: string;
  style?: React.CSSProperties;
  onClick?: (...data: any) => any;
  title: string;
}

export const TableHead: React.FC<THProps> = ({
  containerClass = "",
  style = {},
  onClick = () => {},
  title,
}) => {
  const columnTitle = useMemo(() => {
    if (title) {
      const lines = title.split("\n");
      return (
        <h6>
          {lines.map((line, index) => (
            <React.Fragment key={index}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </h6>
      );
    }
    return "";
  }, [title]);

  return (
    <THContainer onClick={onClick} className={containerClass} style={style}>
      <FiPlus />
      {columnTitle}
    </THContainer>
  );
};

const TableCell: React.FC<TableCellProps> = ({
  rowIndex,
  cell,
  formattedRiskLocations,
  formattedResponsibles,
  formattedResources,
}) => {
  const {
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

      return <CellCheckableItem attr="addressId" item={address} />;
    }

    return null;
  }, [cell, formattedRiskLocations, locationFilterText]);

  const threatCellContent = useMemo(() => {
    if (cell.column.id === "threat.description") {
      const cobradeItem = addedCobrades.find(
        (cobradeItem) => cobradeItem.description === cell.value,
      );

      if (!cobradeItem) {
        return null;
      }

      return <CellCheckableItem item={cobradeItem} attr="threat" />;
    }

    return null;
  }, [cell.column.id, addedCobrades, cell.value]);

  const hypotheseCellContent = useMemo(() => {
    if (cell.column.id === "hypothese") {
      const hypotheseItem = addedHypotheses.find(
        (item) => item.hypothese === cell.value,
      );

      if (!hypotheseItem) {
        return null;
      }

      return <CellCheckableItem item={hypotheseItem} attr="hypothese" />;
    }

    return null;
  }, [cell.column.id, cell.value, addedHypotheses]);

  const riskCellContent = useMemo(() => {
    if (cell.column.id === "risk.description") {
      const risk = addedRisks.find(
        (riskItem) => riskItem.description === cell.value,
      );

      if (!risk) {
        return null;
      }

      return <CellCheckableItem item={risk} attr="risk" />;
    }

    return null;
  }, [cell.column.id, cell.value, addedRisks]);

  const measureCellContent = useMemo(() => {
    if (cell.column.id === "measure.description") {
      const measure = addedMeasures.find(
        (measure) => measure.description === cell.value,
      );

      if (!measure) {
        return null;
      }

      return <CellCheckableItem item={measure} attr="measure" />;
    }

    return null;
  }, [cell.column.id, cell.value, addedMeasures]);

  const responsiblesCellContent = useMemo(() => {
    if (cell.column.id === "responsibles") {
      const ids = cell.value.split(" ");

      if (!ids || !Array.isArray(ids)) {
        return null;
      }

      return ids.map((responsibleId: string) => {
        const responsible = formattedResponsibles.find(
          (responsible) => responsible.id === responsibleId,
        );

        // if (!responsibleId) {
        //   return "null id";
        // }

        if (!responsible) {
          return null;
        }

        if (!responsible.checked) {
          return null;
        }

        return <CellCheckableItem item={responsible} attr="responsibles" />;
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

      return <CellCheckableItem item={resource} attr="resourceId" />;
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

interface CellCheckableItemProps {
  attr: keyof Scenario;
  item: any;
}

const CellCheckableItem: React.FC<CellCheckableItemProps> = ({
  attr,
  item,
}) => {
  const { handleCheckItem, disabledColumnsCheckbox } = useScenario();

  const props = useMemo(() => {
    const { checked, ...itemProps } = item;

    const props = {
      checked,
      disabled: false,
      text: "",
      value: "",
    };

    switch (attr) {
      case "addressId":
        props.disabled = disabledColumnsCheckbox.address;
        props.text = itemProps.formattedAddress.jsxElement;
        props.value = itemProps.id;
        break;
      case "threat":
        props.disabled = disabledColumnsCheckbox.threat;
        props.text = itemProps.description;
        props.value = itemProps;
        break;
      case "hypothese":
        props.disabled = disabledColumnsCheckbox.hypothese;
        props.text = itemProps.hypothese;
        props.value = itemProps.hypothese;
        break;
      case "risk":
        props.disabled = disabledColumnsCheckbox.risk;
        props.text = itemProps.description;
        props.value = itemProps;
        break;
      case "measure":
        props.disabled = disabledColumnsCheckbox.measure;
        props.text = itemProps.description;
        props.value = itemProps;
        break;
      case "responsibles":
        props.disabled = disabledColumnsCheckbox.responsible;
        props.text = `${itemProps.name} - ${itemProps.role}`;
        props.value = itemProps;
        break;
      case "resourceId":
        props.text = itemProps.formattedValue2 || itemProps.value1;
        props.value = itemProps.id;
        break;
      default:
        break;
    }

    return props;
  }, [attr, item, disabledColumnsCheckbox]);

  return (
    <div className="itemListing">
      <Form.Check
        custom
        type="checkbox"
        onChange={() => handleCheckItem(attr, props.value)}
        checked={props.checked}
        disabled={props.disabled}
      />
      <ItemListingText included={props.checked}>{props.text}</ItemListingText>
    </div>
  );
};
