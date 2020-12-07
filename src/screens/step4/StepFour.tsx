import api from "api/config";
import { usePlanData } from "context/PlanData/planDataContext";
import produce from "immer";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Form } from "react-bootstrap";

import { FiPlus } from "react-icons/fi";
import { GrSearch } from "react-icons/gr";
import Input from "shared/components/Input/Input";
import ResourcesModal from "shared/components/ResourcesModal/ResourcesModal";
import formatResources from "shared/utils/format/formatResources";
import formatScenarioAddress from "shared/utils/format/formatScenarioAddress";
import { Scenario, Risk, Measure, Responsible } from "types/Plan";
import HypotheseModal from "./HypotheseModal/HypotheseModal";
import MeasureModal from "./MeasureModal/MeasureModal";
import RiskModal from "./RiskModal/RiskModal";

import { Container, ItemListingText } from "./styles";
import ThreatModal from "./ThreatModal/ThreatModal";
import {
  SuggestionList,
  DuplicateScenariosLines,
  FilterScenarioList,
} from "./types";

const emptyScenario: Scenario = {
  addressId: "",
  hypothese: "",
  id: "",
  measure: {
    description: "",
    id: "",
  },
  resourceId: "",
  responsibles: [],
  risk: { description: "", id: "" },
  threat: { cobrade: "", description: "" },
};

