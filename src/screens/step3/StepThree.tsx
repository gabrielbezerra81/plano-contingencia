import { LatLngLiteral } from "leaflet";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import L from "leaflet";

import { Map, TileLayer, Marker } from "react-leaflet";
import JSZip from "jszip";

import { GrSearch } from "react-icons/gr";
import { kml as KMLP } from "@tmcw/togeojson";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import {
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
import { useSystem } from "context/System/systemContext";
import formatRiskLocation from "shared/utils/format/formatRiskLocation";
import DrawControl from "shared/components/DrawControl/DrawControl";

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

const StepThree: React.FC = () => {
  const { selectedTabIndex, setSelectedTab, isOpenLeftSideMenu } = useSystem();

  const {
    planData,
    addRiskLocation,
    removeRiskLocation,
    getSequenceId,
  } = usePlanData();

  const mapRef = useRef<Map | null>(null);

  const [loadMap, setLoadMap] = useState(false);

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

  const [kmlFiles, setKmlFiles] = useState<File[]>([]);
  const [addedKMLs, setAddedKMLs] = useState<string[]>(() => {
    const kmls = localStorage.getItem("addedKMLs");

    if (kmls) {
      return JSON.parse(kmls);
    }

    return [];
  });

  const [showSearchError, setShowSearchError] = useState(false);
  const [highlightInputText, setHighlightInputText] = useState(false);

  // Carregar localização, adicionar eventos de clique no mapa;
  useEffect(() => {
    const map = mapRef.current?.leafletElement;

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
  }, []);

  const handleSearchFromCEP = useCallback(
    async (e) => {
      if (e) {
        e.preventDefault();
      }

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
    [address.cep],
  );

  const handleEditCurrentAddress = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      setAddress((oldValue) => ({ ...oldValue, [name]: value }));
    },
    [],
  );

  const handleAddAddress = useCallback(async () => {
    const id = await getSequenceId("enderecos");

    await addRiskLocation({ ...address, id });

    setAddress(() => {
      const clearedAddress = produce(address, (draft) => {
        Object.assign(draft, { ...emptyAddress });
      });

      return clearedAddress;
    });
  }, [address, addRiskLocation, getSequenceId]);

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

  const addKMLToMap = useCallback((kmlText: string) => {
    const parser = new DOMParser();

    const kml = parser.parseFromString(kmlText, "text/xml");

    const convertedWithStyles = KMLP(kml, { styles: true });

    const polygons = convertedWithStyles.features.filter(
      (item: any) => !!item.geometry && item.geometry.type !== "Point",
    );

    // const points = convertedWithStyles.features.filter(
    //   (item: any) => !!item.geometry && item.geometry.type === "Point",
    // );

    const styleKeys = [
      "fill",
      "fill-opacity",
      "stroke",
      "stroke-opacity",
      "color",
      "stroke-width",
    ];

    polygons.forEach((polygon: any) => {
      const style = Object.keys(polygon.properties)
        .filter((key) => styleKeys.includes(key))
        .reduce((obj: any, key: any) => {
          obj[key] = polygon.properties[key];
          return obj;
        }, {});

      if (style.fill) {
        style.color = style.fill;
      }

      if (mapRef.current?.leafletElement) {
        L.geoJSON(polygon, { style }).addTo(mapRef.current.leafletElement);
      }
    });
  }, []);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length) {
        try {
          const file = e.target.files[0];

          const kmlFilesText: string[] = [];

          if (file.name.includes(".kmz")) {
            const zip = new JSZip();

            const loadedKMZ = await zip.loadAsync(file);

            for (const key in loadedKMZ.files) {
              if (key.includes(".kml")) {
                const content = await loadedKMZ.files[key].async("text");

                kmlFilesText.push(content);
              }
            }
          } //
          else {
            const content = await file.text();

            kmlFilesText.push(content);
          }

          kmlFilesText.forEach((content) => {
            addKMLToMap(content);
          });

          setKmlFiles((oldValues) => [...oldValues, file]);
          setAddedKMLs((oldValues) => [...oldValues, ...kmlFilesText]);
        } catch (error) {
          console.log(error);
        }

        // setGeojson(polygons);

        // const track = new L.KML(kml);

        // map.addLayer(track);

        // Instantiate KMZ layer (async)
        // var kmz = KMZLayer().addTo(map);

        // kmz.on("load", function (e: any) {
        //   control.addOverlay(e.layer, e.name);
        //   // e.layer.addTo(map);
        // });

        // // Add remote KMZ files as layers (NB if they are 3rd-party servers, they MUST have CORS enabled)
        // kmz.load("https://raruto.github.io/leaflet-kmz/examples/regions.kmz");
        // kmz.load("https://raruto.github.io/leaflet-kmz/examples/capitals.kmz");
        // kmz.load("https://raruto.github.io/leaflet-kmz/examples/globe.kmz");

        // var control = L.control
        //   .layers(undefined, undefined, { collapsed: false })
        //   .addTo(map);

        // var control = L.control
        //   .layers(undefined, undefined, { collapsed: false })
        //   .addTo(map);

        // setMapKey(Math.random())
      }
    },
    [addKMLToMap],
  );

  const handleNavigateNextTab = useCallback(() => {
    setSelectedTab(`tab${selectedTabIndex + 1}`);
  }, [selectedTabIndex, setSelectedTab]);

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

  // Permitir atualizar mapa se carregar a página em outra aba senão a terceira
  useEffect(() => {
    if (selectedTabIndex !== 3) {
      setLoadMap(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Atualizar mapa quando vem de outra aba
  useEffect(() => {
    if (selectedTabIndex === 3 && loadMap) {
      mapRef.current?.leafletElement.invalidateSize();

      setLoadMap(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTabIndex, loadMap]);

  // Salvar KMLs adicionados
  useEffect(() => {
    localStorage.setItem("addedKMLs", JSON.stringify(addedKMLs));
  }, [addedKMLs]);

  // Carregar KMLs salvos no armazenamento
  useEffect(() => {
    const kmls = localStorage.getItem("addedKMLs");

    if (kmls) {
      const parsedKMLs: string[] = JSON.parse(kmls);

      parsedKMLs.forEach((content) => {
        addKMLToMap(content);
      });
    }
  }, [addKMLToMap]);

  useEffect(() => {
    if (!isOpenLeftSideMenu) {
      setTimeout(function () {
        mapRef.current?.leafletElement.invalidateSize();
      }, 500);
    }
  }, [isOpenLeftSideMenu]);

  return (
    <Container highlightInputText={highlightInputText}>
      <h6>Orientação: pode ser inserido mais de um endereço</h6>

      <main>
        <MapAndAddressListContainer>
          <Map
            ref={mapRef}
            center={[-0.77972, -47.92972]}
            style={{ height: 500, minWidth: 500 }}
            zoom={3}
          >
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {position === null ? null : (
              <Marker
                draggable
                position={position}
                eventHandlers={markerEventHandlers}
              />
            )}

            <DrawControl />
          </Map>

          <AttributeListing
            title="Endereços cadastrados"
            items={planData.riskLocations}
            name="addressItem"
            numeration
            onRemove={(_, index) => removeRiskLocation(index)}
            onEdit={(e, index) => {}}
            renderText={(addressItem: RiskLocation) =>
              formatRiskLocation(addressItem)
            }
            showEditButton
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
                handleSearchFromCEP(e);
              }
            }}
            masked
            maskProps={{
              mask: "99999-999 ",
            }}
            onRightIconClick={handleSearchFromCEP}
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

              <label htmlFor="myInput">Escolher arquivo</label>
              <input
                style={{ display: "none" }}
                id="myInput"
                type="file"
                onChange={handleUpload}
              />
            </div>

            <div className="buttonsContainer">
              <span></span>
              <Button
                onClick={handleNavigateNextTab}
                className="darkBlueButton"
              >
                Próximo
              </Button>
            </div>
          </main>
        </AddLocationContainer>
      </main>
    </Container>
  );
};

export default StepThree;
