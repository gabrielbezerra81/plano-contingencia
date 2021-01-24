import React, { useState, useCallback, useEffect, useMemo } from "react";
import { LatLngLiteral } from "leaflet";
import L from "leaflet";
import { Map, TileLayer, Marker } from "react-leaflet";
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
  editingProps?: {
    setEditing: React.Dispatch<React.SetStateAction<boolean>>;
    address: Address;
  };
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
  editingProps,
}) => {
  const { getSequenceId } = usePlanData();

  const [mapRef, setMapRef] = useState<Map | null>(null);

  const [address, setAddress] = useState<Address>(() => {
    const addr = { ...emptyAddress };

    if (editingProps) {
      Object.assign(addr, editingProps.address);
    }

    return addr;
  });

  const [position, setPosition] = useState<LatLngLiteral | null>(null);

  const [validatedAddress, setValidatedAddress] = useState(false);

  const [showSearchError, setShowSearchError] = useState(false);
  const [highlightInputText, setHighlightInputText] = useState(false);

  const onExit = useCallback(() => {
    setAddress(() => {
      const clearedAddress = produce(address, (draft) => {
        Object.assign(draft, { ...emptyAddress });
      });

      return clearedAddress;
    });

    if (editingProps) {
      editingProps.setEditing(false);
    }

    setShow(false);
  }, [setShow, editingProps, address]);

  const handleSearchFromCEP = useCallback(
    async (e) => {
      e.preventDefault();

      try {
        const parsedCep = address.cep.replace("-", "");

        const response = await axios.get(
          `https://viacep.com.br/ws/${parsedCep}/json/`
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

        setHighlightInputText(true);

        setTimeout(() => {
          setHighlightInputText(false);
        }, 4000);
      } catch (error) {
        setShowSearchError(true);
        setTimeout(() => {
          setShowSearchError(false);
        }, 5000);
      }
    },
    [address.cep]
  );

  const handleEditCurrentAddress = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      setAddress((oldValue) => ({ ...oldValue, [name]: value }));
    },
    []
  );

  const handleAddAddress = useCallback(async () => {
    const id = await getSequenceId("enderecos");

    if (!id) {
      alert("Falha ao tentar adicionar o novo endereço, tente novamente.");
      return;
    }

    setExternalAddress({ ...address, id });

    if (selectAddress) {
      selectAddress();
    }

    setPosition(null);

    onExit();
  }, [address, setExternalAddress, selectAddress, getSequenceId, onExit]);

  const handleChangeLat = useCallback(
    (value: any) => {
      handleEditCurrentAddress({
        target: {
          name: "lat",
          value,
        },
      } as any);
    },
    [handleEditCurrentAddress]
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
    [handleAddAddress]
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
    [handleEditCurrentAddress]
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

  // Carregar localização, criar função para lidar com eventos de clique no mapa
  useEffect(() => {
    const map = mapRef?.leafletElement;

    if (map) {
      map.invalidateSize();
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
  }, [mapRef]);

  useEffect(() => {
    if (editingProps) {
      setAddress(editingProps.address);
    }
  }, [editingProps]);

  return (
    <Modal
      backdropClassName="addAddressModalWrapper"
      centered
      show={show}
      onHide={onExit}
    >
      <ModalCloseButton setShow={onExit} />
      <Container highlightInputText={highlightInputText}>
        <div className="borderedContainer">
          <label>Endereço do recurso</label>
          <MapAndAddressListContainer>
            <Map
              center={[-15.77972, -47.92972]}
              ref={setMapRef}
              style={{ height: 350, width: 350 }}
              zoom={3}
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
            </Map>
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
                  handleSearchFromCEP(e);
                }
              }}
              masked
              maskProps={{
                mask: "99999-999 ",
              }}
              onRightIconClick={handleSearchFromCEP}
              size="small"
              required
              isValidated={validatedAddress}
              errorMessage="Falha ao pesquisar CEP"
              hasError={showSearchError}
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
                containerClass="hightlightInputOnSearch"
              />
              <Input
                labelOnInput="Bairro:"
                borderBottomOnly
                name="neighbor"
                value={address.neighbor}
                onChange={handleEditCurrentAddress}
                containerClass="hightlightInputOnSearch"
              />
              <Input
                labelOnInput="Cidade:"
                borderBottomOnly
                name="city"
                value={address.city}
                onChange={handleEditCurrentAddress}
                required
                isValidated={validatedAddress}
                containerClass="hightlightInputOnSearch"
              />
              <Input
                labelOnInput="Estado:"
                borderBottomOnly
                name="state"
                value={address.state}
                onChange={handleEditCurrentAddress}
                required
                isValidated={validatedAddress}
                containerClass="hightlightInputOnSearch"
              />
              <Input
                labelOnInput="Complemento:"
                borderBottomOnly
                name="complement"
                value={address.complement}
                onChange={handleEditCurrentAddress}
                containerClass="hightlightInputOnSearch"
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
              </div>
            </main>
          </AddLocationContainer>
        </div>
      </Container>
    </Modal>
  );
};

export default AddressModal;
