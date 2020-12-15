import React, { useCallback, useEffect, useState } from "react";

import { useAsyncDebounce } from "react-table";

import { Button } from "react-bootstrap";
import { GrSearch } from "react-icons/gr";
import Input from "shared/components/Input/Input";

import addMemberImg from "assets/images/addMemberImg.png";

import { Modal, Container } from "./styles";
import { usePlanData } from "context/PlanData/planDataContext";
import { Resource, Responsible } from "types/Plan";
import ModalCloseButton from "../ModalCloseButton/ModalCloseButton";
import api from "api/config";
import { Pessoa } from "types/ModelsAPI";

interface Props {
  show: boolean;
  setShow: (...data: any) => any;
}

const PeopleResourceModal: React.FC<Props> = ({ show, setShow }) => {
  const { getSequenceId, addResource } = usePlanData();

  const [searchText, setSearchText] = useState("");
  const [debounceSearchText, setDebounceSearchText] = useState("");

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

  const handleSearch = useCallback(() => {}, []);

  const handleAddPeopleResource = useCallback(async () => {
    if (responsible) {
      const newResponsible: Responsible = { ...responsible, permission, role };

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

  const onDebounceTextChange = useAsyncDebounce((value) => {
    setDebounceSearchText(value || "");
  }, 350);

  const handleSearchTextChange = useCallback(
    (e) => {
      const { value } = e.target;
      setSearchText(value);
      onDebounceTextChange(value);
    },
    [onDebounceTextChange],
  );

  // Filtrar listagem de pessoas
  useEffect(() => {
    async function searchPerson() {
      const isEmailValid =
        debounceSearchText.includes("@") && debounceSearchText.includes(".");

      const isPhoneValid =
        /^[0-9]+$/.test(debounceSearchText) && debounceSearchText.length >= 8;

      if (debounceSearchText && (isEmailValid || isPhoneValid)) {
        try {
          const response = await api.post("pessoas/find", debounceSearchText, {
            headers: {
              "Content-Type": "text/plain",
            },
          });

          if (response.data && response.data.length) {
            const id = await getSequenceId("membros");

            let mainPhone = "";

            const person = response.data[0] as Pessoa;

            if (person.telefones && person.telefones.length) {
              const phone = person.telefones.find(
                (item) => item.prioridade === 1,
              );

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
              id,
              phone: mainPhone,
            });
          } //
          else {
            setCurrentView("notFound");
          }
        } catch (error) {
          setCurrentView("notFound");
        }
      } //
      else {
        setCurrentView("none");
      }
    }

    searchPerson();
  }, [debounceSearchText, getSequenceId]);

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
          <h6>ADICIONAR RECURSO PESSOAL</h6>
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
            <>
              {/* <Button
                className="darkBlueButton"
                size="sm"
                style={{ marginTop: 16 }}
              >
                Adicionar novo usuário
              </Button> */}
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
    </>
  );
};

export default PeopleResourceModal;
