import React from "react";
import { RiskLocation } from "types/Plan";

export default function formatScenarioAddress(location: RiskLocation) {
  return (
    <>
      {location.identification},
      <br />
      {location.street}, {location.neighbor}
      <br />
      {location.complement ? `${location.complement}, ` : ""}
      {location.city}, {location.state}
    </>
  );
}
