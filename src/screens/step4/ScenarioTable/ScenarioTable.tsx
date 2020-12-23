/* eslint-disable no-restricted-globals */
import { usePlanData } from "context/PlanData/planDataContext";
import { useEditScenario } from "context/Scenario/editScenarioContext";
import { useRemoveScenario } from "context/Scenario/removeScenarioContext";
import { useScenario } from "context/Scenario/scenarioContext";
import React, { useCallback, useMemo, useState } from "react";
import { Form } from "react-bootstrap";
import { FiPlus, FiX, FiEdit } from "react-icons/fi";
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

  const { verifyIfScenariosHistoryHasValue } = useScenario();

  const formattedRiskLocations = useMemo(() => {
    return planData.riskLocations.map((locationItem) => ({
      ...locationItem,
      formattedAddress: formatScenarioAddress(locationItem),
      checked: verifyIfScenariosHistoryHasValue("addressId", locationItem.id),
    }));
  }, [planData.riskLocations, verifyIfScenariosHistoryHasValue]);

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
      return { ...responsible };
    });
  }, [planData.resources]);

  const formattedResources = useMemo(() => {
    return planData.resources
      .filter((resource) => resource.type !== "pessoa")
      .map((resource) => {
        const formattedAddress = resource.address
          ? formatResourceAddress(resource.address)
          : "";

        let value2;

        if (resource.type === "dinheiro" && resource.value2) {
          value2 = "R$ " + resource.value2;
        }

        return {
          ...resource,
          formattedAddress,
          formattedValue2: value2 ? value2 : undefined,
        };
      });
  }, [planData.resources]);

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

            let isValueDiff = null;

            if (column.topCellValue) {
              if (cell.column.id === "responsibles" && i > 0) {
                const mergeKey = row.original.responsiblesMergeKey;
                const topMergeKey = rows[i - 1].original.responsiblesMergeKey;
                isValueDiff = mergeKey !== topMergeKey;
              } //
              else if (typeof cell.value === "object") {
                if (cell.value.mergeKey && column.topCellValue.mergeKey) {
                  isValueDiff =
                    cell.value.mergeKey !== column.topCellValue.mergeKey;
                } //
                else {
                  isValueDiff = column.topCellValue !== cell.value;
                }
              }
            } //
            if (isValueDiff === null) {
              isValueDiff = column.topCellValue !== cell.value;
            }
            if (column.enableRowSpan) {
              if (
                isValueDiff ||
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
              row={row}
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
  row: any;
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
  row,
  cell,
  formattedRiskLocations,
  formattedResponsibles,
  formattedResources,
}) => {
  const [locationFilterText, setLocationFilterText] = useState("");

  const addressFilter = useMemo(() => {
    if (cell.column.id === "addressId" && row.index === 0) {
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
  }, [cell.column.id, locationFilterText, row.index]);

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

      return <CellCheckableItem attr="addressId" item={address} row={row} />;
    }

    return null;
  }, [cell, formattedRiskLocations, locationFilterText, row]);

  const threatCellContent = useMemo(() => {
    if (cell.column.id === "threat") {
      return <CellCheckableItem row={row} item={cell.value} attr="threat" />;
    }

    return null;
  }, [cell.column.id, cell.value, row]);

  const hypotheseCellContent = useMemo(() => {
    if (cell.column.id === "hypothese") {
      return (
        <CellCheckableItem
          cell={cell}
          row={row}
          item={cell.value}
          attr="hypothese"
        />
      );
    }

    return null;
  }, [cell, row]);

  const riskCellContent = useMemo(() => {
    if (cell.column.id === "risk") {
      return (
        <CellCheckableItem
          cell={cell}
          row={row}
          item={cell.value}
          attr="risk"
        />
      );
    }

    return null;
  }, [row, cell]);

  const measureCellContent = useMemo(() => {
    if (cell.column.id === "measure") {
      return (
        <CellCheckableItem
          cell={cell}
          row={row}
          item={cell.value}
          attr="measure"
        />
      );
    }

    return null;
  }, [cell, row]);

  const responsiblesCellContent = useMemo(() => {
    if (cell.column.id === "responsibles") {
      const ids = cell.value.split(" ");

      if (!ids || !Array.isArray(ids)) {
        return null;
      }

      return ids.map((responsibleId: string, index) => {
        const responsible = formattedResponsibles.find(
          (responsible) => responsible.id === responsibleId,
        );

        // if (!responsibleId) {
        //   return "null id";
        // }

        if (!responsible) {
          return null;
        }

        delete responsible.group;

        return (
          <CellCheckableItem
            key={index}
            row={row}
            item={responsible}
            attr="responsibles"
          />
        );
      });
    }

    return null;
  }, [cell.column.id, cell.value, formattedResponsibles, row]);

  const resourcesCellContent = useMemo(() => {
    if (cell.column.id === "resourceId") {
      const resource = formattedResources.find(
        (item: any) => item.id === cell.value.resourceId,
      );

      if (!resource) {
        return null;
      }

      return (
        <CellCheckableItem
          item={{ ...resource, mergeKey: cell.value.mergeKey }}
          row={row}
          attr="resourceId"
        />
      );
    }

    return null;
  }, [cell.column.id, cell.value, formattedResources, row]);

  return (
    <>
      {!!addressFilter && null}
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
  row?: any;
  cell?: any;
}

