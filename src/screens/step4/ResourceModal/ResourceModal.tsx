import React, { useState, useCallback, useMemo } from "react";
import { GrSearch } from "react-icons/gr";
import { Button } from "react-bootstrap";
import { useTable, useSortBy, useRowSelect } from "react-table";

import { Modal, Container, MembersContainer } from "./styles";
import Input from "shared/components/Input/Input";

import peopleIcon from "assets/images/pessoas.png";
import vehiclesIcon from "assets/images/veiculos.png";
import materialsIcon from "assets/images/materiais.png";
import foodIcon from "assets/images/alimentacao.png";
import homeIcon from "assets/images/abrigo.png";
import moneyIcon from "assets/images/dinheiro.png";
import { FaSortDown, FaSortUp, FaSort } from "react-icons/fa";
import AddToGroupModal from "shared/components/AddToGroupModal/AddToGroupModal";
import AddUserModal from "shared/components/AddUserModal/AddUserModal";
import AddVehicleMachineModal from "shared/components/AddVehicleMachineModal/AddVehicleMachineModal";
import { Member } from "types/Plan";

type ReducedMember = Omit<Member, "group" | "permission" | "personId">;

interface Props {
  show: boolean;
  setShow: (...data: any) => any;
}

interface TableColumn {
  Header: string;
  accessor: keyof ReducedMember;
}

const ResourceModal: React.FC<Props> = ({ show, setShow }) => {
  const [searchText, setSearchText] = useState("");

  const [members, setMembers] = useState<ReducedMember[]>([
    {
      id: "1",
      name: "Francisco da Cunha",
      role: "Secretário do Meio Ambiente",
      phone: "(62) 91000-3210",
      status: 0,
    },
    {
      id: "2",
      name: "Sandro Melos",
      role: "Secretário Administrativo",
      phone: "(61) 81893-0293",
      status: 1,
    },
  ]);

  const [showAddToGroupModal, setShowAddToGroupModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);

  const handleOpenAddToGroupModal = useCallback(() => {
    setShowAddToGroupModal(true);
  }, []);

  const handleOpenVehicleModal = useCallback(() => {
    setShowVehicleModal(true);
  }, []);

  const handleInclude = useCallback(() => {}, []);

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
    ...tableProps
  } = useTable(
    {
      columns,
      data: members,
    },
    useSortBy,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        {
          id: "selection",
          Header: ({ getToggleAllRowsSelectedProps }: any) => (
            <div>
              <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
            </div>
          ),
          Cell: ({ row }: any) => (
            <div>
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            </div>
          ),
        },
        ...columns,
      ]);
    },
  );

  const {
    selectedFlatRows,
    state: { selectedRowIds },
  }: any = tableProps;

  return (
    <>
      <Modal centered show={show} onHide={() => setShow(false)}>
        <Container>
          <header>
            <button>
              <img src={peopleIcon} alt="PESSOAL" />
              <span>PESSOAL</span>
            </button>

            <button onClick={handleOpenVehicleModal}>
              <img src={vehiclesIcon} alt="VEÍCULOS E MAQUINÁRIOS" />
              <span>VEÍCULOS E MAQUINÁRIOS</span>
            </button>

            <button>
              <img src={materialsIcon} alt="MATERIAIS" />
              <span>MATERIAIS</span>
            </button>

            <button>
              <img src={foodIcon} alt="ALIMENTAÇÃO" />
              <span>ALIMENTAÇÃO</span>
            </button>

            <button>
              <img src={homeIcon} alt="ABRIGO" />
              <span>ABRIGO</span>
            </button>

            <button>
              <img src={moneyIcon} alt="DINHEIRO" />
              <span>DINHEIRO</span>
            </button>
          </header>
          <div>
            <Button onClick={handleOpenAddToGroupModal}>
              ADICIONAR MEMBRO
            </Button>
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

                          {index > 1 &&
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
          </div>
          <Button onClick={handleInclude} className="darkBlueButton">
            Incluir
          </Button>
        </Container>
      </Modal>

      <AddToGroupModal
        show={showAddToGroupModal}
        setShow={setShowAddToGroupModal}
        setShowAddUserModal={setShowAddUserModal}
      />

      <AddUserModal show={showAddUserModal} setShow={setShowAddUserModal} />
      <AddVehicleMachineModal
        show={showVehicleModal}
        setShow={setShowVehicleModal}
      />
    </>
  );
};

export default ResourceModal;

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }: any, ref) => {
    const defaultRef = React.useRef<any>();
    const resolvedRef: any = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <>
        <input type="checkbox" ref={resolvedRef} {...rest} />
      </>
    );
  },
);
