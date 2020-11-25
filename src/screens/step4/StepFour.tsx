import React, { useCallback, useState } from "react";
import { Form } from "react-bootstrap";

import { FiPlus } from "react-icons/fi";
import { GrSearch } from "react-icons/gr";
import Input from "shared/components/Input/Input";
import Address from "types/Address";
import ResourceModal from "./ResourceModal/ResourceModal";

import { Container } from "./styles";

const StepFour: React.FC = () => {
  const [addressList, setAddressList] = useState<Address[]>([
    {
      name: "Titulo",
      address: "Rua Major Vitalino, 370",
      neighbor: "Centro",
      complement: "Complemento",
      city: "Pio IX",
      state: "Piauí",
      refPoint: "",
      lat: "-6",
      long: "-40",
    },
    {
      name: "Titulo",
      address: "Rua Major Vitalino, 370",
      neighbor: "Centro",
      complement: "Complemento",
      city: "Pio IX",
      state: "Piauí",
      refPoint: "",
      lat: "-6",
      long: "-40",
    },
  ]);

  const [threats, setThreats] = useState<string[]>([
    "Geológico (Deslizamento de encosta)",
  ]);

  const [risks, setRisks] = useState<string[]>([
    "As condições naturais favorecem ocorrências de deslizamentos,  podendo se agravar com excesso de chuvas.",
  ]);

  const [hypothesis, setHypothesis] = useState<string[]>([
    "Deslizamento encosta nos bairros Alfa, Beta e Gama.",
  ]);

  const [measures, setMeasures] = useState<string[]>([
    "Retirar as pessoas das residências",
    "Levalas para um abrigo",
    "Fornecer Alimentação",
  ]);

  const [responsibles, setResponsible] = useState<string[]>([
    "Alex Barros",
    "Sandro Brito",
  ]);

  const [resources, setResources] = useState<string[]>([
    "1 milhão",
    "20 veículos",
    "4 milhões",
  ]);

  const [showResourceModal, setShowResourceModal] = useState(false);

  const handleClickResources = useCallback(() => {
    setShowResourceModal(true);
  }, []);

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
            {addressList.map((addressItem, index) => (
              <div key={index} className="itemListing">
                <Form.Check custom type="checkbox" />
                <h6>
                  {addressItem.name},
                  <br />
                  {addressItem.address}, {addressItem.neighbor}
                  <br />
                  {addressItem.complement ? `${addressItem.complement}, ` : ""}
                  {addressItem.city}, {addressItem.state}
                </h6>
              </div>
            ))}
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
            {threats.map((threatItem, index) => (
              <div key={index} className="itemListing">
                <Form.Check custom type="checkbox" />
                <h6>{threatItem}</h6>
              </div>
            ))}
          </main>
        </div>

        <div className="scenarioItem">
          <button>
            <header>
              <FiPlus />

              <h6>Riscos</h6>
            </header>
          </button>
          <main>
            {risks.map((riskItem, index) => (
              <div key={index} className="itemListing">
                <Form.Check custom type="checkbox" />
                <h6>{riskItem}</h6>
              </div>
            ))}
          </main>
        </div>

        <div className="scenarioItem">
          <button>
            <header>
              <FiPlus />

              <h6>Hipótese</h6>
            </header>
          </button>
          <main>
            {hypothesis.map((hypotheseItem, index) => (
              <div key={index} className="itemListing">
                <Form.Check custom type="checkbox" />
                <h6>{hypotheseItem}</h6>
              </div>
            ))}
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
            {measures.map((measureItem, index) => (
              <div key={index} className="itemListing">
                <Form.Check custom type="checkbox" />
                <h6>{measureItem}</h6>
              </div>
            ))}
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
            {responsibles.map((responsibleItem, index) => (
              <div key={index} className="itemListing">
                <Form.Check custom type="checkbox" />
                <h6>{responsibleItem}</h6>
              </div>
            ))}
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
            {resources.map((resourceItem, index) => (
              <div key={index} className="itemListing">
                <Form.Check custom type="checkbox" />
                <h6>{resourceItem}</h6>
              </div>
            ))}
          </main>
        </div>
      </Container>
      <ResourceModal show={showResourceModal} setShow={setShowResourceModal} />
    </>
  );
};

export default StepFour;
