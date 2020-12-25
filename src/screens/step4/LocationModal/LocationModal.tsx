import { LatLngLiteral } from "leaflet";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import L from "leaflet";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { GrSearch } from "react-icons/gr";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import {
  Modal,
  Container,
  MapAndAddressListContainer,
  AddLocationContainer,
} from "./styles";
import Input from "shared/components/Input/Input";
import { Button } from "react-bootstrap";
import produce from "immer";
import axios from "axios";
import NumberInput from "shared/components/NumberInput/NumberInput";
import numberFormatter from "shared/utils/format/numberFormatter";
import AttributeListing from "shared/components/AttributeListing/AttributeListing";
import { RiskLocation } from "types/Plan";
import { usePlanData } from "context/PlanData/planDataContext";
import ModalCloseButton from "shared/components/ModalCloseButton/ModalCloseButton";
import formatRiskLocation from "shared/utils/format/formatRiskLocation";
import { useScenario } from "context/Scenario/scenarioContext";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

const emptyAddress: RiskLocation = {
  id: "",
  cep: "",
  identification: "",
  street: "",
  complement: "",
  neighbor: "",
  city: "",
  state: "Goiás",
  refPoint: "",
  lat: "",
  long: "",
};

interface Props {
  show: boolean;
  setShow: (...data: any) => void;
}

