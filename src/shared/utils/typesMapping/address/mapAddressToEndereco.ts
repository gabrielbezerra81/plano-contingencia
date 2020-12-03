import numberFormatter from "shared/utils/numberFormatter";
import { Endereco } from "types/ModelsAPI";
import { Address } from "types/Plan";

export default function mapAddressToEndereco(address: Address): Endereco {
  const latitude = address.lat
    ? numberFormatter({ value: address.lat, stringToNumber: true })
    : undefined;
  const longitude = address.long
    ? numberFormatter({ value: address.long, stringToNumber: true })
    : undefined;

  return {
    bairro: address.neighbor,
    cep: address.cep,
    complemento: address.complement,
    identificacao: address.identification,
    latitude,
    longitude,
    localidade: address.city,
    logradouro: address.street,
    uf: address.state,
    numero: address.number,
    id: address.id,
    referencia: address.refPoint,
  };
}
