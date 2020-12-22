import React, { useCallback, useMemo, useState, useRef } from "react";

import * as yup from "yup";

import { Button, Form } from "react-bootstrap";
import { GrSearch } from "react-icons/gr";
import Input from "shared/components/Input/Input";

import addMemberImg from "assets/images/addMemberImg.png";

import { Modal, Container } from "./styles";
import AddUserModal from "../AddUserModal/AddUserModal";
import { usePlanData } from "context/PlanData/planDataContext";
import { Person } from "types/Plan";
import ModalCloseButton from "../ModalCloseButton/ModalCloseButton";
import {
  numberStringToPhoneNumber,
  phoneNumberToNumberString,
} from "shared/utils/format/formatPhoneNumber";

interface Props {
  show: boolean;
  setShow: (...data: any) => any;
}

const emailSchema = yup.object().shape({
  searchText: yup.string().required().email(),
});

const phoneSchema = yup.object().shape({
  searchText: yup.string().required().matches(new RegExp("[0-9]{10}")),
});

const AddToGroupModal: React.FC<Props> = ({ show, setShow }) => {
  const { notIncludedPersons, addUserToWorkGroup } = usePlanData();

  const formRef = useRef<HTMLFormElement>(null);

  const [searchText, setSearchText] = useState("");

  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const [currentView, setCurrentView] = useState<
    "searchFound" | "notFound" | "none"
  >("none");

  const [foundPerson, setFoundPerson] = useState<Person | undefined>(undefined);

  const [role, setRole] = useState("");
  const [permission, setPermission] = useState("nenhuma");

  const [validatedSearch, setValidatedSearch] = useState(false);

  const inputType = useMemo(() => {
    const text = phoneNumberToNumberString(searchText);

    if (/[0-9]{4}/.test(text)) {
      return "phoneInput";
    }

    setSearchText(text.split("_").join(""));

    return "emailInput";
  }, [searchText]);

  const handleOpenAddUserModal = useCallback(() => {
    setShowAddUserModal(true);
  }, [setShowAddUserModal]);

  const handleAddToGroup = useCallback(async () => {
    if (foundPerson) {
      await addUserToWorkGroup({
        ...foundPerson,
        permission,
        anotherRole: role,
      });
      setRole("");
      setPermission("nenhuma");
      setShow(false);
    }
  }, [setShow, foundPerson, addUserToWorkGroup, permission, role]);

  const handleSearchTextChange = useCallback((e) => {
    const { value } = e.target;
    setSearchText(value);
  }, []);

  const handleSearchPerson = useCallback(() => {
    const person = notIncludedPersons.find((personItem) => {
      const emailCondition = personItem.emails.some((email) =>
        email.includes(searchText),
      );

      const phoneCondition = personItem.phones.some(
        (phoneItem) => phoneItem.phone === searchText,
      );

      return emailCondition || phoneCondition;
    });

    if (person) {
      setCurrentView("searchFound");
    } //
    else {
      setCurrentView("notFound");
    }

    setFoundPerson(person);
  }, [searchText, notIncludedPersons]);

  const handleSubmit = useCallback(
    async (event) => {
      const form = event.currentTarget;

      event.preventDefault();

      let isEmailValid = false;
      let isPhoneValid = false;

      try {
        const emailValidation = await emailSchema.validate({ searchText });
        isEmailValid = !!emailValidation;
      } catch (error) {}

      try {
        if (!isEmailValid) {
          const phoneValidation = await phoneSchema.validate({
            searchText: phoneNumberToNumberString(searchText),
          });
          isPhoneValid = !!phoneValidation;

          if (isPhoneValid) {
            const numberString = phoneNumberToNumberString(searchText);
            setSearchText(numberStringToPhoneNumber(numberString));
          }
        }
      } catch (error) {}

      if (form.checkValidity() === false || (!isEmailValid && !isPhoneValid)) {
        event.stopPropagation();
      } //
      else {
        setValidatedSearch(false);
        await handleSearchPerson();

        return;
      }

      setCurrentView("none");
      setValidatedSearch(true);
    },
    [handleSearchPerson, searchText],
  );

  const triggerSubmit = useCallback(() => {
    formRef.current?.dispatchEvent(new Event("submit"));
  }, []);

  const onExit = useCallback(() => {
    setShow(false);
    setValidatedSearch(false);
  }, [setShow, setValidatedSearch]);

  return (
    <>
      <Modal
        backdropClassName="addToGroupModalWrapper"
        centered
        show={show}
        onHide={onExit}
      >
        <ModalCloseButton setShow={onExit} />
        <Container>
          <h6>ADICIONAR MEMBRO AO GRUPO DE TRABALHO</h6>
          <img src={addMemberImg} alt="Membros" />

          <Form noValidate onSubmit={handleSubmit} validated={validatedSearch}>
            {inputType === "emailInput" ? (
              <Input
                labelOnInput={"Pesquisar: "}
                placeholder="Digite o Email ou o número do telefone"
                borderBottomOnly
                rightIcon={<GrSearch />}
                value={searchText}
                onChange={handleSearchTextChange}
                onRightIconClick={triggerSubmit}
                required
                isValidated={validatedSearch}
                key={1}
              />
            ) : (
              <Input
                labelOnInput={"Pesquisar: "}
                placeholder="Digite o Email ou o número do telefone"
                borderBottomOnly
                rightIcon={<GrSearch />}
                value={searchText}
                onChange={handleSearchTextChange}
                onRightIconClick={triggerSubmit}
                required
                isValidated={validatedSearch}
                key={2}
                masked
                maskProps={{ mask: "(99) 99999-9999" }}
              />
            )}

            {validatedSearch && (
              <span className="invalidSearchText">
                Por favor, insira um e-mail ou telefone válido.
              </span>
            )}
          </Form>

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
                  onClick={triggerSubmit}
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
                  value={permission}
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
