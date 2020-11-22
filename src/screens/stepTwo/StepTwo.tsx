import React, { useState, useMemo } from "react";
import { Button, Table } from "react-bootstrap";

import { useTable, useSortBy } from "react-table";

import { GrSearch } from "react-icons/gr";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

import Input from "shared/components/Input/Input";

import { Container, MembersContainer } from "./styles";

interface Member {
  id: number;
  name: string;
  status: number;
  role: string;
  phone: string;
}

interface TableColumn {
  Header: string;
  accessor: keyof Member;
}

const StepTwo = () => {
  const [searchText, setSearchText] = useState("");

  const [members, setMembers] = useState<Member[]>([
    {
      id: 1,
      name: "Francisco da Cunha",
      role: "Secretário do Meio Ambiente",
      phone: "(62) 91000-3210",
      status: 0,
    },
    {
      id: 2,
      name: "Sandro Melos",
      role: "Secretário Administrativo",
      phone: "(61) 81893-0293",
      status: 1,
    },
  ]);

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

  return (
    <Container>
      <span>
        O <strong>grupo de trabalho</strong> consiste nas pessoas envolvidas na
        elaboração deste Plano de Contingência
      </span>

      <main>
        <Button>ADICIONAR MEMBRO</Button>
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
  );
};

export default StepTwo;
