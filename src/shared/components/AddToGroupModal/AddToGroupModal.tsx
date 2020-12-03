import React, { useCallback, useEffect, useState } from "react";

import { useAsyncDebounce } from "react-table";

import { Button } from "react-bootstrap";
import { GrSearch } from "react-icons/gr";
import Input from "shared/components/Input/Input";

import addMemberImg from "assets/images/addMemberImg.png";

import { Modal, Container } from "./styles";
import AddUserModal from "../AddUserModal/AddUserModal";
import { usePlanData } from "context/PlanData/planDataContext";
import { Person } from "types/Plan";
import ModalCloseButton from "../ModalCloseButton/ModalCloseButton";

interface Props {
  show: boolean;
  setShow: (...data: any) => any;
}

const AddToGroupModal: React.FC<Props> = ({ show, setShow }) => {
  const { notIncludedPersons, addUserToWorkGroup } = usePlanData();

  const [searchText, setSearchText] = useState("");
  const [debounceSearchText, setDebounceSearchText] = useState("");

  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const [currentView, setCurrentView] = useState<
    "searchFound" | "notFound" | "none"
  >("none");

  const [foundPerson, setFoundPerson] = useState<Person | undefined>(undefined);

  const [role, setRole] = useState("");
  const [permission, setPermission] = useState("editor");

  const handleOpenAddUserModal = useCallback(() => {
    setShowAddUserModal(true);
  }, [setShowAddUserModal]);

  const handleSearch = useCallback(() => {}, []);

  const handleAddToGroup = useCallback(() => {
    if (foundPerson) {
      addUserToWorkGroup({ ...foundPerson, permission, anotherRole: role });
      setRole("");
      setPermission("editor");
      setShow(false);
    }
  }, [setShow, foundPerson, addUserToWorkGroup, permission, role]);

  const onDebounceTextChange = useAsyncDebounce((value) => {
    setDebounceSearchText(value || "");
  }, 250);

  const handleSearchTextChange = useCallback(
    (e) => {
      const { value } = e.target;
      setSearchText(value);
      onDebounceTextChange(value);
    },
    [onDebounceTextChange],
  );

  useEffect(() => {
    if (debounceSearchText) {
      const person = notIncludedPersons.find((personItem) => {
        const emailCondition = personItem.emails.some((email) =>
          email.includes(debounceSearchText),
        );

        const phoneCondition = personItem.phones.some((phoneItem) => {
          const phoneString = phoneItem.phone
            .replace("-", "")
            .replace(" ", "")
            .replace("(", "")
            .replace(")", "");

          return phoneString.includes(debounceSearchText);
        });

        return emailCondition || phoneCondition;
      });

      if (person) {
        setCurrentView("searchFound");
      } //
      else {
        setCurrentView("notFound");
      }

      setFoundPerson(person);
    } //
    else {
      setCurrentView("none");
    }
  }, [debounceSearchText, notIncludedPersons]);

  return (
    <>
      <Modal
        backdropClassName="addToGroupModalWrapper"
        centered
        show={show}
        onHide={() => setShow(false)}
      >
        <ModalCloseButton setShow={setShow} />
        <Container>
          <h6>ADICIONAR MEMBRO AO GRUPO DE TRABALHO</h6>
          <img src={addMemberImg} alt="Membros" />

          <Input
            labelOnInput={"Pesquisar: "}
            placeholder="Digite o Email ou o número do telefone"
            borderBottomOnly
            rightIcon={<GrSearch />}
            value={searchText}
            onChange={handleSearchTextChange}
            onRightIconClick={handleSearch}
          />

          {currentView === "none" && (
            <Button
              className="darkBlueButton"
              onClick={handleOpenAddUserModal}
              size="sm"
              style={{ marginTop: 16 }}
            >
              Adicionar novo usuário
            </Button>
          )}

          {currentView === "notFound" && (
            <div className="userNotFoundContainer">
              <small>
                Não existe nenhum um usuário cadastrado com esse email ou
                telefone.
              </small>
              <div>
                <Button
                  className="darkBlueButton"
                  onClick={handleOpenAddUserModal}
                  size="sm"
                >
                  Adicionar novo usuário
                </Button>
                <Button
                  className="darkBlueButton"
                  onClick={handleSearch}
                  size="sm"
                >
                  Pesquisar novamente
                </Button>
              </div>
            </div>
          )}
          {currentView === "searchFound" && (
            <div className="userFoundContainer">
              <small>
                Usuário encontrado com sucesso. Por favor, defina sua função e
                permisão de acesso.
              </small>

              <Input
                containerClass="foundUserInput"
                labelOnInput={"Nome: "}
                borderBottomOnly
                value={foundPerson ? foundPerson.name : ""}
              />
              <div className="inputRowGroup">
                <Input
                  containerClass="foundUserInput"
                  labelOnInput={"Função: "}
                  borderBottomOnly
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
                <Input
                  containerClass="foundUserInput"
                  labelOnInput={"Permissão: "}
                  borderBottomOnly
                  as="select"
                  onChange={(e) => setPermission(e.target.value)}
                >
                  <option value="editor">Editor</option>
                  <option value="visualizar">Visualizar</option>
                  <option value="nenhuma">Nenhuma</option>
                </Input>
              </div>
              <Button
                className="darkBlueButton"
                onClick={handleAddToGroup}
                size="sm"
              >
                Adicionar
              </Button>
            </div>
          )}
        </Container>
      </Modal>
      <AddUserModal
        show={showAddUserModal}
        setShow={setShowAddUserModal}
        setShowAddToGroupModal={setShow}
      />
    </>
  );
};

export default AddToGroupModal;
