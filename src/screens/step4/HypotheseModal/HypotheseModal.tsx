import React, { useCallback, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import Input from "shared/components/Input/Input";
import ModalCloseButton from "shared/components/ModalCloseButton/ModalCloseButton";

import { Container } from "./styles";

interface Props {
  show: boolean;
  setShow: (...data: any) => void;
  setAddedHypotheses: React.Dispatch<React.SetStateAction<string[]>>;
}

const HypotheseModal: React.FC<Props> = ({
  show,
  setShow,
  setAddedHypotheses,
}) => {
  const [hypothese, setHypothese] = useState("");

  const handleAddHypothese = useCallback(() => {
    setAddedHypotheses((oldValues) => [...oldValues, hypothese]);

    setShow(false);
  }, [setShow, setAddedHypotheses, hypothese]);

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