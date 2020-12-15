import React, { useState, useCallback } from "react";

import { Modal, Container } from "./styles";

import vehiclesIcon from "assets/images/veiculos.png";
import materialsIcon from "assets/images/materiais.png";
import foodIcon from "assets/images/alimentacao.png";
import homeIcon from "assets/images/abrigo.png";
import moneyIcon from "assets/images/dinheiro.png";
import { ResourceType } from "types/Plan";
import CreateResourceModal from "../CreateResourceModal/CreateResourceModal";
import ModalCloseButton from "../ModalCloseButton/ModalCloseButton";

interface Props {
  show: boolean;
  setShow: (...data: any) => any;
}

const ResourcesModal: React.FC<Props> = ({ show, setShow }) => {
  const [showCreateResourceModal, setShowCreateResourceModal] = useState(false);

  const [resourceType, setResourceType] = useState<ResourceType | null>(null);

  const handleOpenCreateResourceModal = useCallback((e) => {
    setShowCreateResourceModal(true);
    setResourceType(e.currentTarget.name);
  }, []);

  return (
    <>
      <Modal centered show={show} onHide={() => setShow(false)}>
        <ModalCloseButton setShow={setShow} />
        <Container>
          <header>
            <button name="veiculo" onClick={handleOpenCreateResourceModal}>
              <img src={vehiclesIcon} alt="VEÍCULOS E MAQUINÁRIOS" />
              <span>VEÍCULOS E MAQUINÁRIOS</span>
            </button>

            <button name="material" onClick={handleOpenCreateResourceModal}>
              <img src={materialsIcon} alt="MATERIAIS" />
              <span>MATERIAIS</span>
            </button>

            <button name="alimentacao" onClick={handleOpenCreateResourceModal}>
              <img src={foodIcon} alt="ALIMENTAÇÃO" />
              <span>ALIMENTAÇÃO</span>
            </button>

            <button name="abrigo" onClick={handleOpenCreateResourceModal}>
              <img src={homeIcon} alt="ABRIGO" />
              <span>ABRIGO</span>
            </button>

            <button name="dinheiro" onClick={handleOpenCreateResourceModal}>
              <img src={moneyIcon} alt="DINHEIRO" />
              <span>DINHEIRO</span>
            </button>
          </header>
          <div></div>
        </Container>
      </Modal>

      {!!resourceType && (
        <CreateResourceModal
          show={showCreateResourceModal}
          setShow={setShowCreateResourceModal}
          type={resourceType}
        />
      )}
    </>
  );
};

export default ResourcesModal;
