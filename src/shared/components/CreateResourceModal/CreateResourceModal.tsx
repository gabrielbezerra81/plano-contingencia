import { usePlanData } from "context/PlanData/planDataContext";
import produce from "immer";
import React, { useCallback, useMemo, useState } from "react";
import { Button, Accordion, Form } from "react-bootstrap";
import { GrSearch } from "react-icons/gr";
import getMainPhoneFromPerson from "shared/utils/getMainPhoneFromPerson";
import { Responsible } from "types/Plan";
import AttributeListing from "../AttributeListing/AttributeListing";
import Input from "../Input/Input";

import { Modal, Container, ResourceAccordionItem } from "./styles";

interface Props {
  show: boolean;
  setShow: (...data: any) => any;
}

const CreateResourceModal: React.FC<Props> = ({ show, setShow }) => {
  const { planData, persons } = usePlanData();

  const [activeKey, setActiveKey] = useState<string | null>("0");

  const [addressFilterText, setAddressFilterText] = useState("");
  const [resourceListFilterText, setResourceListFilterText] = useState("");
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<
    number | null
  >(planData.resources.length ? 0 : null);

  const [addedResponsibles, setAddedResponsibles] = useState<Responsible[]>([]);

  const handleAddResponsible = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const { value } = e.target;

      const index = Number(value);

      if (index !== -1) {
        const updatedResponsibles = produce(addedResponsibles, (draft) => {
          draft.push({
            name: persons[index].name,
            permission: "editor",
            personId: persons[index].id,
            phone: getMainPhoneFromPerson(persons[index]),
            role: persons[index].role,
            status: 0,
          });
        });

        setAddedResponsibles(updatedResponsibles);
      }
    },
    [addedResponsibles, persons],
  );

  const handleRemoveResponsible = useCallback(
    (index: number) => {
      const updatedAddedResponsibles = produce(addedResponsibles, (draft) => {
        draft.splice(index, 1);
      });

      setAddedResponsibles(updatedAddedResponsibles);
    },
    [addedResponsibles],
  );

  const formattedResources = useMemo(() => {
    const formatted = planData.resources.map((resourceItem) => {
      const { address } = resourceItem;

      const number = address.number ? `${address.number}, ` : "";

      const complement = address.complement ? `${address.complement}, ` : "";

      const formatttedAddress = `${address.street}, ${number}${address.neighbor}, ${complement}${address.city} - ${address.state}`;

      return { ...resourceItem, formatttedAddress };
    });

    if (formatted.length) {
      setSelectedAddressIndex(0);
    }

    return formatted;
  }, [planData]);

  const filteredByAddressResources = useMemo(() => {
    if (addressFilterText) {
      return formattedResources.filter((resourceItem) =>
        resourceItem.formatttedAddress
          .toLocaleLowerCase()
          .includes(addressFilterText.toLocaleLowerCase()),
      );
    }

    return formattedResources;
  }, [formattedResources, addressFilterText]);

  const filteredByAnyResources = useMemo(() => {
    if (resourceListFilterText) {
      return formattedResources.filter((resourceItem) => {
        const filterText = resourceListFilterText.toLocaleLowerCase();

        const value1Condition =
          resourceItem.value1 &&
          resourceItem.value1.toLocaleLowerCase().includes(filterText);

        const value2Condition =
          resourceItem.value2 &&
          resourceItem.value2.toLocaleLowerCase().includes(filterText);

        const value3Condition =
          resourceItem.value3 &&
          resourceItem.value3.toLocaleLowerCase().includes(filterText);

        const addressCondition = resourceItem.formatttedAddress
          .toLocaleLowerCase()
          .includes(filterText);

        return (
          value1Condition ||
          value2Condition ||
          value3Condition ||
          addressCondition
        );
      });
    }

    return formattedResources;
  }, [formattedResources, resourceListFilterText]);

  return (
    <Modal
      backdropClassName="createResourceModalWrapper"
      centered
      show={show}
      onHide={() => setShow(false)}
    >
      <Container>
        <div className="borderedContainer">
          <label>Veículo</label>

          <div>
            <Input labelOnInput="Tipo/Modelo: " borderBottomOnly />
            <Input
              labelOnInput="Descrição/Características: "
              borderBottomOnly
            />
            <Input labelOnInput="Quantidade: " borderBottomOnly />
          </div>
          <div>
            <Accordion
              onSelect={setActiveKey}
              activeKey={activeKey || undefined}
            >
              <ResourceAccordionItem selected={activeKey === "0"}>
                <Accordion.Toggle as="div" eventKey="0">
                  <header>
                    <h5>Contato</h5>
                  </header>
                </Accordion.Toggle>

                <Accordion.Collapse eventKey="0">
                  <div className="accordionItemContent contactContent">
                    <div className="contactSelector">
                      <select
                        value="Adicionar um responsavel"
                        onChange={handleAddResponsible}
                      >
                        <option value={-1}>Adicionar um responsavel</option>
                        {persons.map((personItem, index) => (
                          <option key={personItem.id} value={index}>
                            {personItem.name}
                          </option>
                        ))}
                      </select>
                      <AttributeListing
                        items={addedResponsibles}
                        size="small"
                        title="Responsáveis cadastrados"
                        name=""
                        onRemove={(e, index) => handleRemoveResponsible(index)}
                        renderText={(responsibleItem: any) =>
                          responsibleItem.name
                        }
                      />
                    </div>
                  </div>
                </Accordion.Collapse>
              </ResourceAccordionItem>

              <ResourceAccordionItem selected={activeKey === "1"}>
                <Accordion.Toggle as="div" eventKey="1">
                  <header>
                    <h5>Endereço do Recurso</h5>
                  </header>
                </Accordion.Toggle>

                <Accordion.Collapse eventKey="1">
                  <div className="accordionItemContent addressContent">
                    <Input
                      labelOnInput="Pesquisar: "
                      rightIcon={<GrSearch />}
                      value={addressFilterText}
                      onChange={(e) => setAddressFilterText(e.target.value)}
                    />

                    {filteredByAddressResources.map((resourceItem, index) => (
                      <Form.Check
                        key={index}
                        type="radio"
                        label={resourceItem.formatttedAddress}
                        name="resourceAddressRadio"
                        checked={selectedAddressIndex === index}
                        onChange={() => setSelectedAddressIndex(index)}
                      />
                    ))}

                    <Button className="darkBlueButton" size="sm">
                      Novo +
                    </Button>
                  </div>
                </Accordion.Collapse>
              </ResourceAccordionItem>
            </Accordion>
          </div>

          <Button className="darkBlueButton">Incluir Recurso</Button>
        </div>

        <div className="resourceListing">
          <h5>LISTA DE VEÍCULOS</h5>
          <Input
            placeholder="Filtro"
            rightIcon={<GrSearch />}
            borderBottomOnly
            value={resourceListFilterText}
            onChange={(e) => setResourceListFilterText(e.target.value)}
            size="small"
          />
          {filteredByAnyResources.map((resourceItem, index) => (
            <div
              className="resourceListItem"
              key={`${resourceItem.id}${index}`}
            >
              <div>
                <h6>Tipo/Modelo:</h6>
                <span>{resourceItem.value1}</span>
              </div>
              <div>
                <h6>Descrição/Características:</h6>
                <span>{resourceItem.value2}</span>
              </div>
              <div>
                <h6>Quantidade:</h6>
                <span>{resourceItem.value3}</span>
              </div>
              <div>
                <h6>Endereço:</h6>
                <span>{resourceItem.formatttedAddress}</span>
              </div>
              <div>
                <h6>Contato:</h6>
                <div className="contactAttributeContainer">
                  {resourceItem.responsibles.map((responsible, index) => (
                    <span key={`${responsible.personId}${index}`}>
                      {responsible.name}, {responsible.phone}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Modal>
  );
};

export default CreateResourceModal;
