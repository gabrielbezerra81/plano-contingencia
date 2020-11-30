import React, { useState, useMemo, useCallback } from "react";
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

import { Container, MembersContainer } from "./styles";
import AddToGroupModal from "../../shared/components/AddToGroupModal/AddToGroupModal";
import { usePlanData } from "context/PlanData/planDataContext";
import { Member } from "types/Plan";

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
  const { planData } = usePlanData();

  const members: ReducedMember[] = useMemo(() => {
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
      data: members,
    },
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
                        return (
                          <td {...cell.getCellProps()}>
                            {cell.render("Cell")}
                            {cell.column.id === "name" && (
                              <span
                                style={{
                                  backgroundColor:
                                    cell.row.original.status === 1
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
