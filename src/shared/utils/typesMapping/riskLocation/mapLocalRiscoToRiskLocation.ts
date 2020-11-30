import { LocalRisco } from "types/ModelsAPI";
import { RiskLocation } from "types/Plan";

export default function mapLocalRiscoToRiskLocation(
  localRisco: LocalRisco,
): RiskLocation {
  const location: RiskLocation = {
    cep: localRisco.cep,
    city: localRisco.localidade,
    complement: localRisco.complemento,
    lat: localRisco.latitude.toString(),
    long: localRisco.longitude.toString(),
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
