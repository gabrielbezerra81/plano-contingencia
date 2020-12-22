/* eslint-disable no-restricted-globals */
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

import ScenarioTable, { TableHead } from "./ScenarioTable/ScenarioTable";
import { useScenario } from "context/Scenario/scenarioContext";
import { usePlanData } from "context/PlanData/planDataContext";
import { Button, Form } from "react-bootstrap";
import { useSystem } from "context/System/systemContext";
import ResponsibleModal from "./ResponsibleModal/ResponsibleModal";

const StepFour: React.FC = () => {
  const { selectedTab } = useSystem();

  const { planData, getSequenceId, updateLocalPlanData } = usePlanData();

  const {
    scenariosList,
    setScenariosList,
    scenarioTitle,
    setScenarioTitle,
    verifyIfScenariosHistoryHasValue,
    checkedValues,
    setCheckedValues,
    setScenarioSaveEnabled,
    scenarioSaveEnabled,
  } = useScenario();

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showThreatModal, setShowThreatModal] = useState(true);
  const [showHypotheseModal, setShowHypotheseModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showMeasureModal, setShowMeasureModal] = useState(false);
  const [showResponsibleModal, setShowResponsibleModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [isUndoDisabled, setIsUndoDisabled] = useState(true);

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
    setCheckedValues([]);
  }, [setCheckedValues]);

  const handleClearScenarios = useCallback(() => {
    setScenariosList([]);
    setCheckedValues([]);
  }, [setScenariosList, setCheckedValues]);

  const undoLastChange = useCallback(() => {
    const previousList = localStorage.getItem("previousScenariosList");
    const previousChecked = localStorage.getItem("previousCheckedValues");

    if (previousList) {
      setScenariosList(JSON.parse(previousList));
    }

    if (previousChecked) {
      setCheckedValues(JSON.parse(previousChecked));
    }

    setTimeout(() => setIsUndoDisabled(true), 500);
  }, [setScenariosList, setCheckedValues]);

  // Carregar Cobrade
  useEffect(() => {
    async function loadSuggestions() {
      try {
        const suggestions = [];

        for await (const scenario of scenariosList) {
          if (scenario.threat.cobrade) {
            const response = await api.post(
              "medidas/cobrade",
              scenario.threat.cobrade,
              {
                headers: {
                  "Content-Type": "text/plain",
                },
              },
            );

            suggestions.push(...response.data);
          }
        }

        setSuggestionList(suggestions);
      } catch (error) {}
    }

    loadSuggestions();
  }, [scenariosList]);

  const columns: any[] = useMemo(() => {
    return [
      {
        Header: (
          <TableHead
            title="Escolha o local de risco:"
            onClick={() => setShowLocationModal(true)}
          />
        ),
        accessor: "addressId",
        enableRowSpan: true,
      },
      {
        Header: (
          <TableHead
            title={"Ameaças:\n(COBRADE)"}
            onClick={() => setShowThreatModal(true)}
          />
        ),
        accessor: "threat",
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
        accessor: "risk",
        enableRowSpan: true,
      },
      {
        Header: (
          <TableHead
            title={"Medidas de\nenfretamento"}
            onClick={() => setShowMeasureModal(true)}
          />
        ),
        accessor: "measure",
        enableRowSpan: true,
      },
      {
        Header: (
          <TableHead
            title={"Responsáveis"}
            onClick={() => setShowResponsibleModal(true)}
          />
        ),
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
      data: scenariosList,
    },
    (hooks) => {
      hooks.useInstance.push(useRowSpan);
    },
  );

  const shouldUpdatePlanData = useMemo(() => {
    const hasCompletedScenarios = planData.resources.some((resource) => {
      const checked = verifyIfScenariosHistoryHasValue(
        "resourceId",
        resource.id,
      );

      return checked;
    });

    return hasCompletedScenarios;
  }, [verifyIfScenariosHistoryHasValue, planData.resources]);

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

  useEffect(() => {
    setIsUndoDisabled(false);
  }, [scenariosList]);

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

        <Button
          style={{ marginLeft: 24 }}
          onClick={undoLastChange}
          className="darkBlueButton"
          size="sm"
          disabled={isUndoDisabled}
        >
          Desfazer última alteração
        </Button>

        <Button
          style={{ marginLeft: 24 }}
          onClick={handleClearScenarios}
          className="darkBlueButton"
          size="sm"
        >
          Limpar tudo
        </Button>
      </Container>

      <Form.Check
        label="Salvar cenários"
        checked={scenarioSaveEnabled}
        onChange={() => setScenarioSaveEnabled((oldValue) => !oldValue)}
      />

      {location.hostname === "localhost" && (
        <div style={{ marginTop: 48 }}>
          <div>
            Linhas adicionadas: {scenariosList.length}
            <br />
            {scenariosList.map((scenario, index) => (
              <code key={index}>
                {JSON.stringify(scenario)}
                <br />
                <br />
              </code>
            ))}
            <br />
          </div>

          <div>
            <br />
            Checked:
            <br />
            {checkedValues.map((checkedValue, index) => (
              <code key={index}>
                {JSON.stringify(checkedValue)}
                <br />
                <br />
              </code>
            ))}
          </div>
        </div>
      )}

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

      <ResponsibleModal
        show={showResponsibleModal}
        setShow={setShowResponsibleModal}
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
