import React, { useState, useCallback, useMemo } from "react";
import { GrSearch } from "react-icons/gr";
import { Button } from "react-bootstrap";
import {
  useTable,
  useSortBy,
  useRowSelect,
  useAsyncDebounce,
  useGlobalFilter,
} from "react-table";

import { Modal, Container, MembersContainer } from "./styles";
import Input from "shared/components/Input/Input";

import peopleIcon from "assets/images/pessoas.png";

import { FaSortDown, FaSortUp, FaSort } from "react-icons/fa";
import AddToGroupModal from "shared/components/AddToGroupModal/AddToGroupModal";
import { Member } from "types/Plan";
import ModalCloseButton from "shared/components/ModalCloseButton/ModalCloseButton";
import { usePlanData } from "context/PlanData/planDataContext";
import { useScenario } from "context/PlanData/scenarioContext";
import formatResourceAddress from "shared/utils/format/formatResourceAddress";

type ReducedMember = Omit<Member, "group" | "permission" | "personId">;

interface Props {
  show: boolean;
  setShow: (...data: any) => any;
}

interface TableColumn {
  Header: string;
  accessor: keyof ReducedMember;
}

interface GlobalFilterProps {
  setGlobalFilter: (filterValue: string) => void;
  globalFilter: string;
}

const ResponsibleModal: React.FC<Props> = ({ show, setShow }) => {
  const { planData } = usePlanData();

  const { verifyIfPreviousScenariosHasValue } = useScenario();

  const [members] = useState<ReducedMember[]>([
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

  const handleOpenAddToGroupModal = useCallback(() => {
    setShowAddToGroupModal(true);
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
    useGlobalFilter,
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
    // selectedFlatRows,
    state: { globalFilter }, //selectedRowIds
    setGlobalFilter,
  }: any = tableProps;

  return (
    <>
      <Modal centered show={show} onHide={() => setShow(false)}>
        <ModalCloseButton setShow={setShow} />
        <Container>
          <header>
            <button onClick={handleOpenAddToGroupModal}>
              <img src={peopleIcon} alt="PESSOAL" />
              <span>PESSOAL</span>
            </button>
          </header>
          <div>
            <Button onClick={handleOpenAddToGroupModal}>
              ADICIONAR MEMBRO
            </Button>
            <MembersContainer>
              <GlobalFilter
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
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
      />
    </>
  );
};

export default ResponsibleModal;

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