const StepFour: React.FC = () => {
  const { planData } = usePlanData();

  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showThreatModal, setShowThreatModal] = useState(false);
  const [showHypotheseModal, setShowHypotheseModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showMeasureModal, setShowMeasureModal] = useState(false);

  const [suggestionList, setSuggestionList] = useState<SuggestionList[]>([]);

  const [scenariosList, setScenariosList] = useState<Scenario[]>(() => {
    const scenarios = localStorage.getItem("scenariosList");

    if (scenarios) {
      return JSON.parse(scenarios);
    }

    return [];
  });
  const [previousScenariosList, setPreviousScenariosList] = useState<
    Scenario[]
  >(() => {
    const scenarios = localStorage.getItem("previousScenariosList");

    if (scenarios) {
      return JSON.parse(scenarios);
    }

    return [];
  });

  const [addedCobrades, setAddedCobrades] = useState<any[]>(() => {
    const cobrades = localStorage.getItem("addedCobrades");

    if (cobrades) {
      return JSON.parse(cobrades);
    }
    return [];
  });
  const [addedHypotheses, setAddedHypotheses] = useState<string[]>(() => {
    const hypotheses = localStorage.getItem("addedHypotheses");

    if (hypotheses) {
      return JSON.parse(hypotheses);
    }
    return [];
  });
  const [addedRisks, setAddedRisks] = useState<Risk[]>(() => {
    const risks = localStorage.getItem("addedRisks");

    if (risks) {
      return JSON.parse(risks);
    }
    return [];
  });
  const [addedMeasures, setAddedMeasures] = useState<Measure[]>(() => {
    const risks = localStorage.getItem("addedMeasures");

    if (risks) {
      return JSON.parse(risks);
    }
    return [];
  });

  const filterScenariosList = useCallback(
    ({ list, attr, value }: FilterScenarioList) => {
      if (attr === "responsibles") {
        list.forEach((scenario: Scenario) => {
          scenario.responsibles.forEach((responsible, index) => {
            if (
              `${responsible.name} ${responsible.role} ${responsible.permission}` ===
              value
            ) {
              scenario.responsibles.splice(index, 1);
            }
          });
        });
      } //
      else {
        const filtered = list.filter((scenario: Scenario) => {
          switch (attr) {
            case "addressId":
              return scenario.addressId !== value;
            case "threat":
              return scenario.threat.cobrade !== value;
            case "hypothese":
              return scenario.hypothese !== value;
            case "risk":
              return scenario.risk.description !== value;
            case "measure":
              return scenario.measure.description !== value;
            case "resourceId":
              return scenario.resourceId !== value;
            default:
              return true;
          }
        });

        return filtered;
      }
    },
    [],
  );

  const verifyIfPreviousScenariosHasValue = useCallback(
    (attr: keyof Scenario, value: any): boolean => {
      const valueExists = previousScenariosList.some((scenario) => {
        if (["addressId", "hypothese", "resourceId"].includes(attr)) {
          return scenario[attr] === value;
        }

        if (attr === "threat") {
          return scenario.threat.cobrade === value;
        }

        if (attr === "risk" || attr === "measure") {
          return scenario[attr].description === value;
        }

        if (attr === "responsibles") {
          return scenario.responsibles.some(
            (responsible) =>
              `${responsible.name} ${responsible.role} ${responsible.permission}` ===
              value,
          );
        }

        return false;
      });

      return valueExists;
    },
    [previousScenariosList],
  );

  const duplicateScenariosLines = useCallback(
    ({ attr, value, draftScenariosList }: DuplicateScenariosLines) => {
      let compareValue = value;

      if (attr === "threat") {
        compareValue = value.cobrade;
      } //
      else if (["risk", "measure"].includes(attr)) {
        compareValue = value.description;
      } //
      else if (attr === "responsibles") {
        compareValue = `${value.name} ${value.role} ${value.permission}`;
      }

      const alreadyAdded = verifyIfPreviousScenariosHasValue(
        attr,
        compareValue,
      );

      if (!alreadyAdded) {
        // Cenario possui um array de responsaveis, então so precisa fazer o push
        if (attr === "responsibles") {
          draftScenariosList.forEach((scenario) => {
            scenario.responsibles.push(value);
          });
          setPreviousScenariosList((previousScenarios) => {
            const updatedPreviousScenarios = produce(
              previousScenarios,
              (previousDraft) => {
                previousDraft.forEach((previousScenario) => {
                  previousScenario.responsibles.push(value);
                });
              },
            );

            return updatedPreviousScenarios;
          });
        } // Demais atributos que possuem que cada cenario possui apenas 1 irão ramificar
        else {
          previousScenariosList.forEach((prevScenario) => {
            let shouldChangeAttrInLine: boolean = false;
            let nestedFindValue = "";

            switch (attr) {
              case "threat":
                shouldChangeAttrInLine = !prevScenario.threat.cobrade;
                nestedFindValue = "cobrade";
                break;
              case "hypothese":
                shouldChangeAttrInLine =
                  !!prevScenario.threat.cobrade && !prevScenario.hypothese;
                break;
              case "risk":
                shouldChangeAttrInLine =
                  !!prevScenario.hypothese && !prevScenario.risk.description;
                nestedFindValue = "description";
                break;
              case "measure":
                shouldChangeAttrInLine =
                  !!prevScenario.risk.description &&
                  !prevScenario.measure.description;
                nestedFindValue = "description";
                break;
              case "resourceId":
                shouldChangeAttrInLine =
                  !!prevScenario.measure.description &&
                  !prevScenario.resourceId;
                break;
              default:
                break;
            }

            if (shouldChangeAttrInLine) {
              // Procurar cenário que está com o atributo atual vazio
              const scenarioItem = draftScenariosList.find((scenario) => {
                let findValue: any = scenario[attr];

                if (nestedFindValue) {
                  findValue = findValue[nestedFindValue];
                }

                return !findValue;
              });

              // Se encontrar um com o atributo vazio, preenche o valor dessa linha
              if (scenarioItem) {
                scenarioItem[attr] = value;
              } // Caso contrario, será criada uma nova linha com o nvo valor marcado
              else {
                draftScenariosList.push({ ...prevScenario, [attr]: value });
              }
              setPreviousScenariosList((oldValues) => [
                ...oldValues,
                { ...prevScenario, [attr]: value },
              ]);
            }
          });
        }
      } //
      else {
        setPreviousScenariosList((oldList) => {
          const updatedOldList = produce(oldList, (oldListDraft) => {
            return filterScenariosList({
              list: oldListDraft,
              attr,
              value: compareValue,
            });
          });
          return updatedOldList;
        });

        return filterScenariosList({
          list: draftScenariosList,
          attr,
          value: compareValue,
        });
      }
    },
    [
      verifyIfPreviousScenariosHasValue,
      filterScenariosList,
      previousScenariosList,
    ],
  );

  const handleCheckItem = useCallback(
    (attr: keyof Scenario, value: any) => {
      const updatedScenarios = produce(scenariosList, (draft) => {
        if (attr === "addressId") {
          const alreadyAdded = verifyIfPreviousScenariosHasValue(attr, value);

          if (!alreadyAdded) {
            draft.push({ ...emptyScenario, addressId: value });
            setPreviousScenariosList((oldValues) => [
              ...oldValues,
              { ...emptyScenario, addressId: value },
            ]);
          } //
          else {
            setPreviousScenariosList((oldValues) => {
              const updatedOldValues = produce(oldValues, (oldValuesDraft) => {
                return filterScenariosList({
                  list: oldValuesDraft,
                  attr: "addressId",
                  value,
                });
              });

              return updatedOldValues;
            });
            return filterScenariosList({
              list: draft,
              attr: "addressId",
              value,
            });
          }
        } //
        else {
          // Para demais atributos
          return duplicateScenariosLines({
            attr,
            value,
            draftScenariosList: draft,
          });
        }
      });

      setScenariosList(updatedScenarios);
      // localStorage.setItem("scenariosList", JSON.stringify(updatedScenarios));
    },
    [
      scenariosList,
      verifyIfPreviousScenariosHasValue,
      filterScenariosList,
      duplicateScenariosLines,
    ],
  );

  const handleClickResources = useCallback(() => {
    setShowResourceModal(true);
  }, []);

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

  // Salvar hipoteses - armazenamento local
  useEffect(() => {
    localStorage.setItem("addedHypotheses", JSON.stringify(addedHypotheses));
  }, [addedHypotheses]);

  // Salvar cobrades - A.L.
  useEffect(() => {
    localStorage.setItem("addedCobrades", JSON.stringify(addedCobrades));
  }, [addedCobrades]);

  // Salvar hipoteses - A.L.
  useEffect(() => {
    localStorage.setItem("addedRisks", JSON.stringify(addedRisks));
  }, [addedRisks]);

  // Salvar medidas - A.L.
  useEffect(() => {
    localStorage.setItem("addedMeasures", JSON.stringify(addedMeasures));
  }, [addedMeasures]);

  // Salvar estados intermediários da lista de cenários
  // useEffect(() => {
  //   localStorage.setItem(
  //     "previousScenariosList",
  //     JSON.stringify(previousScenariosList),
  //   );
  // }, [previousScenariosList]);

  const disabledColumnsCheckbox = useMemo(() => {
    const isAnyThreatChecked = scenariosList.some(
      (scenario) => !!scenario.threat.cobrade,
    );

    const isAnyHypotheseChecked = scenariosList.some(
      (scenario) => !!scenario.hypothese,
    );

    const isAnyRiskChecked = scenariosList.some(
      (scenario) => !!scenario.risk.description,
    );

    const isAnyMeasureChecked = scenariosList.some(
      (scenario) => !!scenario.measure.description,
    );

    const isAnyResponsibleChecked = scenariosList.some(
      (scenario) => !!scenario.responsibles.length,
    );

    const isAnyResourceChecked = scenariosList.some(
      (scenario) => !!scenario.resourceId,
    );

    const disabledColumns = {
      address: isAnyThreatChecked,
      threat: isAnyHypotheseChecked,
      hypothese: isAnyRiskChecked,
      risk: isAnyMeasureChecked,
      measure: isAnyResponsibleChecked,
      responsible: isAnyResourceChecked,
    };

    return disabledColumns;
  }, [scenariosList]);

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
              const checked = verifyIfPreviousScenariosHasValue(
                "addressId",
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
                    disabled={disabledColumnsCheckbox.address}
                  />
                  <ItemListingText included={checked}>
                    {formatScenarioAddress(locationItem)}
                  </ItemListingText>
                </div>
              );
            })}
          </main>
        </div>

        <div className="scenarioItem">
          <button onClick={() => setShowThreatModal(true)}>
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
          </main>
        </div>

        <div className="scenarioItem">
          <button onClick={() => setShowRiskModal(true)}>
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
          </main>
        </div>

        <div className="scenarioItem">
          <button onClick={() => setShowMeasureModal(true)}>
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
              const checked = verifyIfPreviousScenariosHasValue(
                "resourceId",
                "resource.id" + index,
              );

              return (
                <div key={index} className="itemListing">
                  <Form.Check
                    custom
                    type="checkbox"
                    onChange={() =>
                      handleCheckItem("resourceId", "resource.id" + index)
                    }
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
      <ResourcesModal show={showResourceModal} setShow={setShowResourceModal} />

      <ThreatModal
        show={showThreatModal}
        setShow={setShowThreatModal}
        setAddedCobrades={setAddedCobrades}
      />

      <HypotheseModal
        show={showHypotheseModal}
        setShow={setShowHypotheseModal}
        setAddedHypotheses={setAddedHypotheses}
      />

      <RiskModal
        show={showRiskModal}
        setShow={setShowRiskModal}
        suggestionList={suggestionList}
        setAddedRisks={setAddedRisks}
      />

      <MeasureModal
        show={showMeasureModal}
        setShow={setShowMeasureModal}
        suggestionList={suggestionList}
        setAddedMeasures={setAddedMeasures}
      />
    </>
  );
};

export default StepFour;
