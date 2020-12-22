import React, { useCallback, useState, useRef, useMemo } from "react";

import * as yup from "yup";

import { Button, Form } from "react-bootstrap";
import { GrSearch } from "react-icons/gr";
import Input from "shared/components/Input/Input";

import addMemberImg from "assets/images/addMemberImg.png";

import { Modal, Container } from "./styles";
import { usePlanData } from "context/PlanData/planDataContext";
import { Resource, Responsible } from "types/Plan";
import ModalCloseButton from "../ModalCloseButton/ModalCloseButton";
import api from "api/config";
import { Pessoa } from "types/ModelsAPI";
import {
  numberStringToPhoneNumber,
  phoneNumberToNumberString,
} from "shared/utils/format/formatPhoneNumber";
import AddUserModal from "../AddUserModal/AddUserModal";

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

const PeopleResourceModal: React.FC<Props> = ({ show, setShow }) => {
  const { getSequenceId, addResource } = usePlanData();

  const [searchText, setSearchText] = useState("");

  const formRef = useRef<HTMLFormElement>(null);

  const [currentView, setCurrentView] = useState<
    "searchFound" | "notFound" | "none"
  >("none");

  const [responsible, setResponsible] = useState<Responsible | undefined>(
    undefined,
  );

  const [role, setRole] = useState("");
  const [permission, setPermission] = useState<
    "editor" | "visualizar" | "nenhuma"
  >("nenhuma");

  const [validatedSearch, setValidatedSearch] = useState(false);

  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const inputType = useMemo(() => {
    const text = phoneNumberToNumberString(searchText);

    if (/[0-9]{4}/.test(text)) {
      return "phoneInput";
    }

    setSearchText(text.split("_").join(""));

    return "emailInput";
  }, [searchText]);

  const handleSearch = useCallback(() => {}, []);

  const handleAddPeopleResource = useCallback(async () => {
    if (responsible) {
      const memberId = await getSequenceId("membros");

      const newResponsible: Responsible = {
        ...responsible,
        permission,
        role,
        id: memberId,
      };

      const id = await getSequenceId("recursos");

      const resource: Resource = {
        id,
        responsibles: [newResponsible],
        type: "pessoa",
      };

      await addResource(resource);

      setShow(false);
    }
  }, [setShow, responsible, permission, role, getSequenceId, addResource]);

  const handleSearchTextChange = useCallback((e) => {
    const { value } = e.target;
    setSearchText(value);
  }, []);

  const handleSearchPerson = useCallback(async () => {
    try {
      const response = await api.post("pessoas/find", searchText, {
        headers: {
          "Content-Type": "text/plain",
        },
      });

      if (response.data && response.data.length) {
        let mainPhone = "";

        const person = response.data[0] as Pessoa;

        if (person.telefones && person.telefones.length) {
          const phone = person.telefones.find((item) => item.prioridade === 1);

          if (phone) {
            mainPhone = phone.ddd_numero;
          } //
          else {
            mainPhone = person.telefones[0].ddd_numero;
          }
        }

        setCurrentView("searchFound");
        setResponsible({
          name: person.nome,
          personId: person.id || "",
          permission: "nenhuma",
          role: "",
          status: 0,
          id: "",
          phone: mainPhone,
        });
      } //
      else {
        setCurrentView("notFound");
      }
    } catch (error) {
      setCurrentView("notFound");
    }
  }, [searchText]);

  const triggerSubmit = useCallback(() => {
    formRef.current?.dispatchEvent(new Event("submit"));
  }, []);

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
          <h6>ADICIONAR RECURSO PESSOAL</h6>
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
            <>
              <Button
                className="darkBlueButton"
                size="sm"
                style={{ marginTop: 16 }}
                onClick={() => setShowAddUserModal(true)}
              >
                Adicionar novo usuário
              </Button>
            </>
          )}

          {currentView === "notFound" && (
            <div className="userNotFoundContainer">
              <small>
                Não existe nenhum um usuário cadastrado com esse email ou
                telefone.
              </small>
              <div>
                <Button className="darkBlueButton" size="sm">
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
                value={responsible ? responsible.name : ""}
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
                  onChange={(e) => setPermission(e.target.value as any)}
                  value={permission}
                >
                  <option value="editor">Editor</option>
                  <option value="visualizar">Visualizar</option>
                  <option value="nenhuma">Nenhuma</option>
                </Input>
              </div>
              <Button
                className="darkBlueButton"
                onClick={handleAddPeopleResource}
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
        addPersonOnly
      />
    </>
  );
};

export default PeopleResourceModal;
