import React from "react";
import { RiskLocation } from "types/Plan";

interface Options {
  identification: boolean;
}

export default function formatScenarioAddress(
  location: RiskLocation,
  options?: Options,
) {
  const hasIdentification =
    !options || (options && options.identification) ? true : false;

  const address = {
    fullAddress: "",
    jsxElement: (
      <>
        {hasIdentification && (
          <>
            {`${location.identification},`}
            <br />
          </>
        )}
        {location.street}, {location.neighbor}
        <br />
        {location.complement ? `${location.complement}, ` : ""}
        {location.city} - {location.state}
      </>
    ),
  };

  address.fullAddress += hasIdentification
    ? `${location.identification},\n`
    : "";

  address.fullAddress += `${location.street}, ${location.neighbor}\n`;

  if (location.complement) {
    address.fullAddress += `${location.complement}, `;
  }

  address.fullAddress += `${location.city} - ${location.state}`;

  return address;
}
