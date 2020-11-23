import { LatLngLiteral } from "leaflet";
import React, { useEffect, useState } from "react";
import L from "leaflet";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { Container, AddLocationContainer } from "./styles";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

const StepThree: React.FC = () => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [position, setPosition] = useState<LatLngLiteral | null>(null);

  useEffect(() => {
    if (map) {
      map.locate();
      map.addOneTimeEventListener("locationfound", (e) => {
        setPosition(e.latlng);
        map.flyTo(e.latlng, map.getZoom());
      });
      map.addEventListener("click", (e: any) => {
        setPosition(e.latlng);
      });
    }

    return () => {
      if (map) {
        map.clearAllEventListeners();
      }
    };
  }, [map]);

  return (
    <Container>
      <h6>Orientação: pode ser inserido mais de um endereço</h6>

      <main>
        <MapContainer
          center={[0, 0]}
          style={{ height: 460, width: 600 }}
          zoom={16}
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

        <AddLocationContainer></AddLocationContainer>
      </main>
    </Container>
  );
};

export default StepThree;
