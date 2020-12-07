import produce from "immer";
import React, { useCallback, useMemo, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import Input from "shared/components/Input/Input";
import ModalCloseButton from "shared/components/ModalCloseButton/ModalCloseButton";
import { Risk } from "types/Plan";
import { SuggestionList } from "../types";

import { Container } from "./styles";

interface Props {
  show: boolean;
  setShow: (...data: any) => void;
  suggestionList: SuggestionList[];
  setAddedRisks: React.Dispatch<React.SetStateAction<Risk[]>>;
}

const RiskModal: React.FC<Props> = ({
  show,
  setShow,
  suggestionList,
  setAddedRisks,
}) => {
  const [risk, setRisk] = useState<Risk>({ id: "", description: "" });

  const handleChangeDescription = useCallback(
    (e) =>
      setRisk((oldValue) => ({ ...oldValue, description: e.target.value })),
    [],
  );

  const handleSelectSuggestion = useCallback((e) => {
    setRisk((oldValue) => ({ ...oldValue, description: e.target.value }));
  }, []);

  const handleAddRisk = useCallback(() => {
    setAddedRisks((oldValues) => {
      const updatedAddedRisks = produce(oldValues, (draft) => {
        const alreadyAdded = draft.some(
          (riskItem) => riskItem.description === risk.description,
        );

        if (!alreadyAdded) {
          draft.push(risk);
        }
      });

      return updatedAddedRisks;
    });

    setShow(false);
  }, [setShow, risk, setAddedRisks]);

  const filteredSuggestionList = useMemo(() => {
    const descriptions = suggestionList.map((suggestion) => suggestion.risco);

    return [...new Set(descriptions)].map((description) => ({
      id: "",
      description,
    }));
  }, [suggestionList]);

  return (
    <Modal show={show} centered onHide={() => setShow(false)}>
      <ModalCloseButton setShow={setShow} />
      <Container>
        <h6>Adicionar Riscos/Vulnerabilidades</h6>

        <div className="inputGroup">
          <h6>Sugestões de riscos</h6>
          <Input as="select" bordered onChange={handleSelectSuggestion}>
            <option />
            {filteredSuggestionList.map((suggestion) => (
              <option key={suggestion.id} value={suggestion.description}>
                {suggestion.description}
              </option>
            ))}
          </Input>
        </div>

        <div className="inputGroup">
          <h6>Descrição</h6>
          <Input
            bordered
            value={risk.description}
            onChange={handleChangeDescription}
          />
        </div>

        <Button className="darkBlueButton" onClick={handleAddRisk}>
          Adicionar
        </Button>
      </Container>
    </Modal>
  );
};

export default RiskModal;
