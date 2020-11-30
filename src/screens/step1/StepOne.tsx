import { usePlanData } from "context/PlanData/planDataContext";
import React, { useCallback } from "react";
import { Form } from "react-bootstrap";

import { Container } from "./styles";

const StepOne = () => {
  const { planData, updateLocalPlanData } = usePlanData();

  const handleGeneralDescriptionUpdate = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      updateLocalPlanData({
        generalDescription: {
          ...planData.generalDescription,
          [name]: value,
        },
      });
    },
    [updateLocalPlanData, planData],
  );

  return (
    <Container>
      <Form.Control
        name="title"
        value={planData.generalDescription.title}
        onChange={handleGeneralDescriptionUpdate}
        placeholder="Título"
      />
      <Form.Control
        name="description"
        placeholder="Descrição"
        as="textarea"
        value={planData.generalDescription.description}
        onChange={handleGeneralDescriptionUpdate}
        rows={8}
      />
    </Container>
  );
};

export default StepOne;