const LocationModal: React.FC<Props> = ({ show, setShow }) => {
  const { planData, addRiskLocation, removeRiskLocation } = usePlanData();

  const { addInitialScenarioLines } = useScenario();

  const [mapKey] = useState(Math.random());

  const [map, setMap] = useState<L.Map | null>(null);

  const [position, setPosition] = useState<LatLngLiteral | null>(null);

  const [address, setAddress] = useState<RiskLocation>({
    id: "",
    cep: "",
    identification: "",
    street: "",
    complement: "",
    neighbor: "",
    city: "",
    state: "Goiás",
    refPoint: "",
    lat: "",
    long: "",
  });

  const [validatedAddress, setValidatedAddress] = useState(false);

  useEffect(() => {
    if (map) {
      map.locate();
      map.addOneTimeEventListener("locationfound", (e) => {
        setPosition(e.latlng);
        map.flyTo(e.latlng, 16);

        const latLong = {
          lat: numberFormatter({
            value: e.latlng.lat,
            precision: 7,
          }),
          long: numberFormatter({
            value: e.latlng.lng,
            precision: 7,
          }),
        };

        setAddress((oldValue) => ({ ...oldValue, ...latLong }));
      });
      map.addEventListener("click", (e: any) => {
        setPosition(e.latlng);

        const latLong = {
          lat: numberFormatter({
            value: e.latlng.lat,
            precision: 7,
          }),
          long: numberFormatter({
            value: e.latlng.lng,
            precision: 7,
          }),
        };

        setAddress((oldValue) => ({ ...oldValue, ...latLong }));
      });
    }

    return () => {
      if (map) {
        map.clearAllEventListeners();
      }
    };
  }, [map]);

  const handleSearchFromCEP = useCallback(async () => {
    try {
      const parsedCep = address.cep.replace("-", "");

      const response = await axios.get(
        `https://viacep.com.br/ws/${parsedCep}/json/`,
      );

      const {
        logradouro: street,
        complemento: complement,
        bairro: neighbor,
        localidade: city,
        uf: state,
      } = response.data;

      setAddress((oldValue) => ({
        ...oldValue,
        street: street || "",
        complement: complement || "",
        neighbor: neighbor || "",
        city: city || "",
        state: state || "",
      }));
    } catch (error) {}
  }, [address.cep]);

  const handleEditCurrentAddress = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      setAddress((oldValue) => ({ ...oldValue, [name]: value }));
    },
    [],
  );

  const handleAddAddress = useCallback(async () => {
    await addRiskLocation(address);

    setAddress(() => {
      const clearedAddress = produce(address, (draft) => {
        Object.assign(draft, { ...emptyAddress });
      });

      return clearedAddress;
    });
  }, [address, addRiskLocation]);

  const handleChooseFile = useCallback(() => {}, []);

  const handleChangeLat = useCallback(
    (value: any) => {
      handleEditCurrentAddress({
        target: {
          name: "lat",
          value,
        },
      } as any);
    },
    [handleEditCurrentAddress],
  );

  const handleChangeLong = useCallback(
    (value: any) => {
      handleEditCurrentAddress({
        target: {
          name: "long",
          value,
        },
      } as any);
    },
    [handleEditCurrentAddress],
  );

  const handleAddLocationToScenario = useCallback(
    (location: RiskLocation) => {
      addInitialScenarioLines({
        attr: "addressId",
        value: location.id,
      });

      setShow(false);
    },
    [addInitialScenarioLines, setShow],
  );

  const handleSubmitForm = useCallback(
    (event) => {
      const form = event.currentTarget;

      event.preventDefault();

      if (form.checkValidity() === false) {
        event.stopPropagation();
      } //
      else {
        handleAddAddress();
        setValidatedAddress(false);

        return;
      }

      setValidatedAddress(true);
    },
    [handleAddAddress],
  );

  const markerEventHandlers = useMemo(() => {
    return {
      dragend: (event: L.DragEndEvent) => {
        const { _latlng } = event.target;
        setPosition(_latlng);

        const latLong = {
          lat: numberFormatter({
            value: _latlng.lat,
            precision: 7,
          }),
          long: numberFormatter({
            value: _latlng.lng,
            precision: 7,
          }),
        };

        setAddress((oldValue) => ({ ...oldValue, ...latLong }));
      },
    };
  }, []);

  return (
    <Modal show={show} centered onHide={() => setShow(false)}>
      <Container>
        <h6>Adicione locais de risco</h6>
        <ModalCloseButton setShow={setShow} />

        <main>
          <MapAndAddressListContainer>
            <MapContainer
              center={[-15.77972, -47.92972]}
              style={{ height: 500, minWidth: 500, flex: 1 }}
              zoom={3}
              whenCreated={(LMap) => {
                setMap(LMap);
              }}
              key={mapKey}
            >
              <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {position === null ? null : (
                <Marker
                  position={position}
                  draggable
                  eventHandlers={markerEventHandlers}
                />
              )}
            </MapContainer>

            <AttributeListing
              title="Endereços cadastrados"
              items={planData.riskLocations}
              name="addressItem"
              onRemove={(_, index) => removeRiskLocation(index)}
              children={(index: number, addressItem: RiskLocation) => {
                return (
                  <>
                    <span>{formatRiskLocation(addressItem)}</span>
                    <Button
                      style={{ marginLeft: 16, height: 24, fontSize: 11 }}
                      className="darkBlueButton"
                      size="sm"
                      onClick={() => handleAddLocationToScenario(addressItem)}
                    >
                      Selecionar este endereço
                    </Button>
                  </>
                );
              }}
            />
          </MapAndAddressListContainer>

          <AddLocationContainer
            noValidate
            onSubmit={handleSubmitForm}
            validated={validatedAddress}
          >
            <Input
              rightIcon={<GrSearch />}
              value={address.cep}
              name="cep"
              onChange={handleEditCurrentAddress}
              placeholder="Digite o  CEP ou pesquise no mapa"
              borderBottomOnly
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearchFromCEP();
                }
              }}
              masked
              maskProps={{ mask: "99999-999" }}
              onRightIconClick={handleSearchFromCEP}
              required
              isValidated={validatedAddress}
            />

            <main>
              <label>DESCRIÇÃO DO LOCAL</label>

              <Input
                labelOnInput="Nome/Identificação:"
                borderBottomOnly
                name="identification"
                value={address.identification}
                onChange={handleEditCurrentAddress}
                required
                isValidated={validatedAddress}
              />
              <Input
                labelOnInput="Endereço:"
                borderBottomOnly
                name="street"
                value={address.street}
                onChange={handleEditCurrentAddress}
                required
                isValidated={validatedAddress}
              />
              <Input
                labelOnInput="Bairro:"
                borderBottomOnly
                name="neighbor"
                value={address.neighbor}
                onChange={handleEditCurrentAddress}
              />
              <Input
                labelOnInput="Cidade:"
                borderBottomOnly
                name="city"
                value={address.city}
                onChange={handleEditCurrentAddress}
                required
                isValidated={validatedAddress}
              />
              <Input
                labelOnInput="Estado:"
                borderBottomOnly
                name="state"
                value={address.state}
                onChange={handleEditCurrentAddress}
                required
                isValidated={validatedAddress}
              />
              <Input
                labelOnInput="Complemento:"
                borderBottomOnly
                name="complement"
                value={address.complement}
                onChange={handleEditCurrentAddress}
              />
              <Input
                labelOnInput="Ponto de Referência:"
                borderBottomOnly
                name="refPoint"
                value={address.refPoint}
                onChange={handleEditCurrentAddress}
              />
              <div className="latLongInputGroup">
                <Input
                  labelOnInput="Latitude:"
                  borderBottomOnly
                  customInput={
                    <NumberInput
                      name="lat"
                      allowNegative
                      precision={7}
                      step={0.0000001}
                      value={address.lat}
                      onChange={handleChangeLat}
                      type="negativeDecimal"
                    />
                  }
                />
                <Input
                  labelOnInput="Longitude:"
                  borderBottomOnly
                  customInput={
                    <NumberInput
                      name="long"
                      allowNegative
                      precision={7}
                      step={0.0000001}
                      value={address.long}
                      onChange={handleChangeLong}
                      type="negativeDecimal"
                    />
                  }
                />
              </div>

              <div className="buttonsContainer">
                <Button type="submit">Adicionar</Button>

                <Button
                  onClick={handleChooseFile}
                  size="sm"
                  variant="secondary"
                >
                  Escolher arquivo
                </Button>
              </div>
            </main>
          </AddLocationContainer>
        </main>
      </Container>
    </Modal>
  );
};

export default LocationModal;
