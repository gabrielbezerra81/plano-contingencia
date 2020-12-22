import React, { useState, useMemo, useCallback, useRef } from "react";
import { Button } from "react-bootstrap";

import {
  useTable,
  useSortBy,
  useAsyncDebounce,
  useGlobalFilter,
} from "react-table";
import { GrSearch } from "react-icons/gr";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

import Input from "shared/components/Input/Input";

import { Container, MembersContainer, RoleCell } from "./styles";
import AddToGroupModal from "../../shared/components/AddToGroupModal/AddToGroupModal";
import { usePlanData } from "context/PlanData/planDataContext";
import { Member } from "types/Plan";
import { FiEdit, FiX } from "react-icons/fi";
import produce from "immer";

type ReducedMember = Omit<Member, "group" | "permission" | "personId"> & {
  index: number;
};

interface TableColumn {
  Header: string;
  accessor: keyof ReducedMember;
}

interface GlobalFilterProps {
  setGlobalFilter: (filterValue: string) => void;
  globalFilter: string;
}

const StepTwo = () => {
  const { planData, updateLocalPlanData } = usePlanData();

  const reducedMembers: ReducedMember[] = useMemo(() => {
    return planData.workGroup.map((memberItem, index) => {
      const member: ReducedMember = {
        id: memberItem.id,
        name: memberItem.name,
        role: memberItem.role,
        status: memberItem.status,
        phone: memberItem.phone,
        index: index + 1,
      };

      return member;
    });
  }, [planData.workGroup]);

  const [showAddToGroupModal, setShowAddToGroupModal] = useState(false);

  const columns: TableColumn[] = useMemo(
    () => [
      {
        Header: "ORD",
        accessor: "index", // accessor is the "key" in the data
      },
      {
        Header: "NOME",
        accessor: "name",
      },
      {
        Header: "FUNÇÃO",
        accessor: "role",
      },
      {
        Header: "TELEFONE",
        accessor: "phone",
      },
    ],
    [],
  );

  const defaultColumn = {
    Cell: EditableCell,
  };

  const updateMyData = useCallback(
    (rowIndex: any, columnId: any, value: any) => {
      const updatedPlanData = produce(planData, (draft) => {
        draft.workGroup[rowIndex].role = value;
      });

      updateLocalPlanData(updatedPlanData);
    },
    [updateLocalPlanData, planData],
  );

  const handleRemoveRow = useCallback(
    (index: number) => {
      const updatedPlanData = produce(planData, (draft) => {
        draft.workGroup.splice(index, 1);
      });

      updateLocalPlanData(updatedPlanData);
    },
    [updateLocalPlanData, planData],
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    ...tableProps
  } = useTable(
    {
      columns,
      data: reducedMembers,
      defaultColumn,
      updateMyData,
    } as any,
    useGlobalFilter,
    useSortBy,
  );

  const { setGlobalFilter, state }: any = tableProps;

  const handleOpenAddToGroupModal = useCallback(() => {
    setShowAddToGroupModal(true);
  }, []);

  return (
    <>
      <Container>
        <span>
          O <strong>grupo de trabalho</strong> consiste nas pessoas envolvidas
          na elaboração deste Plano de Contingência
        </span>

        <main>
          <Button onClick={handleOpenAddToGroupModal}>ADICIONAR MEMBRO</Button>
          <MembersContainer>
            <GlobalFilter
              setGlobalFilter={setGlobalFilter}
              globalFilter={state.globalFilter}
            />
            <table {...getTableProps()}>
              <thead>
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column: any, index) => (
                      <th
                        {...column.getHeaderProps(
                          index > 0 && column.getSortByToggleProps(),
                        )}
                      >
                        {column.render("Header")}

                        {index > 0 &&
                          (column.isSorted ? (
                            column.isSortedDesc ? (
                              <FaSortDown style={{ top: 6 }} />
                            ) : (
                              <FaSortUp style={{ top: 10 }} />
                            )
                          ) : (
                            <FaSort style={{ top: 8 }} />
                          ))}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {rows.map((row) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map((cell) => {
                        const originalRow = cell.row.original as any;

                        return (
                          <td {...cell.getCellProps()}>
                            {cell.column.id === "index" && (
                              <button
                                className="removeRowButton"
                                onClick={() => handleRemoveRow(row.index)}
                              >
                                <FiX color="red" />
                              </button>
                            )}
                            {cell.render("Cell")}
                            {cell.column.id === "name" && (
                              <span
                                style={{
                                  backgroundColor:
                                    originalRow.status === 1
                                      ? "#1059C4"
                                      : "#ff0000",
                                }}
                              ></span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </MembersContainer>
        </main>
      </Container>

      <AddToGroupModal
        show={showAddToGroupModal}
        setShow={setShowAddToGroupModal}
      />
    </>
  );
};

export default StepTwo;

const GlobalFilter: React.FC<GlobalFilterProps> = ({
  globalFilter,
  setGlobalFilter,
}) => {
  const [value, setValue] = React.useState(globalFilter);
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 250);

  return (
    <Input
      value={value || ""}
      borderBottomOnly
      rightIcon={<GrSearch />}
      labelOnInput="Pesquisar:"
      onChange={(e) => {
        setValue(e.target.value);
        onChange(e.target.value);
      }}
      containerClass="memberFilter"
    />
  );
};

const EditableCell = ({
  value: initialValue,
  row: { index },
  column: { id },
  updateMyData, // This is a custom function that we supplied to our table instance
}: any) => {
  // We need to keep and update the state of the cell normally
  const [value, setValue] = React.useState(initialValue);

  const inputRef = useRef<HTMLInputElement>(null);

  const onChange = useCallback((e: any) => {
    setValue(e.target.value);
  }, []);

  const handleClickEdit = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // We'll only update the external data when the input is blurred
  const onBlur = useCallback(() => {
    updateMyData(index, id, value);
  }, [updateMyData, index, id, value]);

  // If the initialValue is changed external, sync it up with our state
  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  if (id !== "role") {
    return value;
  }

  return (
    <RoleCell>
      <input ref={inputRef} value={value} onChange={onChange} onBlur={onBlur} />

      <button onClick={handleClickEdit}>
        <FiEdit size={13} color="#3d3d3d" />
      </button>
    </RoleCell>
  );
};
