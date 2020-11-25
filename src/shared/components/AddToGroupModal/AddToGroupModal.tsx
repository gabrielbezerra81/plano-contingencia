import React, { useCallback } from "react";

import { Button } from "react-bootstrap";
import { GrSearch } from "react-icons/gr";
import Input from "shared/components/Input/Input";

import addMemberImg from "assets/images/addMemberImg.png";

import { Modal, Container } from "./styles";

interface Props {
  show: boolean;
  setShow: (...data: any) => any;
  setShowAddUserModal: (...data: any) => any;
}

const AddToGroupModal: React.FC<Props> = ({
  show,
  setShow,
  setShowAddUserModal,
}) => {
  const handleOpenAddUserModal = useCallback(() => {
    setShowAddUserModal(true);
  }, [setShowAddUserModal]);

  const handleSearchAgain = useCallback(() => {}, []);

  const handleAddToGroup = useCallback(() => {
    setShow(false);
  }, [setShow]);

  return (
    <Modal backdropClassName="addToGroupModalWrapper" centered show={show} onHide={() => setShow(false)}>
      <Container>
        <h6>ADICIONAR MEMBRO AO GRUPO DE TRABALHO</h6>
        <img src={addMemberImg} alt="Membros" />

        <Input
          labelOnInput={"Pesquisar: "}
          placeholder="Digite o Email ou o número do telefone"
          borderBottomOnly
          rightIcon={<GrSearch />}
        />

        <div className="userNotFoundContainer">
          <small>
            Não existe nenhum um usuário cadastrado com esse email ou telefone.
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
              onClick={handleSearchAgain}
              size="sm"
            >
              Pesquisar novamente
            </Button>
          </div>
        </div>

        <div className="userFoundContainer">
          <small>
            Usuário encontrado com sucesso. Por favor, defina sua função e
            permisão de acesso.
          </small>

          <Input
            containerClass="foundUserInput"
            labelOnInput={"Nome: "}
            borderBottomOnly
          />
          <div className="inputRowGroup">
            <Input
              containerClass="foundUserInput"
              labelOnInput={"Função: "}
              borderBottomOnly
            />
            <Input
              containerClass="foundUserInput"
              labelOnInput={"Permissão: "}
              borderBottomOnly
              as="select"
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
      </Container>
    </Modal>
  );
};

export default AddToGroupModal;
