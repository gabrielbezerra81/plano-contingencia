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
import Alert from "shared/components/Alert/Alert";

const StepFour: React.FC = () => {
  const { selectedTab } = useSystem();

  const { getSequenceId, updateLocalPlanData } = usePlanData();

  const {
    scenariosList,
    setScenariosList,
    scenarioTitle,
    setScenarioTitle,
    checkedValues,
    setCheckedValues,
    setScenarioSaveEnabled,
    scenarioSaveEnabled,
    alertIfPreviousIsNotChecked,
  } = useScenario();

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showThreatModal, setShowThreatModal] = useState(false);
  const [showHypotheseModal, setShowHypotheseModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showMeasureModal, setShowMeasureModal] = useState(false);
  const [showResponsibleModal, setShowResponsibleModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [isUndoDisabled, setIsUndoDisabled] = useState(true);

  const [suggestionList, setSuggestionList] = useState<SuggestionList[]>([]);

  const [saveCountdown, setSaveCountdown] = useState(10);

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
    Alert({
      title: "Apagar cenário",
      message: "Deseja mesmo apagar todas as informações deste cenário?",
      onPositiveClick: () => {
        setScenariosList([]);
        setCheckedValues([]);
      },
    });
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

  const handleSave = useCallback(() => {
    setSaveCountdown(60);
  }, []);

  // Carregar Cobrade
  useEffect(() => {
    async function loadSuggestions() {
      try {
        const suggestions = [];
        const usedCobrades: string[] = [];

        for await (const scenario of scenariosList) {
          if (
            scenario.threat.cobrade &&
            !usedCobrades.includes(scenario.threat.cobrade)
          ) {
            usedCobrades.push(scenario.threat.cobrade);
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
            onClick={(shouldVerify) => {
              const isChecked = shouldVerify
                ? alertIfPreviousIsNotChecked("threat")
                : true;

              if (isChecked) {
                setShowThreatModal(true);
              }
            }}
          />
        ),
        accessor: "threat",
        enableRowSpan: true,
      },
      {
        Header: (
          <TableHead
            title={"Situação\nhipotética"}
            onClick={(shouldVerify) => {
              const isChecked = shouldVerify
                ? alertIfPreviousIsNotChecked("hypothese")
                : true;

              if (isChecked) {
                setShowHypotheseModal(true);
              }
            }}
          />
        ),
        accessor: "hypothese",
        enableRowSpan: true,
      },
      {
        Header: (
          <TableHead
            title={"Riscos/\nVulnerabilidades"}
            onClick={(shouldVerify) => {
              const isChecked = shouldVerify
                ? alertIfPreviousIsNotChecked("risk")
                : true;

              if (isChecked) {
                setShowRiskModal(true);
              }
            }}
          />
        ),
        accessor: "risk",
        enableRowSpan: true,
      },
      {
        Header: (
          <TableHead
            title={"Medidas de\nenfretamento"}
            onClick={(shouldVerify) => {
              const isChecked = shouldVerify
                ? alertIfPreviousIsNotChecked("measure")
                : true;

              if (isChecked) {
                setShowMeasureModal(true);
              }
            }}
          />
        ),
        accessor: "measure",
        enableRowSpan: true,
      },
      {
        Header: (
          <TableHead
            title={"Responsáveis"}
            onClick={(shouldVerify) => {
              const isChecked = shouldVerify
                ? alertIfPreviousIsNotChecked("responsibles")
                : true;

              if (isChecked) {
                setShowResponsibleModal(true);
              }
            }}
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
            onClick={(shouldVerify) => {
              const isChecked = shouldVerify
                ? alertIfPreviousIsNotChecked("resourceId")
                : true;

              if (isChecked) {
                setShowResourceModal(true);
              }
            }}
          />
        ),
        accessor: "resourceId",
        enableRowSpan: true,
      },
    ];
  }, [alertIfPreviousIsNotChecked]);

  const tableInstance = useTable(
    {
      columns,
      data: scenariosList,
    },
    (hooks) => {
      hooks.useInstance.push(useRowSpan);
    },
  );

  useEffect(() => {
    async function submitScenariosChange() {
      if (selectedTab !== "tab4") {
        try {
          const completeScenarios = scenariosList.filter(
            (scenario) => !!scenario.resourceId,
          );

          const scenariosWithIds = await produce(
            completeScenarios,
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
  }, [selectedTab]);

  useEffect(() => {
    setIsUndoDisabled(false);
  }, [scenariosList]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSaveCountdown((oldValue) => {
        const newValue = oldValue - 1;

        if (newValue === 0) {
          return 10;
        }

        return newValue;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <>
      <Container>
        <div className="titleContainer">
          <h4>4: CONSTRUÇÃO DE CENÁRIO</h4>
        </div>
        <Input
          value={scenarioTitle}
          onChange={handleChangeScenarioTitle}
          borderBottomOnly
          labelOnInput="Título: "
        />

        <ScenarioTable tableInstance={tableInstance} />
        <div className="buttonsContainer">
          <Button
            onClick={handleUncheckAll}
            className="darkBlueButton"
            size="sm"
          >
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

          <Button
            style={{ marginLeft: 24 }}
            className="darkBlueButton"
            size="sm"
            onClick={handleSave}
          >
            Salvar - {saveCountdown}
          </Button>
        </div>
      </Container>

      {location.hostname === "localhostt" && (
        <Form.Check
          label="Salvar cenários"
          checked={scenarioSaveEnabled}
          onChange={() => setScenarioSaveEnabled((oldValue) => !oldValue)}
        />
      )}

      {location.hostname === "localhostt" && (
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
            Checked: {checkedValues.length}
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
