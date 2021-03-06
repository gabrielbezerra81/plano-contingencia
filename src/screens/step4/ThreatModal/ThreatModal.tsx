import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "react-bootstrap";

import Select from "react-select";

import ModalCloseButton from "shared/components/ModalCloseButton/ModalCloseButton";

import cobradesImg from "assets/images/cobrades3.png";

import { Modal, Container } from "./styles";
import api from "api/config";
import { useAddScenario } from "context/Scenario/addScenarioContext";

interface Props {
  show: boolean;
  setShow: (...data: any) => void;
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

const ThreatModal: React.FC<Props> = ({ show, setShow }) => {
  const { handleAddValueToScenario, generateMergeKey } = useAddScenario();

  const [cobrades, setCobrades] = useState<Cobrade[]>([]);

  const [selectedCobradeNumber, setSelectedCobradeNumber] = useState("");
  const [description, setDescription] = useState("");

  const handleChangeCobradeNumber = useCallback(
    (value) => {
      const cobradeNumber = value;

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
    const cobradeValue = {
      cobrade: selectedCobradeNumber,
      description,
      mergeKey: generateMergeKey(),
    };

    handleAddValueToScenario({ attr: "threat", value: cobradeValue });

    setShow(false);
  }, [
    selectedCobradeNumber,
    description,
    setShow,
    handleAddValueToScenario,
    generateMergeKey,
  ]);

  useEffect(() => {
    api
      .get("cobrades")
      .then((response) => {
        if (response.data && response.data.length) {
          setCobrades(response.data);

          if (response.data.length) {
            setDescription(response.data[0].descricao);
            handleChangeCobradeNumber(response.data[0].cobrade);
          }
        }
      })
      .catch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const options = useMemo(() => {
    return cobrades.map((cobradeItem) => ({
      value: cobradeItem.cobrade,
      label: `${cobradeItem.cobrade} - ${cobradeItem.descricao}`,
    }));
  }, [cobrades]);

  const value = useMemo(
    () => ({
      value: selectedCobradeNumber,
      label: `${selectedCobradeNumber} - ${description}`,
    }),
    [selectedCobradeNumber, description],
  );

  return (
    <Modal show={show} centered onHide={() => setShow(false)}>
      <ModalCloseButton setShow={setShow} />
      <Container>
        <h6>ADICIONAR AMEAÇA</h6>

        <div className="inputGroup">
          <h6>Selecionar COBRADE</h6>

          <Select
            options={options}
            value={value}
            onChange={(option) => {
              if (option) {
                handleChangeCobradeNumber(option.value);
              }
            }}
            placeholder="Selecione um COBRADE"
            noOptionsMessage={() => "Nenhum item encontrado"}
            styles={{
              container: (base) => ({
                ...base,
                width: 450,
                marginLeft: 24,
              }),
            }}
          />
        </div>

        <Button onClick={handleAddThreat} className="darkBlueButton">
          Adicionar
        </Button>

        <img src={cobradesImg} alt="" />
      </Container>
    </Modal>
  );
};

export default ThreatModal;
