import produce from "immer";
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
  setAddedMeasures: React.Dispatch<React.SetStateAction<Measure[]>>;
}

const MeasureModal: React.FC<Props> = ({
  show,
  setShow,
  suggestionList,
  setAddedMeasures,
}) => {
  const [measure, setMeasure] = useState<Measure>({ id: "", description: "" });

  const handleChangeDescription = useCallback(
    (e) =>
      setMeasure((oldValue) => ({ ...oldValue, description: e.target.value })),
    [],
  );

  const handleSelectSuggestion = useCallback((e) => {
    setMeasure((oldValue) => ({ ...oldValue, description: e.target.value }));
  }, []);

  const handleAddMeasure = useCallback(() => {
    setAddedMeasures((oldValues) => {
      const updatedAddedMeasures = produce(oldValues, (draft) => {
        const alreadyAdded = draft.some(
          (measureItem) => measureItem.description === measure.description,
        );

        if (!alreadyAdded) {
          draft.push(measure);
        }
      });

      return updatedAddedMeasures;
    });

    setShow(false);
  }, [setShow, measure, setAddedMeasures]);

  const filteredSuggestionList = useMemo(() => {
    const descriptions = suggestionList.map((suggestion) => suggestion.medida);

    return [...new Set(descriptions)].map((description) => ({
      id: "",
      description,
    }));
  }, [suggestionList]);

  return (
    <Modal show={show} centered onHide={() => setShow(false)}>
      <ModalCloseButton setShow={setShow} />
      <Container>
        <h6>Adicionar Medida de Enfretamento</h6>

        <div className="inputGroup">
          <h6>Sugestões de medidas</h6>
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
