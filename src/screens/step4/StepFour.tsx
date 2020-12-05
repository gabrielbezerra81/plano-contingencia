import api from "api/config";
import { usePlanData } from "context/PlanData/planDataContext";
import produce from "immer";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Form } from "react-bootstrap";

import { FiPlus } from "react-icons/fi";
import { GrSearch } from "react-icons/gr";
import Input from "shared/components/Input/Input";
import ResourcesModal from "shared/components/ResourcesModal/ResourcesModal";
import formatResources from "shared/utils/formatResources";
import { Scenario } from "types/Plan";
import AddHypotheseModal from "./AddHypotheseModal/AddHypotheseModal";

import { Container, ItemListingText } from "./styles";

interface SuggestionList {
  id: string;
  cobrade: string;
  risco: string;
  medida: string;
}

const emptyScenario: Scenario = {
  addressId: "",
  hypothese: "",
  id: "",
  measure: "",
  resourceId: "",
  responsibles: [],
  risk: { description: "", id: "" },
  threat: { cobrade: "", description: "" },
};

const StepFour: React.FC = () => {
  const { planData } = usePlanData();

  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showHypotheseModal, setShowHypotheseModal] = useState(false);

  const [suggestionList, setSuggestionList] = useState<SuggestionList[]>([]);

  const [currentScenario, setCurrentScenario] = useState<Scenario>({
    addressId: "",
    hypothese: "",
    measure: "",
    resourceId: "",
    responsibles: [],
    risk: { description: "", id: "" },
    threat: { cobrade: "", description: "" },
  });

  const [includedValuesToHighlight, setIncludedValuesToHighlight] = useState<
    string[]
  >([]);

  const [addedHypotheses, setAddedHypotheses] = useState<string[]>(() => {
    const hypotheses = localStorage.getItem("addedHypotheses");

    if (hypotheses) {
      return JSON.parse(hypotheses);
    }
    return [];
  });

  const handleCheckItem = useCallback(
    (attr: string, value: any) => {
      let includedValueToHighlight = "";
      let removeValue = "";

      const updatedCurrentScenario = produce(currentScenario, (draft) => {
        switch (attr) {
          case "addressId":
            if (draft.addressId === value) {
              draft.addressId = "";
              removeValue = value;
            } else {
              removeValue = draft.addressId;
              draft.addressId = value;
              includedValueToHighlight = value;
            }
            break;
          case "hypothese":
            if (draft.hypothese === value) {
              draft.hypothese = "";
              removeValue = value;
            } //
            else {
              removeValue = draft.hypothese;
              draft.hypothese = value;
              includedValueToHighlight = value;
            }
            break;
          default:
            break;
        }
      });

      if (includedValueToHighlight) {
        setIncludedValuesToHighlight((oldValues) => [
          ...oldValues,
          includedValueToHighlight,
        ]);
      } //
      if (removeValue) {
        setIncludedValuesToHighlight((oldValues) =>
          oldValues.filter((value) => value !== removeValue),
        );
      }

      setCurrentScenario(updatedCurrentScenario);
    },
    [currentScenario],
  );

  const handleClickResources = useCallback(() => {
    setShowResourceModal(true);
  }, []);

  const formattedResources = useMemo(
    () => formatResources(planData.resources),
    [planData],
  );

  // Carregar Cobrade
  useEffect(() => {
    const numberCobrade = Number(currentScenario.threat.cobrade);

    api
      .post("medidas/cobrade", numberCobrade)
      .then((response) => {
        if (response.data && response.data.length) {
          setSuggestionList(response.data);
        }
      })
      .catch();
  }, [currentScenario.threat.cobrade]);

  // Salvar hipoteses - armazenamento local
  useEffect(() => {
    localStorage.setItem("addedHypotheses", JSON.stringify(addedHypotheses));
  }, [addedHypotheses]);

  return (
    <>
      <Container>
        <div className="scenarioItem riskItem">
          <button>
            <header>
              <FiPlus />

              <h6>Escolha o local de risco:</h6>
            </header>
          </button>
          <main>
            <Input borderBottomOnly rightIcon={<GrSearch />} />
            {planData.riskLocations.map((locationItem, index) => {
              const checked = includedValuesToHighlight.includes(
                "locationItem.id" + index,
              );

              return (
                <div key={index} className="itemListing">
                  <Form.Check
                    custom
                    type="checkbox"
                    onChange={() =>
                      handleCheckItem("addressId", "locationItem.id" + index)
                    }
                    checked={checked}
                  />
                  <ItemListingText included={checked}>
                    {locationItem.identification},
                    <br />
                    {locationItem.street}, {locationItem.neighbor}
                    <br />
                    {locationItem.complement
                      ? `${locationItem.complement}, `
                      : ""}
                    {locationItem.city}, {locationItem.state}
                  </ItemListingText>
                </div>
              );
            })}
          </main>
        </div>

        <div className="scenarioItem">
          <button>
            <header>
              <FiPlus />

              <h6>
                Ameaças:
                <br />
                (COBRADE)
              </h6>
            </header>
          </button>
          <main>
            {planData.scenarios.map((scenarioItem, index) => {
              const checked = false;

              return (
                <div key={index} className="itemListing">
                  <Form.Check
                    custom
                    type="checkbox"
                    onChange={() => handleCheckItem("", "" + index)}
                    checked={checked}
                  />
                  <ItemListingText included={checked}>
                    {scenarioItem.threat.cobrade}
                  </ItemListingText>
                </div>
              );
            })}
          </main>
        </div>

        <div className="scenarioItem">
          <button onClick={() => setShowHypotheseModal(true)}>
            <header>
              <FiPlus />

              <h6>
                Situação
                <br />
                Hipotética
              </h6>
            </header>
          </button>
          <main>
            {addedHypotheses.map((hypothese, index) => {
              const checked = includedValuesToHighlight.includes(hypothese);

              return (
                <div key={index} className="itemListing">
                  <Form.Check
                    custom
                    type="checkbox"
                    onChange={() => handleCheckItem("hypothese", hypothese)}
                    checked={checked}
                  />
                  <ItemListingText included={checked}>
                    {hypothese}
                  </ItemListingText>
                </div>
              );
            })}
          </main>
        </div>

        <div className="scenarioItem">
          <button>
            <header>
              <FiPlus />

              <h6>
                Riscos/
                <br />
                Vulnerabilidades
              </h6>
            </header>
          </button>
          <main>
            {planData.scenarios.map((scenarioItem, index) => {
              const checked = false;

              return (
                <div key={index} className="itemListing">
                  <Form.Check
                    custom
                    type="checkbox"
                    onChange={() => handleCheckItem("", "" + index)}
                    checked={checked}
                  />
                  <ItemListingText included={checked}>
                    {scenarioItem.risk}
                  </ItemListingText>
                </div>
              );
            })}
          </main>
        </div>

        <div className="scenarioItem">
          <button>
            <header>
              <FiPlus />

              <h6>
                Medidas de
                <br />
                enfrentamento
              </h6>
            </header>
          </button>
          <main>
            {planData.scenarios.map((scenarioItem, index) => {
              const checked = false;

              return (
                <div key={index} className="itemListing">
                  <Form.Check
                    custom
                    type="checkbox"
                    onChange={() => handleCheckItem("", "" + index)}
                    checked={checked}
                  />
                  <ItemListingText included={checked}>
                    {scenarioItem.measure}
                  </ItemListingText>
                </div>
              );
            })}
          </main>
        </div>

        <div className="scenarioItem">
          <button>
            <header>
              <FiPlus />

              <h6>Responsável</h6>
            </header>
          </button>
          <main>
            {planData.resources.map((resource) =>
              resource.responsibles.map((responsible, index) => {
                const checked = false;

                return (
                  <div key={index} className="itemListing">
                    <Form.Check
                      custom
                      type="checkbox"
                      onChange={() => handleCheckItem("", "" + index)}
                      checked={checked}
                    />
                    <ItemListingText included={checked}>
                      {responsible.name}
                    </ItemListingText>
                  </div>
                );
              }),
            )}
          </main>
        </div>

        <div className="scenarioItem">
          <button onClick={handleClickResources}>
            <header>
              <FiPlus />

              <h6>Recursos</h6>
            </header>
          </button>
          <main>
            {formattedResources.map((resourceItem, index) => {
              const checked = false;

              return (
                <div key={index} className="itemListing">
                  <Form.Check
                    custom
                    type="checkbox"
                    onChange={() => handleCheckItem("", "" + index)}
                    checked={checked}
                  />
                  <ItemListingText included={checked}>
                    {resourceItem.formattedValue2 || resourceItem.value1}
                  </ItemListingText>
                </div>
              );
            })}
          </main>
        </div>
      </Container>
      <ResourcesModal show={showResourceModal} setShow={setShowResourceModal} />
      <AddHypotheseModal
        show={showHypotheseModal}
        setShow={setShowHypotheseModal}
        setAddedHypotheses={setAddedHypotheses}
        checkAddedItem={handleCheckItem}
      />
    </>
  );
};

export default StepFour;
