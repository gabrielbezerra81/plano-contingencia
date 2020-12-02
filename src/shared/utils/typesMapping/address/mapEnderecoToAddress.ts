import { LocalRisco } from "types/ModelsAPI";
import { RiskLocation } from "types/Plan";

export default function mapEnderecoToAddress(
  localRisco: LocalRisco,
): RiskLocation {
  const lat = localRisco.latitude.toString().replace(".", ",");
  const long = localRisco.longitude.toString().replace(".", ",");

  const location: RiskLocation = {
    cep: localRisco.cep,
    city: localRisco.localidade,
    complement: localRisco.complemento,
    lat,
    long,
    name: localRisco.identificacao,
    neighbor: localRisco.bairro,
    state: localRisco.uf,
    street: localRisco.logradouro,
    number: localRisco.numero,
    refPoint: "",
    id: localRisco.id,
  };

  return location;
}
