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
import { Member, Responsible } from "types/Plan";
import ModalCloseButton from "shared/components/ModalCloseButton/ModalCloseButton";
import { usePlanData } from "context/PlanData/planDataContext";
import { useScenario } from "context/Scenario/scenarioContext";
import PeopleResourceModal from "shared/components/PeopleResourceModal/PeopleResourceModal";

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

  const {
    verifyIfScenariosHistoryHasValue,
    handleAddValueToScenario,
  } = useScenario();

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
      const checked = verifyIfScenariosHistoryHasValue(
        "responsibles",
        `${responsible.name} ${responsible.role} ${responsible.permission}`,
      );

      return { ...responsible, checked };
    });
  }, [planData.resources, verifyIfScenariosHistoryHasValue]);

  const responsibles = useMemo(() => {
    const resp: ReducedMember[] = [];

    formattedResponsibles.forEach((item) => {
      resp.push({
        id: item.id,
        name: item.name,
        role: item.role,
        phone: item.phone,
        status: item.status,
      });
    });

    return resp;
  }, [formattedResponsibles]);

  const [showPeopleResourceModal, setShowPeopleResourceModal] = useState(false);

  const handleOpenPeopleResourceModal = useCallback(() => {
    setShowPeopleResourceModal(true);
  }, []);

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
      data: responsibles,
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
    selectedFlatRows,
    state: { globalFilter },
    setGlobalFilter,
  }: any = tableProps;

  const selectedValues: any[] = useMemo(
    () => selectedFlatRows.map((item: any) => item.original),
    [selectedFlatRows],
  );

  const handleIncludeValuesInScenario = useCallback(() => {
    if (!selectedValues.length) {
      alert("Selecione um responsável da tabela!");
    }

    handleAddValueToScenario({ attr: "responsibles", value: selectedValues });
    setShow(false);
  }, [selectedValues, handleAddValueToScenario, setShow]);

  return (
    <>
      <Modal centered show={show} onHide={() => setShow(false)}>
        <ModalCloseButton setShow={setShow} />
        <Container>
          <header>
            <button onClick={handleOpenPeopleResourceModal}>
              <img src={peopleIcon} alt="PESSOAL" />
              <span>PESSOAL</span>
            </button>
          </header>
          <div>
            <Button onClick={handleOpenPeopleResourceModal}>
              ADICIONAR RESPONSÁVEL
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
          <Button
            onClick={handleIncludeValuesInScenario}
            className="darkBlueButton"
          >
            Incluir
          </Button>
        </Container>
      </Modal>

      <PeopleResourceModal
        show={showPeopleResourceModal}
        setShow={setShowPeopleResourceModal}
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
