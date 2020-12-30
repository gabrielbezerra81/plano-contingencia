import { usePlanData } from "context/PlanData/planDataContext";
import produce from "immer";
import React, { useCallback, useMemo, useState } from "react";

import Select from "react-select";
import * as yup from "yup";

import { Button, Accordion, Form } from "react-bootstrap";
import { GrSearch } from "react-icons/gr";
import {
  Address,
  Member,
  Resource,
  ResourceType,
  Responsible,
  ScenarioResource,
} from "types/Plan";
import AttributeListing from "../AttributeListing/AttributeListing";
import Input from "../Input/Input";

import { Modal, Container, ResourceAccordionItem } from "./styles";
import AddToGroupModal from "../AddToGroupModal/AddToGroupModal";
import AddressModal from "../AddressModal/AddressModal";
import formatResourceAddress from "shared/utils/format/formatResourceAddress";
import formatResources from "shared/utils/format/formatResources";
import NumberInput from "../NumberInput/NumberInput";
import ModalCloseButton from "../ModalCloseButton/ModalCloseButton";
import AddResponsibleModal from "../AddResponsibleModal/AddResponsibleModal";
import { useAddScenario } from "context/Scenario/addScenarioContext";
import { FiEdit, FiX } from "react-icons/fi";
import Alert from "../Alert/Alert";

interface Props {
  show: boolean;
  setShow: (...data: any) => any;
  type: ResourceType;
}

const emptyAddress: Address = {
  id: "",
  cep: "",
  identification: "",
  street: "",
  complement: "",
  neighbor: "",
  city: "",
  state: "",
  refPoint: "",
  lat: "",
  long: "",
};

const emptyResource: Resource = {
  id: "",
  address: { ...emptyAddress },
  responsibles: [],
  type: "" as any,
  value1: "",
  value2: "",
  value3: "",
};

