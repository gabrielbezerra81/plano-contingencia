import api from "api/config";
import produce from "immer";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import Input from "shared/components/Input/Input";
import ResourcesModal from "shared/components/ResourcesModal/ResourcesModal";

import HypotheseModal from "./HypotheseModal/HypotheseModal";
import LocationModal from "./LocationModal/LocationModal";
import MeasureModal from "./MeasureModal/MeasureModal";
import RiskModal from "./RiskModal/RiskModal";

import { Container } from "./styles";
import ThreatModal from "./ThreatModal/ThreatModal";
import { SuggestionList } from "./types";

import { useTable } from "react-table";

import _ from "lodash";
import ScenarioTable, { TableHead } from "./ScenarioTable/ScenarioTable";
import { useScenario } from "context/PlanData/scenarioContext";
import { usePlanData } from "context/PlanData/planDataContext";
import { Button } from "react-bootstrap";
import { useSystem } from "context/System/systemContext";

const StepFour: React.FC = () => {
  const { selectedTab } = useSystem();

  const {
    planData,
    getSequenceId,
    updateLocalPlanData,
    updateAPIPlanData,
  } = usePlanData();

  const {
    previousScenariosList,
    scenariosList,
    setScenariosList,
    scenarioTitle,
    setScenarioTitle,
    verifyIfPreviousScenariosHasValue,
    setPreviousScenariosList,
  } = useScenario();

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showThreatModal, setShowThreatModal] = useState(false);
  const [showHypotheseModal, setShowHypotheseModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showMeasureModal, setShowMeasureModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);

  const [suggestionList, setSuggestionList] = useState<SuggestionList[]>([]);

  const handleChangeScenarioTitle = useCallback(
    (e) => {
      const title = e.target.value;
      setScenarioTitle(title);

      localStorage.setItem("scenarioTitle", title);

      const updatedScenariosList = produce(scenariosList, (draft) => {
        draft.forEach((scenario) => {
          scenario.title = title;
        });
      });
      setScenariosList(updatedScenariosList);
    },
    [scenariosList, setScenarioTitle, setScenariosList],
  );

  const handleUncheckAll = useCallback(() => {
    setPreviousScenariosList([]);
    setScenariosList([]);
  }, [setPreviousScenariosList, setScenariosList]);

  // Carregar Cobrade
  useEffect(() => {
    async function loadSuggestions() {
      try {
        const suggestions = [];

        for await (const scenario of scenariosList) {
          if (scenario.threat.cobrade) {
            const response = await api.post("medidas/cobrade", "2.4.2.0.0", {
              headers: {
                "Content-Type": "text/plain",
              },
            });

            suggestions.push(...response.data);
          }
        }

        setSuggestionList(suggestions);
      } catch (error) {}
    }

    loadSuggestions();
  }, [scenariosList]);

  const sortedScenarioList = useMemo(() => {
    return _.orderBy(scenariosList, [
      "addressId",
      "threat.cobrade",
      "hypothese",
      "risk.description",
      "measure.description",
    ]);
  }, [scenariosList]);

  const columns: any[] = useMemo(() => {
    return [
      {
        Header: (
          <TableHead
            style={{ width: 220 }}
            title="Escolha o local de risco:"
            onClick={() => setShowLocationModal(true)}
          />
        ),
        accessor: "addressId",
        enableRowSpan: true,
        width: 230,
        minWidth: 230,
      },
      {
        Header: (
          <TableHead
            title={"Ameaças:\n(COBRADE)"}
            onClick={() => setShowThreatModal(true)}
          />
        ),
        accessor: "threat.description",
        enableRowSpan: true,
      },
      {
        Header: (
          <TableHead
            title={"Situação\nhipotética"}
            onClick={() => setShowHypotheseModal(true)}
          />
        ),
        accessor: "hypothese",
        enableRowSpan: true,
      },
      {
        Header: (
          <TableHead
            title={"Riscos/\nVulnerabilidades"}
            onClick={() => setShowRiskModal(true)}
          />
        ),
        accessor: "risk.description",
        enableRowSpan: true,
      },
      {
        Header: (
          <TableHead
            title={"Medidas de\nenfretamento"}
            onClick={() => setShowMeasureModal(true)}
          />
        ),
        accessor: "measure.description",
        enableRowSpan: true,
      },
      {
        Header: <TableHead title={"Responsáveis"} onClick={() => {}} />,
        accessor: (row: any) => {
          if (!row.responsibles.length) {
            return "none";
          }

          return row.responsibles
            .map((responsible: any) => responsible.id)
            .join(" ");
        },
        enableRowSpan: true,
        id: "responsibles",
      },
      {
        Header: (
          <TableHead
            title={"Recursos"}
            onClick={() => setShowResourceModal(true)}
          />
        ),
        accessor: "resourceId",
        enableRowSpan: true,
      },
    ];
  }, []);

  const tableInstance = useTable(
    {
      columns,
      data: sortedScenarioList,
    },
    (hooks) => {
      hooks.useInstance.push(useRowSpan);
    },
  );

  const shouldUpdatePlanData = useMemo(() => {
    const hasCompletedScenarios = planData.resources.some((resource) => {
      const checked = verifyIfPreviousScenariosHasValue(
        "resourceId",
        resource.id,
      );

      return checked;
    });

    return hasCompletedScenarios;
  }, [verifyIfPreviousScenariosHasValue, planData.resources]);

  useEffect(() => {
    async function submitScenariosChange() {
      if (shouldUpdatePlanData && selectedTab !== "tab4") {
        try {
          const scenariosWithIds = await produce(
            scenariosList,
            async (draft) => {
              for await (const scenario of draft) {
                if (!scenario.id) {
                  const id = await getSequenceId("cenarios");
                  scenario.id = id;
                }
              }
            },
          );

          setScenariosList(scenariosWithIds);
          updateLocalPlanData({ scenarios: scenariosWithIds });
        } catch (error) {}
      }
    }

    submitScenariosChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldUpdatePlanData, selectedTab]);

  return (
    <>
      <Container>
        <Input
          value={scenarioTitle}
          onChange={handleChangeScenarioTitle}
          borderBottomOnly
          labelOnInput="Título: "
        />

        <ScenarioTable tableInstance={tableInstance} />
        <Button onClick={handleUncheckAll} className="darkBlueButton" size="sm">
          Desmarcar todos
        </Button>
      </Container>

      <div style={{ marginTop: 100 }}>
        <code>
          Linhas add: {scenariosList.length}
          <br />
          <br />
          {JSON.stringify(scenariosList)}
          <br />
          <br />
        </code>
        {/* <code>
          Linhas prev: {previousScenariosList.length}
          <br />
          <br />
          {JSON.stringify(previousScenariosList)}
        </code> */}
      </div>

      <LocationModal show={showLocationModal} setShow={setShowLocationModal} />

      <ThreatModal show={showThreatModal} setShow={setShowThreatModal} />

      <HypotheseModal
        show={showHypotheseModal}
        setShow={setShowHypotheseModal}
      />

      <RiskModal
        show={showRiskModal}
        setShow={setShowRiskModal}
        suggestionList={suggestionList}
      />

      <MeasureModal
        show={showMeasureModal}
        setShow={setShowMeasureModal}
        suggestionList={suggestionList}
      />

      <ResourcesModal show={showResourceModal} setShow={setShowResourceModal} />
    </>
  );
};

export default StepFour;

function useRowSpan(instance: any) {
  const { allColumns } = instance;

  allColumns.forEach((column: any) => {
    if (column.enableRowSpan) {
      column.topCellValue = null;
      column.topCellIndex = 0;
    }
  });
}

/*

function useInstance(instance: any) {
  const { allColumns } = instance;

  let rowSpanHeaders: any[] = [];

  allColumns.forEach((column: any, i: any) => {
    const { id, enableRowSpan } = column;

    if (enableRowSpan !== undefined) {
      rowSpanHeaders = [
        ...rowSpanHeaders,
        { id, topCellValue: null, topCellIndex: 0 },
      ];
    }
  });

  Object.assign(instance, { rowSpanHeaders });
}
*/
