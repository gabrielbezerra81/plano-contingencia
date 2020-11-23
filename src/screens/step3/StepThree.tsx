import { LatLngLiteral } from "leaflet";
import React, { useCallback, useEffect, useState } from "react";
import L from "leaflet";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { GrSearch } from "react-icons/gr";

import { FiXCircle } from "react-icons/fi";

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
  lat: 0,
  long: 0,
};

const StepThree: React.FC = () => {
  const [map, setMap] = useState<L.Map | null>(null);
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
      lat: -6,
      long: -40,
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
    lat: 0,
    long: 0,
  });

  useEffect(() => {
    if (map) {
      map.locate();
      map.addOneTimeEventListener("locationfound", (e) => {
        setPosition(e.latlng);
        map.flyTo(e.latlng, 16);

        const latLong = {
          lat: +e.latlng.lat.toFixed(8),
          long: +e.latlng.lng.toFixed(8),
        };

        setAddress((oldValue) => ({ ...oldValue, ...latLong }));
      });
      map.addEventListener("click", (e: any) => {
        setPosition(e.latlng);

        const latLong = {
          lat: +e.latlng.lat.toFixed(8),
          long: +e.latlng.lng.toFixed(8),
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

  const handleSearchFromCEP = useCallback(() => {}, []);

  const handleEditCurrentAddress = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      let parsedValue: any = value;

      if (["lat", "long"].includes(name)) {
        parsedValue = Number(value);
      }

      setAddress((oldValue) => ({ ...oldValue, [name]: parsedValue }));
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

          <div>
            <label>Endereços cadastrados</label>

            {addressList.map((addressItem, index) => (
              <div className="addressItem" key={`${addressItem.name}${index}`}>
                <button onClick={() => handleRemoveAddress(index)}>
                  <FiXCircle></FiXCircle>
                </button>

                <span>
                  {addressItem.name}, {addressItem.address},{" "}
                  {addressItem.neighbor},{" "}
                  {!!addressItem.complement && `${addressItem.complement},`}{" "}
                  {addressItem.city}, {addressItem.state}
                </span>
              </div>
            ))}
          </div>
        </MapAndAddressListContainer>

        <AddLocationContainer>
          <Input
            rightIcon={<GrSearch />}
            placeholder="Digite o  CEP ou pesquise no mapa"
            borderBottomOnly
            onBlur={handleSearchFromCEP}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearchFromCEP();
              }
            }}
          />

          <main>
            <label>DESCRIÇÃO DO LOCAL</label>

            <Input
              containerClass="inputContainer"
              labelOnInput="Nome/Identificação:"
              borderBottomOnly
              name="name"
              value={address.name}
              onChange={handleEditCurrentAddress}
            />
            <Input
              containerClass="inputContainer"
              labelOnInput="Endereço:"
              borderBottomOnly
              name="address"
              value={address.address}
              onChange={handleEditCurrentAddress}
            />
            <Input
              containerClass="inputContainer"
              labelOnInput="Complemento:"
              borderBottomOnly
              name="complement"
              value={address.complement}
              onChange={handleEditCurrentAddress}
            />
            <Input
              containerClass="inputContainer"
              labelOnInput="Bairro:"
              borderBottomOnly
              name="neighbor"
              value={address.neighbor}
              onChange={handleEditCurrentAddress}
            />
            <Input
              containerClass="inputContainer"
              labelOnInput="Cidade:"
              borderBottomOnly
              name="city"
              value={address.city}
              onChange={handleEditCurrentAddress}
            />
            <Input
              containerClass="inputContainer"
              labelOnInput="Estado:"
              borderBottomOnly
              name="state"
              value={address.state}
              onChange={handleEditCurrentAddress}
            />
            <Input
              containerClass="inputContainer"
              labelOnInput="Ponto de Referência:"
              borderBottomOnly
              name="refPoint"
              value={address.refPoint}
              onChange={handleEditCurrentAddress}
            />
            <div className="latLongInputGroup">
              <Input
                value={address.lat === 0 ? "" : address.lat}
                labelOnInput="Latitude:"
                name="lat"
                borderBottomOnly
                onChange={handleEditCurrentAddress}
              />
              <Input
                value={address.long === 0 ? "" : address.long}
                labelOnInput="Longitude:"
                name="long"
                borderBottomOnly
                onChange={handleEditCurrentAddress}
              />
            </div>

            <div className="buttonsContainer">
              <Button onClick={handleAddAddress}>Cadastrar</Button>

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
