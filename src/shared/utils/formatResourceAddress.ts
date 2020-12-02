import { Address } from "types/Plan";

export default function formatResourceAddress(address: Address): string {
  const number = address.number ? `${address.number}, ` : "";

  const complement = address.complement ? `${address.complement}, ` : "";

  const formattedAddress = `${address.street}, ${number}${address.neighbor}, ${complement}${address.city} - ${address.state}`;

  return formattedAddress;
}
