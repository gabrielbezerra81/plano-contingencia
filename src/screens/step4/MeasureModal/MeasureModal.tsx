import { useAddScenario } from "context/Scenario/addScenarioContext";
import React, { useCallback, useMemo, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import Input from "shared/components/Input/Input";
import ModalCloseButton from "shared/components/ModalCloseButton/ModalCloseButton";
import { Measure } from "types/Plan";
import { SuggestionList } from "../types";

import { Container } from "./styles";

interface Props {
  show: boolean;
  setShow: (...data: any) => void;
  suggestionList: SuggestionList[];
}

const MeasureModal: React.FC<Props> = ({ show, setShow, suggestionList }) => {
  const { handleAddValueToScenario, generateMergeKey } = useAddScenario();

  const [measure, setMeasure] = useState<Partial<Measure>>({
    id: "",
    description: "",
  });

  const handleChangeDescription = useCallback(
    (e) =>
      setMeasure((oldValue) => ({ ...oldValue, description: e.target.value })),
    [],
  );

  const handleAddMeasure = useCallback(() => {
    const measureValue = { ...measure, mergeKey: generateMergeKey() };

    handleAddValueToScenario({ attr: "measure", value: measureValue });

    setShow(false);
  }, [setShow, measure, handleAddValueToScenario, generateMergeKey]);

  const filteredSuggestionList = useMemo(() => {
    const descriptions = suggestionList.map((suggestion) => suggestion.medida);

    return [...new Set(descriptions)].map((description) => ({
      id: "",
      description,
    }));
  }, [suggestionList]);

  const handleSelectSuggestion = useCallback(
    (e) => {
      setMeasure(filteredSuggestionList[Number(e.target.value)]);
    },
    [filteredSuggestionList],
  );

  return (
    <Modal show={show} centered onHide={() => setShow(false)}>
      <ModalCloseButton setShow={setShow} />
      <Container>
        <h6>Adicionar Medida de Enfretamento</h6>

        <div className="inputGroup">
          <h6>Sugestões de medidas</h6>
          <Input
            as="select"
            bordered
            onChange={handleSelectSuggestion}
            disabled={!filteredSuggestionList.length}
          >
            {!filteredSuggestionList.length && (
              <option style={{ color: "#aaa" }} >Não há sugestões</option>
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
            value={measure.description}
            onChange={handleChangeDescription}
          />
        </div>

        <Button className="darkBlueButton" onClick={handleAddMeasure}>
          Adicionar
        </Button>
      </Container>
    </Modal>
  );
};

export default MeasureModal;
