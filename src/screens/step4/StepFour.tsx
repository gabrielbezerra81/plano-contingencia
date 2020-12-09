import api from "api/config";
import { usePlanData } from "context/PlanData/planDataContext";
import produce from "immer";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Form } from "react-bootstrap";

import { GrSearch } from "react-icons/gr";
import Input from "shared/components/Input/Input";
import ResourcesModal from "shared/components/ResourcesModal/ResourcesModal";
import formatResources from "shared/utils/format/formatResources";
import formatScenarioAddress from "shared/utils/format/formatScenarioAddress";
import { Responsible } from "types/Plan";
import HypotheseModal from "./HypotheseModal/HypotheseModal";
import LocationModal from "./LocationModal/LocationModal";
import MeasureModal from "./MeasureModal/MeasureModal";
import RiskModal from "./RiskModal/RiskModal";
import ScenarioColumn from "./ScenarioColumn/ScenarioColumn";

import { Container, ItemListingText } from "./styles";
import ThreatModal from "./ThreatModal/ThreatModal";
import { SuggestionList } from "./types";

import { useTable } from "react-table";

import _ from "lodash";
import ScenarioTable from "./ScenarioTable/ScenarioTable";
import { useScenario } from "context/PlanData/scenarioContext";

const StepFour: React.FC = () => {
  const { planData } = usePlanData();

  const {
    addedCobrades,
    addedHypotheses,
    addedRisks,
    addedMeasures,
    previousScenariosList,
    scenariosList,
    setScenariosList,
    verifyIfPreviousScenariosHasValue,
    handleCheckItem,
    scenarioTitle,
    setScenarioTitle,
    disabledColumnsCheckbox,
  } = useScenario();

  const [locationFilterText, setLocationFilterText] = useState("");

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showThreatModal, setShowThreatModal] = useState(false);
  const [showHypotheseModal, setShowHypotheseModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showMeasureModal, setShowMeasureModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);

  const [suggestionList, setSuggestionList] = useState<SuggestionList[]>([]);

  const handleClickResources = useCallback(() => {
    setShowResourceModal(true);
  }, []);

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
    [scenariosList],
  );

  const formattedResources = useMemo(
    () => formatResources(planData.resources),
    [planData],
  );

  const filteredResponsibles = useMemo(() => {
    const responsibles: Responsible[] = [];

    planData.resources.forEach((resource) => {
      resource.responsibles.forEach((responsible) => {
        const alreadyIncluded = responsibles.some(
          (includedItem) =>
            `${includedItem.name} ${includedItem.role} ${includedItem.permission}` ===
            `${responsible.name} ${responsible.role} ${responsible.permission}`,
        );

        if (!alreadyIncluded) {
          responsibles.push(responsible);
        }
      });
    });

    return responsibles;
  }, [planData]);

  const filteredRiskLocations = useMemo(() => {
    return planData.riskLocations
      .map((locationItem, index) => ({
        ...locationItem,
        formattedAddress: formatScenarioAddress(locationItem),
        checked: verifyIfPreviousScenariosHasValue(
          "addressId",
          locationItem.id,
        ),
      }))
      .filter((locationItem) => {
        if (!locationFilterText) return true;

        return locationItem.formattedAddress.fullAddress
          .toLocaleLowerCase()
          .includes(locationFilterText);
      });
  }, [
    planData.riskLocations,
    verifyIfPreviousScenariosHasValue,
    locationFilterText,
  ]);

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
        Header: "Escolha o local de risco:",
        accessor: "addressId",
        enableRowSpan: true,
      },
      {
        Header: "Ameaças: (COBRADE)",
        accessor: "threat.description",
        enableRowSpan: true,
      },
      {
        Header: "Situação hipotética",
        accessor: "hypothese",
        enableRowSpan: true,
      },
      {
        Header: "Riscos/Vulnerabilidades",
        accessor: "risk.description",
        enableRowSpan: true,
      },
      {
        Header: "Medidas de enfretamento",
        accessor: "measure.description",
        enableRowSpan: true,
      },
      {
        Header: "Responsáveis",
        accessor: (row: any) =>
          row.responsibles.map((responsible: any) => responsible.id).join(" "),
        enableRowSpan: true,
        id: "responsibles",
      },
      {
        Header: "Recursos",
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
        <div className="columnsContainer">
          <ScenarioColumn
            containerClassName="locationRiskColumn"
            headerTitle="Escolha o local de risco:"
            onClickHeader={() => setShowLocationModal(true)}
          >
            <Input
              borderBottomOnly
              rightIcon={<GrSearch />}
              value={locationFilterText}
              onChange={(e) =>
                setLocationFilterText(e.target.value.toLocaleLowerCase())
              }
            />
            {filteredRiskLocations.map((locationItem, index) => {
              return (
                <div key={index} className="itemListing">
                  <Form.Check
                    custom
                    type="checkbox"
                    onChange={() =>
                      handleCheckItem("addressId", locationItem.id)
                    }
                    checked={locationItem.checked}
                    disabled={disabledColumnsCheckbox.address}
                  />
                  <ItemListingText included={locationItem.checked}>
                    {locationItem.formattedAddress.jsxElement}
                  </ItemListingText>
                </div>
              );
            })}
          </ScenarioColumn>

          <ScenarioColumn
            headerTitle={`Ameaças:\n(Cobrade)`}
            onClickHeader={() => setShowThreatModal(true)}
          >
            {addedCobrades.map((cobradeItem, index) => {
              return (
                <div key={index} className="itemListing">
                  <Form.Check
                    custom
                    type="checkbox"
                    onChange={() =>
                      handleCheckItem("threat", {
                        cobrade: cobradeItem.cobrade,
                        description: cobradeItem.description,
                      })
                    }
                    checked={cobradeItem.checked}
                    disabled={disabledColumnsCheckbox.threat}
                  />
                  <ItemListingText included={cobradeItem.checked}>
                    {cobradeItem.description}
                  </ItemListingText>
                </div>
              );
            })}
          </ScenarioColumn>

          <ScenarioColumn
            headerTitle={`Situação\nHipotética`}
            onClickHeader={() => setShowHypotheseModal(true)}
          >
            {addedHypotheses.map((hypothese, index) => {
              return (
                <div key={index} className="itemListing">
                  <Form.Check
                    custom
                    type="checkbox"
                    onChange={() =>
                      handleCheckItem("hypothese", hypothese.hypothese)
                    }
                    checked={hypothese.checked}
                    disabled={disabledColumnsCheckbox.hypothese}
                  />
                  <ItemListingText included={hypothese.checked}>
                    {hypothese.hypothese}
                  </ItemListingText>
                </div>
              );
            })}
          </ScenarioColumn>

          <ScenarioColumn
            headerTitle={`Riscos/\nVulnerabilidades`}
            onClickHeader={() => setShowRiskModal(true)}
          >
            {addedRisks.map((riskItem, index) => {
              return (
                <div key={index} className="itemListing">
                  <Form.Check
                    custom
                    type="checkbox"
                    onChange={() =>
                      handleCheckItem("risk", {
                        ...riskItem,
                        checked: undefined,
                      })
                    }
                    checked={riskItem.checked}
                    disabled={disabledColumnsCheckbox.risk}
                  />
                  <ItemListingText included={riskItem.checked}>
                    {riskItem.description}
                  </ItemListingText>
                </div>
              );
            })}
          </ScenarioColumn>

          <ScenarioColumn
            headerTitle={`Medidas de\nenfrentamento`}
            onClickHeader={() => setShowMeasureModal(true)}
          >
            {addedMeasures.map((measureItem, index) => {
              return (
                <div key={index} className="itemListing">
                  <Form.Check
                    custom
                    type="checkbox"
                    onChange={() =>
                      handleCheckItem("measure", {
                        ...measureItem,
                        checked: undefined,
                      })
                    }
                    checked={measureItem.checked}
                    disabled={disabledColumnsCheckbox.measure}
                  />
                  <ItemListingText included={measureItem.checked}>
                    {measureItem.description}
                  </ItemListingText>
                </div>
              );
            })}
          </ScenarioColumn>

          <ScenarioColumn headerTitle="Responsável" onClickHeader={() => {}}>
            {filteredResponsibles.map((responsible, index) => {
              const checked = verifyIfPreviousScenariosHasValue(
                "responsibles",
                `${responsible.name} ${responsible.role} ${responsible.permission}`,
              );

              return (
                <div key={index} className="itemListing">
                  <Form.Check
                    custom
                    type="checkbox"
                    onChange={() =>
                      handleCheckItem("responsibles", responsible)
                    }
                    checked={checked}
                    disabled={disabledColumnsCheckbox.responsible}
                  />
                  <ItemListingText included={checked}>
                    {responsible.name} - {responsible.role}
                  </ItemListingText>
                </div>
              );
            })}
          </ScenarioColumn>

          <ScenarioColumn
            headerTitle="Recursos"
            onClickHeader={handleClickResources}
          >
            {formattedResources.map((resourceItem, index) => {
              const checked = verifyIfPreviousScenariosHasValue(
                "resourceId",
                resourceItem.id,
              );

              return (
                <div key={index} className="itemListing">
                  <Form.Check
                    custom
                    type="checkbox"
                    onChange={() =>
                      handleCheckItem("resourceId", resourceItem.id)
                    }
                    checked={checked}
                  />
                  <ItemListingText included={checked}>
                    {resourceItem.formattedValue2 || resourceItem.value1}
                  </ItemListingText>
                </div>
              );
            })}
          </ScenarioColumn>
        </div>
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
        <code>
          Linhas prev: {previousScenariosList.length}
          <br />
          <br />
          {JSON.stringify(previousScenariosList)}
        </code>
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

<>
      <Container>
        <Input
          value={scenarioTitle}
          onChange={handleChangeScenarioTitle}
          borderBottomOnly
          labelOnInput="Título: "
        />
        <div className="columnsContainer">
          <ScenarioColumn
            containerClassName="locationRiskColumn"
            headerTitle="Escolha o local de risco:"
            onClickHeader={() => setShowLocationModal(true)}
          >
            <Input
              borderBottomOnly
              rightIcon={<GrSearch />}
              value={locationFilterText}
              onChange={(e) =>
                setLocationFilterText(e.target.value.toLocaleLowerCase())
              }
            />
            {filteredRiskLocations.map((locationItem, index) => {
              return (
                <div key={index} className="itemListing">
                  <Form.Check
                    custom
                    type="checkbox"
                    onChange={() =>
                      handleCheckItem("addressId", locationItem.id)
                    }
                    checked={locationItem.checked}
                    disabled={disabledColumnsCheckbox.address}
                  />
                  <ItemListingText included={locationItem.checked}>
                    {locationItem.formattedAddress.jsxElement}
                  </ItemListingText>
                </div>
              );
            })}
          </ScenarioColumn>

          <ScenarioColumn
            headerTitle={`Ameaças:\n(Cobrade)`}
            onClickHeader={() => setShowThreatModal(true)}
          >
            {addedCobrades.map((cobradeItem, index) => {
              const checked = verifyIfPreviousScenariosHasValue(
                "threat",
                cobradeItem.cobrade,
              );

              return (
                <div key={index} className="itemListing">
                  <Form.Check
                    custom
                    type="checkbox"
                    onChange={() =>
                      handleCheckItem("threat", {
                        cobrade: cobradeItem.cobrade,
                        description: cobradeItem.description,
                      })
                    }
                    checked={checked}
                    disabled={disabledColumnsCheckbox.threat}
                  />
                  <ItemListingText included={checked}>
                    {cobradeItem.description}
                  </ItemListingText>
                </div>
              );
            })}
          </ScenarioColumn>

          <ScenarioColumn
            headerTitle={`Situação\nHipotética`}
            onClickHeader={() => setShowHypotheseModal(true)}
          >
            {addedHypotheses.map((hypothese, index) => {
              const checked = verifyIfPreviousScenariosHasValue(
                "hypothese",
                hypothese,
              );

              return (
                <div key={index} className="itemListing">
                  <Form.Check
                    custom
                    type="checkbox"
                    onChange={() => handleCheckItem("hypothese", hypothese)}
                    checked={checked}
                    disabled={disabledColumnsCheckbox.hypothese}
                  />
                  <ItemListingText included={checked}>
                    {hypothese}
                  </ItemListingText>
                </div>
              );
            })}
          </ScenarioColumn>

          <ScenarioColumn
            headerTitle={`Riscos/\nVulnerabilidades`}
            onClickHeader={() => setShowRiskModal(true)}
          >
            {addedRisks.map((riskItem, index) => {
              const checked = verifyIfPreviousScenariosHasValue(
                "risk",
                riskItem.description,
              );

              return (
                <div key={index} className="itemListing">
                  <Form.Check
                    custom
                    type="checkbox"
                    onChange={() => handleCheckItem("risk", riskItem)}
                    checked={checked}
                    disabled={disabledColumnsCheckbox.risk}
                  />
                  <ItemListingText included={checked}>
                    {riskItem.description}
                  </ItemListingText>
                </div>
              );
            })}
          </ScenarioColumn>

          <ScenarioColumn
            headerTitle={`Medidas de\nenfrentamento`}
            onClickHeader={() => setShowMeasureModal(true)}
          >
            {addedMeasures.map((measureItem, index) => {
              const checked = verifyIfPreviousScenariosHasValue(
                "measure",
                measureItem.description,
              );

              return (
                <div key={index} className="itemListing">
                  <Form.Check
                    custom
                    type="checkbox"
                    onChange={() => handleCheckItem("measure", measureItem)}
                    checked={checked}
                    disabled={disabledColumnsCheckbox.measure}
                  />
                  <ItemListingText included={checked}>
                    {measureItem.description}
                  </ItemListingText>
                </div>
              );
            })}
          </ScenarioColumn>

          <ScenarioColumn headerTitle="Responsável" onClickHeader={() => {}}>
            {filteredResponsibles.map((responsible, index) => {
              const checked = verifyIfPreviousScenariosHasValue(
                "responsibles",
                `${responsible.name} ${responsible.role} ${responsible.permission}`,
              );

              return (
                <div key={index} className="itemListing">
                  <Form.Check
                    custom
                    type="checkbox"
                    onChange={() =>
                      handleCheckItem("responsibles", responsible)
                    }
                    checked={checked}
                    disabled={disabledColumnsCheckbox.responsible}
                  />
                  <ItemListingText included={checked}>
                    {responsible.name} - {responsible.role}
                  </ItemListingText>
                </div>
              );
            })}
          </ScenarioColumn>

          <ScenarioColumn
            headerTitle="Recursos"
            onClickHeader={handleClickResources}
          >
            {formattedResources.map((resourceItem, index) => {
              const checked = verifyIfPreviousScenariosHasValue(
                "resourceId",
                resourceItem.id,
              );

              return (
                <div key={index} className="itemListing">
                  <Form.Check
                    custom
                    type="checkbox"
                    onChange={() =>
                      handleCheckItem("resourceId", resourceItem.id)
                    }
                    checked={checked}
                  />
                  <ItemListingText included={checked}>
                    {resourceItem.formattedValue2 || resourceItem.value1}
                  </ItemListingText>
                </div>
              );
            })}
          </ScenarioColumn>
        </div>
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
        <code>
          Linhas prev: {previousScenariosList.length}
          <br />
          <br />
          {JSON.stringify(previousScenariosList)}
        </code>
      </div>


    </>

*/
