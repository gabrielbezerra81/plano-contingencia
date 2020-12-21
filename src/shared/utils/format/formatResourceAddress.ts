import { Address } from "types/Plan";

export default function formatResourceAddress(address: Address): string {
  let formattedAddress = "";

  if (address.street) {
    formattedAddress += `${address.street}, `;
  }

  if (address.number) {
    formattedAddress += `${address.number}, `;
  }

  if (address.neighbor) {
    formattedAddress += `${address.neighbor}, `;
  }

  if (address.complement) {
    formattedAddress += `${address.complement}, `;
  }

  if (address.city) {
    formattedAddress += `${address.city}, `;

    if (address.state) {
      formattedAddress = formattedAddress.trimEnd();
      formattedAddress += `- ${address.state}`;
      formattedAddress = formattedAddress.replace(",-", " -");
    }
  }

  return formattedAddress;
}
