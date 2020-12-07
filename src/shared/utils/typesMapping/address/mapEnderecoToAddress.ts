import numberFormatter from "shared/utils/format/numberFormatter";
import { LocalRisco } from "types/ModelsAPI";
import { RiskLocation } from "types/Plan";

export default function mapEnderecoToAddress(
  localRisco: LocalRisco,
): RiskLocation {
  const lat = localRisco.latitude
    ? numberFormatter({
        value: localRisco.latitude,
        precision: 7,
      })
    : "";

  const long = localRisco.longitude
    ? numberFormatter({ value: localRisco.longitude, precision: 7 })
    : "";

  const location: RiskLocation = {
    cep: localRisco.cep,
    city: localRisco.localidade,
    complement: localRisco.complemento,
    lat,
    long,
    identification: localRisco.identificacao,
    neighbor: localRisco.bairro,
    state: localRisco.uf,
    street: localRisco.logradouro,
    number: localRisco.numero,
    refPoint: localRisco.referencia,
    id: localRisco.id,
  };

  return location;
}
