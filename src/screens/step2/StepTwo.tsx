import React, { useState, useMemo, useCallback } from "react";
import { Button } from "react-bootstrap";

import { useTable, useSortBy } from "react-table";
import { GrSearch } from "react-icons/gr";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

import Input from "shared/components/Input/Input";

import { Container, MembersContainer } from "./styles";
import AddUserModal from "../../shared/components/AddUserModal/AddUserModal";
import AddToGroupModal from "../../shared/components/AddToGroupModal/AddToGroupModal";
import { usePlanData } from "context/PlanData/planDataContext";
import { Member } from "types/Plan";

type ReducedMember = Omit<Member, "group" | "permission" | "personId">;

interface TableColumn {
  Header: string;
  accessor: keyof ReducedMember;
}

const StepTwo = () => {
  const { planData } = usePlanData();

  const [searchText, setSearchText] = useState("");

  const members: ReducedMember[] = useMemo(() => {
    return planData.workGroup.map((memberItem) => {
      const member: ReducedMember = {
        id: memberItem.id,
        name: memberItem.name,
        role: memberItem.role,
        status: memberItem.status,
        phone: memberItem.phone,
      };

      return member;
    });
  }, [planData.workGroup]);

  const [showAddToGroupModal, setShowAddToGroupModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const columns: TableColumn[] = useMemo(
    () => [
      {
        Header: "ORD",
        accessor: "id", // accessor is the "key" in the data
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
  } = useTable(
    {
      columns,
      data: members,
    },
    useSortBy,
  );

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
            <Input
              value={searchText}
              borderBottomOnly
              rightIcon={<GrSearch />}
              labelOnInput="Pesquisar:"
              onChange={(e) => setSearchText(e.target.value)}
              containerClass="memberFilter"
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
        setShowAddUserModal={setShowAddUserModal}
      />

      <AddUserModal show={showAddUserModal} setShow={setShowAddUserModal} />
    </>
  );
};

export default StepTwo;
