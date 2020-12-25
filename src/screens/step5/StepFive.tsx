import { usePlanData } from "context/PlanData/planDataContext";
import { useScenario } from "context/Scenario/scenarioContext";
import React from "react";
import ScenarioDetail from "./ScenarioItem/ScenarioDetail";

import { Container } from "./styles";

const StepFive: React.FC = () => {
  return (
    <>
      <Container>
        <h3>DESCRIÇÃO GERAL DO PLANO DE CONTINGÊNCIA</h3>
        <ScenarioDetail />
      </Container>
    </>
  );
};

export default StepFive;