const CellCheckableItem: React.FC<CellCheckableItemProps> = ({
  attr,
  item,
  row,
  cell,
}) => {
  const {
    handleCheckItem,
    disabledColumnsCheckbox,
    verifyIfIsChecked,
  } = useScenario();

  const { handleRemoveItem } = useRemoveScenario();

  const { openModalToEdit } = useEditScenario();

  const rowId = useMemo(() => {
    if (row) {
      return row.original.id;
    }
    return undefined;
  }, [row]);

  const props = useMemo(() => {
    const props = {
      checked: false,
      disabled: false,
      text: "",
      value: "",
    };

    switch (attr) {
      case "addressId":
        props.disabled = disabledColumnsCheckbox.address;
        props.text = item.formattedAddress.jsxElement;
        props.value = item.id;
        break;
      case "threat":
        props.disabled = disabledColumnsCheckbox.threat;
        props.text = item.description;
        props.value = item;
        break;
      case "hypothese":
        props.disabled = disabledColumnsCheckbox.hypothese;
        props.text = item.hypothese;
        props.value = item;
        break;
      case "risk":
        props.disabled = disabledColumnsCheckbox.risk;
        props.text = item.description;
        props.value = item;
        break;
      case "measure":
        props.disabled = disabledColumnsCheckbox.measure;
        props.text = item.description;
        props.value = item;
        break;
      case "responsibles":
        props.disabled = disabledColumnsCheckbox.responsible;
        props.text = `${item.name} - ${item.role}`;
        props.value = item;
        break;
      case "resourceId":
        props.text = item.formattedValue2 || item.value1;
        props.value = { resourceId: item.id, mergeKey: item.mergeKey } as any;
        break;
      default:
        break;
    }

    props.checked = verifyIfIsChecked({
      attr,
      value: props.value,
      rowId,
      compareMode: "rowId",
    });

    return props;
  }, [attr, item, disabledColumnsCheckbox, verifyIfIsChecked, rowId]);

  const handleEdit = useCallback(() => {
    if (cell) {
      const { onClick } = cell.column.Header.props;

      openModalToEdit({
        attr,
        value: props.value,
        rowIndex: row?.index,
      });

      onClick();
    }
  }, [cell, attr, props.value, openModalToEdit, row?.index]);

  if (!props.text) {
    return null;
  }

  return (
    <div className="itemListing">
      <div className="content">
        <Form.Check
          custom
          type="checkbox"
          onChange={() =>
            handleCheckItem({
              attr,
              value: props.value,
              rowId,
              rowIndex: row?.index,
            })
          }
          checked={props.checked}
          disabled={props.disabled}
        />
        <ItemListingText included={props.checked}>{props.text}</ItemListingText>
      </div>
      <div className="buttonsContainer">
        <button
          onClick={() =>
            handleRemoveItem({
              attr,
              value: props.value,
              rowId,
              rowIndex: row?.index,
            })
          }
        >
          <FiX color="red" size={12} />
        </button>
        {["hypothese", "risk", "measure"].includes(attr) && (
          <button onClick={handleEdit}>
            <FiEdit color="#3d3d3d" size={13}></FiEdit>
          </button>
        )}
      </div>
    </div>
  );
};

/**
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

 */
