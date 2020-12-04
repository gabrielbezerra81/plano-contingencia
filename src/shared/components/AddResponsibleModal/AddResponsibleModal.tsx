import React, { useCallback, useState } from "react";

import { Button } from "react-bootstrap";

import Input from "shared/components/Input/Input";
import addMemberImg from "assets/images/addMemberImg.png";

import { Responsible } from "types/Plan";
import ModalCloseButton from "../ModalCloseButton/ModalCloseButton";

import { Modal, Container } from "./styles";

interface Props {
  show: boolean;
  setShow: (...data: any) => any;
  responsible: Responsible;
  setResponsible: React.Dispatch<React.SetStateAction<Responsible | null>>;
  addResponsible: (e: any) => void;
}

const AddResponsibleModal: React.FC<Props> = ({
  show,
  setShow,
  responsible,
  setResponsible,
  addResponsible,
}) => {
  const [role, setRole] = useState("");
  const [permission, setPermission] = useState("editor");

  const handleAddResponsible = useCallback(() => {
    addResponsible({
      target: {
        name: "responsibles",
        value: { ...responsible, role, permission },
      },
    });
    setRole("");
    setPermission("editor");
    setShow(false);
    setResponsible(null);
  }, [setShow, permission, role, setResponsible, addResponsible, responsible]);

  return (
    <Modal
      backdropClassName="addResponsibleModalWrapper"
      centered
      show={show}
      onHide={() => setShow(false)}
    >
      <ModalCloseButton setShow={setShow} />
      <Container>
        <h6>ADICIONAR RESPONSÁVEL AO RECURSO</h6>
        <img src={addMemberImg} alt="Membros" />

        <div className="content">
          <Input
            containerClass="foundUserInput"
            labelOnInput={"Nome: "}
            borderBottomOnly
            disabled
            value={responsible.name}
            size="small"
          />
          <div className="inputRowGroup">
            <Input
              labelOnInput={"Função: "}
              borderBottomOnly
              value={role}
              onChange={(e) => setRole(e.target.value)}
              size="small"
            />
            <Input
              labelOnInput={"Permissão: "}
              borderBottomOnly
              as="select"
              onChange={(e) => setPermission(e.target.value)}
              size="small"
            >
              <option value="editor">Editor</option>
              <option value="visualizar">Visualizar</option>
              <option value="nenhuma">Nenhuma</option>
            </Input>
          </div>
          <Button
            className="darkBlueButton"
            onClick={handleAddResponsible}
            size="sm"
          >
            Adicionar
          </Button>
        </div>
      </Container>
    </Modal>
  );
};

export default AddResponsibleModal;