const CreateResourceModal: React.FC<Props> = ({ show, setShow, type }) => {
  const { planData, addResource } = usePlanData();

  const { handleAddValueToScenario, generateMergeKey } = useAddScenario();

  const [activeKey, setActiveKey] = useState<string | null>("0");

  const [resource, setResource] = useState<Resource>({
    id: "",
    address: { ...emptyAddress },
    responsibles: [],
    type,
    value1: "",
    value2: "",
    value3: "",
  });

  const [addressFilterText, setAddressFilterText] = useState("");
  const [resourceListFilterText, setResourceListFilterText] = useState("");
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<
    number | null
  >(planData.resources.length ? 0 : null);

  const [
    currentAddedAddress,
    setCurrentAddedAddress,
  ] = useState<Address | null>(null);
  const [editingCurrentAddress, setEditingCurrentAddress] = useState(false);

  const [showAddToGroupModal, setShowAddToGroupModal] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showAddResponsibleModal, setShowAddResponsibleModal] = useState(false);

  const [
    selectedResponsibleToAdd,
    setSelectedResponsibleToAdd,
  ] = useState<Responsible | null>(null);

  const [validatedResource, setValidatedResource] = useState(false);

  const validationSchema = useMemo(
    () =>
      yup.object().shape({
        value1: yup.string().required(),
        value2: yup.string().required(),
        value3: yup.string().when({
          is: () => type === "veiculo",
          then: yup.string().required(),
          otherwise: yup.string().optional(),
        }),
      }),
    [type],
  );

  const handleEditCurrentResource = useCallback(
    (e) => {
      const { name, value } = e.target;

      const updatedResource = produce(resource, (draft) => {
        if (name === "responsibles") {
          draft.responsibles.push(value);
        } //
        else {
          Object.assign(draft, { [name]: value });
        }
      });

      setResource(updatedResource);
    },
    [resource],
  );

  const handleRemoveResponsible = useCallback(
    (index: number) => {
      const updatedResource = produce(resource, (draft) => {
        draft.responsibles.splice(index, 1);
      });

      setResource(updatedResource);
    },
    [resource],
  );

  const openAddToGroupModal = useCallback(() => {
    setShowAddToGroupModal(true);
  }, []);

  const openAddAddressModal = useCallback(() => {
    setShowAddAddressModal(true);
  }, []);

  const handleSelectResponsibleAndOpenModal = useCallback((member: Member) => {
    setShowAddResponsibleModal(true);

    setSelectedResponsibleToAdd({ ...member, role: "" });
  }, []);

  const addResourceToScenario = useCallback(
    (resource: Resource) => {
      const resourceValue: ScenarioResource = {
        resourceId: resource.id,
        mergeKey: generateMergeKey(),
      };

      handleAddValueToScenario({ attr: "resourceId", value: resourceValue });
    },
    [generateMergeKey, handleAddValueToScenario],
  );

  const clearInputs = useCallback(() => {
    const clearedResource = produce(resource, (draft) => {
      Object.assign(draft, emptyResource);
    });

    setResource(clearedResource);
  }, [resource]);

  const handleIncludeResourceInPlan = useCallback(async () => {
    let address = resource.address;

    if (!resource.responsibles.length) {
      alert("Por favor, indique um contato para incluir um novo recurso.");
      return;
    }

    if (!!currentAddedAddress && selectedAddressIndex === -2) {
      address = currentAddedAddress;
    } //
    else if (
      typeof selectedAddressIndex === "number" &&
      selectedAddressIndex >= 0
    ) {
      address = planData.resources[selectedAddressIndex].address;
    }

    if (!address?.city) {
      alert(
        "Por favor, indique o endereço do recurso para incluir um novo recurso.",
      );
    }

    await addResource({ ...resource, address, type });

    setActiveKey("0");

    clearInputs();
  }, [
    addResource,
    resource,
    selectedAddressIndex,
    currentAddedAddress,
    type,
    clearInputs,
    planData,
  ]);

  const handleSubmit = useCallback(
    async (event) => {
      const form = event.currentTarget;

      event.preventDefault();

      let isValid = false;

      try {
        const validation = await validationSchema.validate({
          value1: resource.value1,
          value2: resource.value2,
          value3: resource.value3,
        });
        isValid = !!validation;
      } catch (error) {}

      if (form.checkValidity() === false || !isValid) {
        event.stopPropagation();
      } //
      else {
        setValidatedResource(false);
        handleIncludeResourceInPlan();
        return;
      }

      setValidatedResource(true);
    },
    [validationSchema, handleIncludeResourceInPlan, resource],
  );

  const onExit = useCallback(() => {
    setShow(false);
    setValidatedResource(false);
  }, [setShow, setValidatedResource]);

  const formattedResources = useMemo(() => {
    const formatted = formatResources(planData.resources);

    if (formatted.length) {
      setSelectedAddressIndex(0);
    }

    return formatted;
  }, [planData]);

  const filteredByAddressResources = useMemo(() => {
    const filterRepeated: Array<Resource & { formattedAddress: string }> = [];

    formattedResources.forEach((resourceItem) => {
      const alreadyAdded = filterRepeated.some(
        (added) => added.formattedAddress === resourceItem.formattedAddress,
      );

      if (!alreadyAdded) {
        filterRepeated.push(resourceItem);
      }
    });

    if (addressFilterText) {
      return filterRepeated.filter((resourceItem) =>
        resourceItem.formattedAddress
          .toLocaleLowerCase()
          .includes(addressFilterText.toLocaleLowerCase()),
      );
    }

    return filterRepeated;
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

        const addressCondition = resourceItem.formattedAddress
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

  const contactSelectOptions = useMemo(() => {
    return planData.workGroup.map((member, index) => ({
      value: member,
      label: member.name,
    }));
  }, [planData]);

  const formattedCurrentAddedAddress = useMemo(() => {
    if (!currentAddedAddress) {
      return "";
    }

    const formatted = formatResourceAddress(currentAddedAddress);

    if (addressFilterText) {
      const includes = formatted
        .toLocaleLowerCase()
        .includes(addressFilterText.toLocaleLowerCase());

      if (includes) {
        return formatted;
      }

      return "";
    }

    return formatted;
  }, [currentAddedAddress, addressFilterText]);

  const inputLabels = useMemo(() => {
    const labels = {
      label1: "",
      label2: "",
      label3: "",
    };

    switch (type) {
      case "veiculo":
        labels.label1 = "Tipo/Modelo: ";
        labels.label2 = "Descrição/Características: ";
        labels.label3 = "Quantidade: ";
        break;
      case "abrigo":
        labels.label1 = "Tipo do Local: ";
        labels.label2 = "Capacidade de Pessoas: ";
        break;
      case "dinheiro":
        labels.label1 = "Destinação: ";
        labels.label2 = "Valor: ";
        break;
      default:
        break;
    }

    if (["material", "alimentacao"].includes(type)) {
      labels.label1 = "Descrição/Características: ";
      labels.label2 = "Quantidade: ";
    }

    return labels;
  }, [type]);

  const titles = useMemo(() => {
    const titles = {
      modalTitle: "",
      listTitle: "",
    };

    switch (type) {
      case "veiculo":
        titles.modalTitle = "Veículo";
        titles.listTitle = "LISTA DE VEÍCULOS";
        break;
      case "material":
        titles.modalTitle = "Material";
        titles.listTitle = "LISTA DE MATERIAIS";
        break;
      case "alimentacao":
        titles.modalTitle = "Alimentação";
        titles.listTitle = "RECURSOS DE ALIMENTAÇÃO";
        break;
      case "abrigo":
        titles.modalTitle = "Abrigo";
        titles.listTitle = "LISTA DE ABRIGOS";
        break;
      case "dinheiro":
        titles.modalTitle = "Dinheiro";
        titles.listTitle = "RECURSOS FINANCEIROS";
        break;
      default:
        break;
    }

    titles.listTitle += " CADASTRADOS";

    return titles;
  }, [type]);

  const handleRemoveResourceAddress = useCallback(() => {
    Alert({
      title: "Deseja remover este endereço?",
      message: formattedCurrentAddedAddress,
      onPositiveClick: () => {
        setCurrentAddedAddress(null);
      },
    });
  }, [formattedCurrentAddedAddress]);

  const handleOpenAddressToEdit = useCallback(() => {
    setEditingCurrentAddress(true);
    setShowAddAddressModal(true);
  }, []);

  return (
    <>
      <Modal
        backdropClassName="createResourceModalWrapper"
        centered
        show={show}
        onHide={onExit}
        styled={{
          isBehindModal: showAddToGroupModal || showAddResponsibleModal,
        }}
        onExit={clearInputs}
      >
        <ModalCloseButton setShow={onExit} />
        <Container>
          <div className="borderedContainer">
            <label>{titles.modalTitle}</label>

            <Form
              noValidate
              validated={validatedResource}
              onSubmit={handleSubmit}
              id="resourceForm"
            >
              <Input
                name="value1"
                labelOnInput={inputLabels.label1}
                borderBottomOnly
                value={resource.value1}
                onChange={handleEditCurrentResource}
                isValidated={validatedResource}
                required
              />

              <Input
                name="value2"
                labelOnInput={inputLabels.label2}
                borderBottomOnly
                value={resource.value2}
                onChange={handleEditCurrentResource}
                isValidated={validatedResource}
                required
                customInput={
                  type === "dinheiro" ? (
                    <NumberInput
                      name="value2"
                      precision={2}
                      step={1}
                      value={resource.value2}
                      onChange={(_, event) => handleEditCurrentResource(event)}
                      type="negativeDecimal"
                      required
                    />
                  ) : null
                }
              />
              {!!inputLabels.label3 && (
                <Input
                  name="value3"
                  labelOnInput={inputLabels.label3}
                  borderBottomOnly
                  value={resource.value3}
                  onChange={handleEditCurrentResource}
                  isValidated={validatedResource}
                  required
                />
              )}
            </Form>
            <div>
              <Accordion
                onSelect={setActiveKey}
                activeKey={activeKey || undefined}
              >
                <ResourceAccordionItem selected={activeKey === "0"}>
                  <Accordion.Toggle as="div" eventKey="0">
                    <header>
                      <h5>Indique um Contato</h5>
                    </header>
                  </Accordion.Toggle>

                  <Accordion.Collapse eventKey="0">
                    <div className="accordionItemContent contactContent">
                      <Select
                        value={"" as any}
                        name="responsibles"
                        noOptionsMessage={() => "Nenhum responsável encontrado"}
                        placeholder="Adicionar um responsavel"
                        options={contactSelectOptions}
                        onChange={({ value }: any) => {
                          handleSelectResponsibleAndOpenModal(value);
                        }}
                      />

                      <AttributeListing
                        items={resource.responsibles}
                        size="small"
                        title="Responsáveis cadastrados"
                        name=""
                        onRemove={(e, index) => handleRemoveResponsible(index)}
                        renderText={(responsibleItem: any) =>
                          responsibleItem.name
                        }
                      />
                      <Button
                        onClick={openAddToGroupModal}
                        className="darkBlueButton"
                        size="sm"
                      >
                        Novo +
                      </Button>
                    </div>
                  </Accordion.Collapse>
                </ResourceAccordionItem>

                <ResourceAccordionItem selected={activeKey === "1"}>
                  <Accordion.Toggle as="div" eventKey="1">
                    <header>
                      <h5>Indique o Endereço do Recurso</h5>
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

                      {filteredByAddressResources.map((resourceItem, index) => {
                        if (!resourceItem.formattedAddress) {
                          return null;
                        }

                        return (
                          <Form.Check
                            key={index}
                            type="radio"
                            label={resourceItem.formattedAddress}
                            name="resourceAddressRadio"
                            checked={selectedAddressIndex === index}
                            onChange={() => {
                              setSelectedAddressIndex(index);
                              handleEditCurrentResource({
                                target: {
                                  name: "address",
                                  value: resourceItem.address,
                                },
                              });
                            }}
                          />
                        );
                      })}
                      {!!currentAddedAddress && !!formattedCurrentAddedAddress && (
                        <div className="addressListingItem">
                          <button onClick={handleRemoveResourceAddress}>
                            <FiX color="#dc3545" />
                          </button>
                          <button onClick={handleOpenAddressToEdit}>
                            <FiEdit size={13} color="#3d3d3d" />
                          </button>
                          <Form.Check
                            type="radio"
                            label={formattedCurrentAddedAddress}
                            name="resourceAddressRadio"
                            checked={selectedAddressIndex === -2}
                            onChange={() => {
                              setSelectedAddressIndex(-2);
                              handleEditCurrentResource({
                                target: {
                                  name: "address",
                                  value: currentAddedAddress,
                                },
                              });
                            }}
                          />
                        </div>
                      )}

                      <Button
                        onClick={openAddAddressModal}
                        className="darkBlueButton"
                        size="sm"
                      >
                        Novo +
                      </Button>
                    </div>
                  </Accordion.Collapse>
                </ResourceAccordionItem>
              </Accordion>
            </div>

            <Button
              form="resourceForm"
              type="submit"
              className="darkBlueButton"
            >
              Incluir Novo Recurso
            </Button>
          </div>

          <div className="resourceListing">
            <h5>{titles.listTitle}</h5>
            <Input
              placeholder="Filtro"
              rightIcon={<GrSearch />}
              borderBottomOnly
              value={resourceListFilterText}
              onChange={(e) => setResourceListFilterText(e.target.value)}
              size="small"
            />
            {filteredByAnyResources.map((resourceItem, index) => {
              if (resourceItem.type !== type) {
                return null;
              }

              return (
                <div
                  className="resourceListItem"
                  key={`${resourceItem.id}${index}`}
                >
                  <Button
                    className="darkBlueButton"
                    size="sm"
                    onClick={() => addResourceToScenario(resourceItem)}
                  >
                    Adicionar este recurso
                  </Button>
                  <div>
                    <h6>{inputLabels.label1}</h6>
                    <span>{resourceItem.value1}</span>
                  </div>
                  <div>
                    <h6>{inputLabels.label2}</h6>
                    <span>
                      {resourceItem.formattedValue2 || resourceItem.value2}
                    </span>
                  </div>
                  {!!inputLabels.label3 && (
                    <div>
                      <h6>{inputLabels.label3}</h6>
                      <span>{resourceItem.value3}</span>
                    </div>
                  )}
                  <div>
                    <h6>Endereço:</h6>
                    <span>{resourceItem.formattedAddress}</span>
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
              );
            })}
          </div>
        </Container>
      </Modal>
      {!!selectedResponsibleToAdd && (
        <AddResponsibleModal
          show={showAddResponsibleModal}
          setShow={setShowAddResponsibleModal}
          responsible={selectedResponsibleToAdd}
          setResponsible={setSelectedResponsibleToAdd}
          addResponsible={handleEditCurrentResource}
        />
      )}

      <AddToGroupModal
        show={showAddToGroupModal}
        setShow={setShowAddToGroupModal}
      />
      <AddressModal
        show={showAddAddressModal}
        setShow={setShowAddAddressModal}
        setExternalAddress={setCurrentAddedAddress}
        selectAddress={() => setSelectedAddressIndex(-2)}
        editingProps={
          editingCurrentAddress && currentAddedAddress
            ? {
                setEditing: setEditingCurrentAddress,
                address: currentAddedAddress,
              }
            : undefined
        }
      />
    </>
  );
};

export default CreateResourceModal;
