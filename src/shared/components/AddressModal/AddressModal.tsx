import React, { useState, useCallback, useEffect } from "react";
import { LatLngLiteral } from "leaflet";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { GrSearch } from "react-icons/gr";
import axios from "axios";

import Input from "shared/components/Input/Input";
import { Button } from "react-bootstrap";
import { Address } from "types/Plan";

import {
  Modal,
  Container,
  MapAndAddressListContainer,
  AddLocationContainer,
} from "./styles";
import NumberInput from "../NumberInput/NumberInput";
import produce from "immer";
import numberFormatter from "shared/utils/format/numberFormatter";
import ModalCloseButton from "../ModalCloseButton/ModalCloseButton";
import { usePlanData } from "context/PlanData/planDataContext";

interface Props {
  show: boolean;
  setShow: (...data: any) => any;
  setExternalAddress: React.Dispatch<React.SetStateAction<Address | null>>;
  selectAddress?: (...data: any) => any;
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

const AddressModal: React.FC<Props> = ({
  show,
  setShow,
  setExternalAddress,
  selectAddress,
}) => {
  const { getSequenceId } = usePlanData();

  const [map, setMap] = useState<L.Map | null>(null);

  const [address, setAddress] = useState<Address>({
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
    number: "",
  });

  const [position, setPosition] = useState<LatLngLiteral | null>(null);

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
    const id = await getSequenceId("enderecos");

    setExternalAddress({ ...address, id });

    if (selectAddress) {
      selectAddress();
    }

    setAddress(() => {
      const clearedAddress = produce(address, (draft) => {
        Object.assign(draft, { ...emptyAddress });
      });

      return clearedAddress;
    });

    setShow(false);
  }, [address, setExternalAddress, setShow, selectAddress, getSequenceId]);

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

  // Carregar localização, criar função para lidar com eventos de clique no mapa
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

  return (
    <Modal
      backdropClassName="addAddressModalWrapper"
      centered
      show={show}
      onHide={() => setShow(false)}
    >
      <ModalCloseButton setShow={setShow} />
      <Container>
        <div className="borderedContainer">
          <label>Endereço do recurso</label>
          <MapAndAddressListContainer>
            <MapContainer
              center={[-15.77972, -47.92972]}
              style={{ height: 350, width: 350 }}
              zoom={3}
              whenCreated={(LMap) => {
                setMap(LMap);
              }}
            >
              <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {position === null ? null : (
                <Marker position={position}>
                  <Popup>You are here</Popup>
                </Marker>
              )}
            </MapContainer>

            {/* <AttributeListing
              showCloseButton={false}
              title="Endereço"
              items={[address]}
              name="addressItem"
              onRemove={() => {}}
              renderText={(addressItem: Address) =>
                formatResourceAddress(addressItem)
              }
            /> */}
          </MapAndAddressListContainer>

          <AddLocationContainer>
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
              size="small"
            />

            <main>
              <label>DESCRIÇÃO DO LOCAL</label>

              <Input
                labelOnInput="Nome/Identificação:"
                borderBottomOnly
                name="identification"
                value={address.identification}
                onChange={handleEditCurrentAddress}
              />
              <Input
                labelOnInput="Endereço:"
                borderBottomOnly
                name="street"
                value={address.street}
                onChange={handleEditCurrentAddress}
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
              />
              <Input
                labelOnInput="Estado:"
                borderBottomOnly
                name="state"
                value={address.state}
                onChange={handleEditCurrentAddress}
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
                <Button onClick={handleAddAddress}>Adicionar</Button>
              </div>
            </main>
          </AddLocationContainer>
        </div>
      </Container>
    </Modal>
  );
};

export default AddressModal;
