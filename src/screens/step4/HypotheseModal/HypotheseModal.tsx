import { useAddScenario } from "context/Scenario/addScenarioContext";
import { useEditScenario } from "context/Scenario/editScenarioContext";
import React, { useCallback, useState, useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import Input from "shared/components/Input/Input";
import ModalCloseButton from "shared/components/ModalCloseButton/ModalCloseButton";

import { Container } from "./styles";

interface Props {
  show: boolean;
  setShow: (...data: any) => void;
}

const HypotheseModal: React.FC<Props> = ({ show, setShow }) => {
  const { handleAddValueToScenario, generateMergeKey } = useAddScenario();

  const { editingProps, setEditingProps, handleEditItem } = useEditScenario();

  const [hypothese, setHypothese] = useState("Hipotese ");

  const handleAddHypothese = useCallback(() => {
    const hypotheseValue = {
      hypothese,
      mergeKey: generateMergeKey(),
    };

    handleAddValueToScenario({ attr: "hypothese", value: hypotheseValue });

    setShow(false);
  }, [setShow, hypothese, handleAddValueToScenario, generateMergeKey]);

  const handleUpdateHypothese = useCallback(() => {
    handleEditItem({
      newValue: {
        hypothese,
        mergeKey: generateMergeKey(),
      },
    });
    setShow(false);
  }, [handleEditItem, setShow, hypothese, generateMergeKey]);

  const onHide = useCallback(() => {
    setShow(false);
    setEditingProps(null);
  }, [setShow, setEditingProps]);

  useEffect(() => {
    if (editingProps) {
      setHypothese(editingProps.value.hypothese);
    }
  }, [editingProps]);

  return (
    <Modal show={show} centered onHide={onHide}>
      <ModalCloseButton setShow={onHide} />
      <Container>
        <h6>Adicionar situação hipotética</h6>

        <Input
          value={hypothese}
          onChange={(e) => setHypothese(e.target.value)}
          borderBottomOnly
          size="small"
        />

        <Button
          className="darkBlueButton"
          onClick={editingProps ? handleUpdateHypothese : handleAddHypothese}
        >
          {!!editingProps ? "Confirmar" : "Adicionar"}
        </Button>
      </Container>
    </Modal>
  );
};

export default HypotheseModal;
