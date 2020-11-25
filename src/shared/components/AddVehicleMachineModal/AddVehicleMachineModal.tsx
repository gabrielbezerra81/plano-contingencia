import produce from "immer";
import React, { useState, useCallback } from "react";
import { Button } from "react-bootstrap";
import AttributeListing from "../AttributeListing/AttributeListing";
import Input from "../Input/Input";

import { Modal, Container } from "./styles";

interface Props {
  show: boolean;
  setShow: (...data: any) => any;
}

const AddVehicleMachineModal: React.FC<Props> = ({ show, setShow }) => {
  const [responsibles, setResponsible] = useState<string[]>([
    "Alex Barros",
    "Sandro Brito",
  ]);

  const handleRemoveResponsible = useCallback((_, index: number) => {
    setResponsible((oldList) => {
      const updatedResponsibles = produce(oldList, (draft) => {
        draft.splice(index, 1);
      });

      return updatedResponsibles;
    });
  }, []);

  const handleInclude = useCallback(() => {
    setShow(false);
  }, [setShow]);

  return (
    <Modal
      backdropClassName="addVehicleModalWrapper"
      centered
      show={show}
      onHide={() => setShow(false)}
    >
      <Container>
        <div className="borderedContainer">
          <h6>ADICIONAR VEICULO OU MAQUINÁRIO</h6>

          <div>
            <Input borderBottomOnly labelOnInput="Tipo/Modelo: " size="small" />
            <Input
              borderBottomOnly
              labelOnInput="Descrição/Características: "
              size="small"
            />
            <Input borderBottomOnly labelOnInput="Quantidade: " size="small" />
            <Input
              borderBottomOnly
              labelOnInput="Contato/Responsável: "
              size="small"
              placeholder="Digite o Email ou o número do telefone"
            />
          </div>

          <div>
            <AttributeListing
              items={responsibles}
              title="Responsáveis cadastrados"
              size="small"
              name="responsibles"
              onRemove={handleRemoveResponsible}
              renderText={(responsible) => responsible}
            />
          </div>
        </div>

        <Button onClick={handleInclude} className="darkBlueButton">
          Incluir
        </Button>
      </Container>
    </Modal>
  );
};

export default AddVehicleMachineModal;
