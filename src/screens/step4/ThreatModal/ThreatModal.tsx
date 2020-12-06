import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import ModalCloseButton from "shared/components/ModalCloseButton/ModalCloseButton";

import cobradesImg from "assets/images/cobrades3.png";

import { Modal, Container } from "./style";
import Input from "shared/components/Input/Input";
import api from "api/config";
import produce from "immer";

interface Props {
  show: boolean;
  setShow: (...data: any) => void;
  checkAddedItem: (attr: string, value: any) => void;
  setAddedCobrades: React.Dispatch<React.SetStateAction<any[]>>;
}

interface Cobrade {
  id: string;
  descricao: string;
  categoria: string;
  grupo: string;
  subgrupo: string;
  tipo: string;
  subtipo: string;
  cobrade: string;
  cor: string;
}

const ThreatModal: React.FC<Props> = ({
  show,
  setShow,
  checkAddedItem,
  setAddedCobrades,
}) => {
  const [cobrades, setCobrades] = useState<Cobrade[]>([]);

  const [selectedCobradeNumber, setSelectedCobradeNumber] = useState("");
  const [description, setDescription] = useState("");

  const handleChangeCobradeNumber = useCallback(
    (e: any) => {
      const cobradeNumber = e.target.value;

      const cobradeItem = cobrades.find(
        (cobradeItem) => cobradeItem.cobrade === cobradeNumber,
      );

      setSelectedCobradeNumber(cobradeNumber);

      if (cobradeItem) {
        setDescription(cobradeItem.descricao);
      }
    },
    [cobrades],
  );

  const handleAddThreat = useCallback(() => {
    setAddedCobrades((oldValues) => {
      const updatedAddedCobrades = produce(oldValues, (draft) => {
        const alreadyAdded = draft.some(
          (cobradeItem) => cobradeItem.cobrade === selectedCobradeNumber,
        );

        if (!alreadyAdded) {
          draft.push({ cobrade: selectedCobradeNumber, description });
        }
      });

      return updatedAddedCobrades;
    });

    checkAddedItem("threat", { cobrade: selectedCobradeNumber, description });
    setShow(false);
  }, [
    checkAddedItem,
    selectedCobradeNumber,
    description,
    setShow,
    setAddedCobrades,
  ]);

  useEffect(() => {
    api
      .get("cobrades")
      .then((response) => {
        if (response.data && response.data.length) {
          handleChangeCobradeNumber({
            target: {
              value: response.data[0].cobrade,
            },
          });
          setCobrades(response.data);
        }
      })
      .catch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal show={show} centered onHide={() => setShow(false)}>
      <ModalCloseButton setShow={setShow} />
      <Container>
        <h6>ADICIONAR AMEAÇA</h6>

        <div className="inputGroup">
          <h6>Selecionar COBRADE</h6>
          <Input
            as="select"
            bordered
            onChange={handleChangeCobradeNumber}
            value={selectedCobradeNumber}
          >
            {cobrades.map((cobradeItem) => (
              <option key={cobradeItem.cobrade} value={cobradeItem.cobrade}>
                {cobradeItem.cobrade}
              </option>
            ))}
          </Input>
        </div>

        <div className="inputGroup">
          <h6>Descrição</h6>
          <Input
            bordered
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <Button onClick={handleAddThreat} className="darkBlueButton">
          Adicionar{" "}
        </Button>

        <img src={cobradesImg} alt="" />
      </Container>
    </Modal>
  );
};

export default ThreatModal;
