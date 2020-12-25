import { usePlanData } from "context/PlanData/planDataContext";
import { useScenario } from "context/Scenario/scenarioContext";
import React, { useMemo } from "react";
import formatScenarioAddress from "shared/utils/format/formatScenarioAddress";
import { Hypothese, Measure, Risk, Threat } from "types/Plan";

import { Container, ColumnTitle, ColumnValue } from "./styles";

interface Props {}

const ScenarioDetail: React.FC<Props> = () => {
  const { planData } = usePlanData();
  const { scenariosList } = useScenario();

  const formattedRiskLocations = useMemo(() => {
    return planData.riskLocations.map((locationItem) => ({
      ...locationItem,
      formattedAddress: formatScenarioAddress(locationItem, {
        identification: false,
      }),
    }));
  }, [planData.riskLocations]);

  const locations = useMemo(() => {
    const locationsIds = [
      ...new Set(scenariosList.map((scenario) => scenario.addressId)),
    ];

    return formattedRiskLocations.filter((location) =>
      locationsIds.includes(location.id || ""),
    );
  }, [scenariosList, formattedRiskLocations]);

  const detail = useMemo(() => {
    const threats: Threat[] = [];
    const risks: Risk[] = [];
    const hypotheses: Hypothese[] = [];
    const measures: Measure[] = [];

    scenariosList.forEach((scenario) => {
      const threatAdded = threats.some(
        (item) => item.cobrade === scenario.threat.cobrade,
      );

      if (!threatAdded) {
        threats.push(scenario.threat);
      }

      const riskAdded = risks.some(
        (item) => item.description === scenario.risk.description,
      );

      if (!riskAdded) {
        risks.push(scenario.risk);
      }

      const hypotheseAdded = hypotheses.some(
        (item) => item.hypothese === scenario.hypothese.hypothese,
      );

      if (!hypotheseAdded) {
        hypotheses.push(scenario.hypothese);
      }

      const measureAdded = measures.some(
        (item) => item.description === scenario.measure.description,
      );

      if (!measureAdded) {
        measures.push(scenario.measure);
      }
    });

    return { threats, risks, hypotheses, measures };
  }, [scenariosList]);

  return (
    <Container>
      <h3>Cenário:</h3>
      <div className="firstRow">
        <div>
          <ColumnTitle>Local de risco:</ColumnTitle>
          {locations.map((location, index) => (
            <ColumnValue key={index}>
              {location.formattedAddress.fullAddress}
            </ColumnValue>
          ))}
        </div>
        <div>
          <ColumnTitle>Risco:</ColumnTitle>
          {detail.threats.map((threat) => (
            <ColumnValue key={threat.cobrade}>
              {threat.cobrade} {threat.description}
            </ColumnValue>
          ))}
        </div>
      </div>

      <div className="scenarioRow">
        <ColumnTitle>Ameaças (COBRADE):</ColumnTitle>
        <div>
          {detail.threats.map((threat) => (
            <ColumnValue key={threat.cobrade}>
              {threat.cobrade} {threat.description}
            </ColumnValue>
          ))}
        </div>
      </div>

      <div className="scenarioRow">
        <ColumnTitle>Riscos:</ColumnTitle>
        <div>
          {detail.risks.map((risk) => (
            <ColumnValue key={risk.description}>{risk.description}</ColumnValue>
          ))}
        </div>
      </div>

      <div className="scenarioRow">
        <ColumnTitle>Hipótese:</ColumnTitle>
        <div>
          {detail.hypotheses.map((hypothese) => (
            <ColumnValue key={hypothese.hypothese}>
              {hypothese.hypothese}
            </ColumnValue>
          ))}
        </div>
      </div>

      <div className="scenarioRow">
        <ColumnTitle>Medidas de enfrentamento:</ColumnTitle>
        <div>
          {detail.measures.map((measure) => (
            <ColumnValue key={measure.description}>
              {measure.description}
            </ColumnValue>
          ))}
        </div>
      </div>

      <div className="scenarioRow responsibleResourceRow">
        <ColumnTitle>Responsável:</ColumnTitle>
        <ColumnValue>Alex Barros</ColumnValue>
        <ColumnValue>Sandro Brito</ColumnValue>
      </div>

      <div className="scenarioRow responsibleResourceRow">
        <ColumnTitle>Recursos:</ColumnTitle>
        <ColumnValue>1 milhão</ColumnValue>
        <ColumnValue>20 Veículos brancos</ColumnValue>
      </div>
    </Container>
  );
};

export default ScenarioDetail;
