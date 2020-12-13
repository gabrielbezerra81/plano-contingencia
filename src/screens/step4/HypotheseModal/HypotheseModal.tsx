import { useScenario } from "context/PlanData/scenarioContext";
import React, { useCallback, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import Input from "shared/components/Input/Input";
import ModalCloseButton from "shared/components/ModalCloseButton/ModalCloseButton";

import { Container } from "./styles";

interface Props {
  show: boolean;
  setShow: (...data: any) => void;
}

const HypotheseModal: React.FC<Props> = ({ show, setShow }) => {
  const { handleAddValueToScenario } = useScenario();

  const [hypothese, setHypothese] = useState("Hipotese ");

  const handleAddHypothese = useCallback(() => {
    handleAddValueToScenario({ attr: "hypothese", value: hypothese });

    setShow(false);
  }, [setShow, hypothese, handleAddValueToScenario]);

  return (
    <Modal show={show} centered onHide={() => setShow(false)}>
      <ModalCloseButton setShow={setShow} />
      <Container>
        <h6>Adicionar situação hipotética</h6>

        <Input
          value={hypothese}
          onChange={(e) => setHypothese(e.target.value)}
          borderBottomOnly
          size="small"
        />

        <Button className="darkBlueButton" onClick={handleAddHypothese}>
          Adicionar
        </Button>
      </Container>
    </Modal>
  );
};

export default HypotheseModal;
