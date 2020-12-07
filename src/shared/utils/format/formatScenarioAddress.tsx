import React from "react";
import { RiskLocation } from "types/Plan";

export default function formatScenarioAddress(location: RiskLocation) {
  const address = {
    fullAddress: `${location.identification},\n`,
    jsxElement: (
      <>
        {location.identification},
        <br />
        {location.street}, {location.neighbor}
        <br />
        {location.complement ? `${location.complement}, ` : ""}
        {location.city}, {location.state}
      </>
    ),
  };

  address.fullAddress += `${location.street}, ${location.neighbor}\n`;

  if (location.complement) {
    address.fullAddress += `${location.complement}, `;
  }

  address.fullAddress += `${location.city}, ${location.state}`;

  return address;
}
