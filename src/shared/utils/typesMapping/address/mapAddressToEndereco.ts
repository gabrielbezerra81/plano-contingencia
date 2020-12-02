import { Endereco } from "types/ModelsAPI";
import { Address } from "types/Plan";

export default function mapAddressToEndereco(address: Address): Endereco {
  const latitude = Number(address.lat.replace(",", "."));
  const longitude = Number(address.long.replace(",", "."));

  return {
    bairro: address.neighbor,
    cep: address.cep,
    complemento: address.complement,
    identificacao: address.name,
    latitude,
    longitude,
    localidade: address.city,
    logradouro: address.street,
    uf: address.state,
    numero: address.number,
    id: address.id,
  };
}
