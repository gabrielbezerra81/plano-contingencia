import { LatLngLiteral } from "leaflet";
import React, { useCallback, useEffect, useState } from "react";
import L from "leaflet";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { GrSearch } from "react-icons/gr";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import {
  Container,
  MapAndAddressListContainer,
  AddLocationContainer,
} from "./styles";
import Input from "shared/components/Input/Input";
import { Button } from "react-bootstrap";
import Address from "types/Address";
import produce from "immer";
import axios from "axios";
import NumberInput from "shared/components/NumberInput/NumberInput";
import numberFormatter from "shared/utils/numberFormatter";
import AttributeListing from "shared/components/AttributeListing/AttributeListing";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

const emptyAddress: Address = {
  name: "",
  address: "",
  complement: "",
  neighbor: "",
  city: "",
  state: "",
  refPoint: "",
  lat: "",
  long: "",
};

interface Props {
  selectedTabIndex: number;
}

const StepThree: React.FC<Props> = ({ selectedTabIndex }) => {
  const [loadMap, setLoadMap] = useState(false);
  const [mapKey, setMapKey] = useState(Math.random());

  const [map, setMap] = useState<L.Map | null>(null);

  const [cep, setCep] = useState("");
  const [position, setPosition] = useState<LatLngLiteral | null>(null);
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
  ]);

  const [address, setAddress] = useState<Address>({
    name: "",
    address: "",
    complement: "",
    neighbor: "",
    city: "",
    state: "",
    refPoint: "",
    lat: "",
    long: "",
  });

  useEffect(() => {
    if (map) {
      map.locate();
      map.addOneTimeEventListener("locationfound", (e) => {
        setPosition(e.latlng);
        map.flyTo(e.latlng, 16);

        const latitude = e.latlng.lat.toFixed(7);
        const longitude = e.latlng.lng.toFixed(7);

        const latLong = {
          lat: numberFormatter({
            value: latitude,
            precision: 7,
            fromSeparator: ".",
            toSeparator: ",",
          }),
          long: numberFormatter({
            value: longitude,
            precision: 7,
            fromSeparator: ".",
            toSeparator: ",",
          }),
        };

        setAddress((oldValue) => ({ ...oldValue, ...latLong }));
      });
      map.addEventListener("click", (e: any) => {
        setPosition(e.latlng);

        const latitude = e.latlng.lat.toFixed(7);
        const longitude = e.latlng.lng.toFixed(7);

        const latLong = {
          lat: numberFormatter({
            value: latitude,
            precision: 7,
            fromSeparator: ".",
            toSeparator: ",",
          }),
          long: numberFormatter({
            value: longitude,
            precision: 7,
            fromSeparator: ".",
            toSeparator: ",",
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
      const parsedCep = cep.replace("-", "");

      const response = await axios.get(
        `https://viacep.com.br/ws/${parsedCep}/json/`,
      );

      const {
        logradouro: address,
        complemento: complement,
        bairro: neighbor,
        localidade: city,
        uf: state,
      } = response.data;

      setAddress((oldValue) => ({
        ...oldValue,
        address: address || "",
        complement: complement || "",
        neighbor: neighbor || "",
        city: city || "",
        state: state || "",
      }));
    } catch (error) {}
  }, [cep]);

  const handleEditCurrentAddress = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      setAddress((oldValue) => ({ ...oldValue, [name]: value }));
    },
    [],
  );

  const handleRemoveAddress = useCallback(
    (index: number) => {
      const updatedAddressList = produce(addressList, (draft) => {
        draft.splice(index, 1);
      });

      setAddressList(updatedAddressList);
    },
    [addressList],
  );

  const handleAddAddress = useCallback(() => {
    const updatedAddressList = produce(addressList, (draft) => {
      draft.push(address);
    });

    setAddressList(updatedAddressList);

    setAddress(() => {
      const clearedAddress = produce(address, (draft) => {
        Object.assign(draft, { ...emptyAddress });
      });

      return clearedAddress;
    });
  }, [address, addressList]);

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

  useEffect(() => {
    if (selectedTabIndex !== 3) {
      setLoadMap(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedTabIndex === 3 && loadMap && map) {
      setMapKey(Math.random());

      setLoadMap(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTabIndex, loadMap, map]);

  return (
    <Container>
      <h6>Orientação: pode ser inserido mais de um endereço</h6>

      <main>
        <MapAndAddressListContainer>
          <MapContainer
            center={[-15.77972, -47.92972]}
            style={{ height: 460, width: 600 }}
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
              <Marker position={position}>
                <Popup>You are here</Popup>
              </Marker>
            )}
          </MapContainer>

          <AttributeListing
            title="Endereços cadastrados"
            items={addressList}
            name="addressItem"
            onRemove={(e, index) => handleRemoveAddress(index)}
            renderText={(addressItem: Address) => {
              const complement = addressItem.complement
                ? `${addressItem.complement},`
                : "";

              return `${addressItem.name}, ${addressItem.address}, ${addressItem.neighbor}, ${complement} ${addressItem.city}, ${addressItem.state}`;
            }}
          />
        </MapAndAddressListContainer>

        <AddLocationContainer>
          <Input
            rightIcon={<GrSearch />}
            value={cep}
            onChange={(e) => setCep(e.target.value)}
            placeholder="Digite o  CEP ou pesquise no mapa"
            borderBottomOnly
            onBlur={handleSearchFromCEP}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearchFromCEP();
              }
            }}
            masked
            maskProps={{ mask: "99999-999" }}
          />

          <main>
            <label>DESCRIÇÃO DO LOCAL</label>

            <Input
              labelOnInput="Nome/Identificação:"
              borderBottomOnly
              name="name"
              value={address.name}
              onChange={handleEditCurrentAddress}
            />
            <Input
              labelOnInput="Endereço:"
              borderBottomOnly
              name="address"
              value={address.address}
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

              <Button onClick={handleChooseFile} size="sm" variant="secondary">
                Escolher arquivo
              </Button>
            </div>
          </main>
        </AddLocationContainer>
      </main>
    </Container>
  );
};

export default StepThree;
