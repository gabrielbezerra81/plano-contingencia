import { useAddScenario } from "context/Scenario/addScenarioContext";
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
}

const RiskModal: React.FC<Props> = ({ show, setShow, suggestionList }) => {
  const { handleAddValueToScenario, generateMergeKey } = useAddScenario();

  const [risk, setRisk] = useState<Partial<Risk>>({ id: "", description: "" });

  const handleChangeDescription = useCallback(
    (e) =>
      setRisk((oldValue) => ({ ...oldValue, description: e.target.value })),
    [],
  );

  const handleAddRisk = useCallback(() => {
    const riskValue = { ...risk, mergeKey: generateMergeKey() };

    handleAddValueToScenario({ attr: "risk", value: riskValue });

    setShow(false);
  }, [setShow, risk, handleAddValueToScenario, generateMergeKey]);

  const filteredSuggestionList = useMemo(() => {
    const descriptions = suggestionList.map((suggestion) => suggestion.risco);

    return [...new Set(descriptions)].map((description) => ({
      id: "",
      description,
    }));
  }, [suggestionList]);

  const handleSelectSuggestion = useCallback(
    (e) => {
      setRisk(filteredSuggestionList[Number(e.target.value)]);
    },
    [filteredSuggestionList],
  );

  return (
    <Modal show={show} centered onHide={() => setShow(false)}>
      <ModalCloseButton setShow={setShow} />
      <Container>
        <h6>Adicionar Riscos/Vulnerabilidades</h6>

        <div className="inputGroup">
          <h6>Sugestões de riscos</h6>
          <Input
            as="select"
            bordered
            onChange={handleSelectSuggestion}
            disabled={!filteredSuggestionList.length}
          >
            {!filteredSuggestionList.length && (
              <option style={{ color: "#aaa" }}>Não há sugestões</option>
            )}
            <option />
            {filteredSuggestionList.map((suggestion, index) => (
              <option key={index} value={index}>
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
