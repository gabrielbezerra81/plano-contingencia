import { Plano } from "types/ModelsAPI";
import { PlanData } from "types/Plan";

export default function mapPlanToAPIPayload(planData: PlanData) {
  const payload: Partial<Plano> = {};

  if (planData.generalDescription.title) {
    payload.titulo = planData.generalDescription.title;
  }
  if (planData.generalDescription.description) {
    payload.descricao = planData.generalDescription.description;
  }

  payload.membros = planData.workGroup.map((member) => ({
    nome: member.name,
    funcao_atribuicao: member.role,
    telefone: member.phone,
    permissao: member.permission,
    pessoaId: member.personId,
  }));

  payload.locaisDeRisco = planData.riskLocations.map((riskLocation) => {
    const lat = Number(riskLocation.lat.split(".").join("").replace(",", "."));
    const long = Number(
      riskLocation.long.split(".").join("").replace(",", "."),
    );

    return {
      bairro: riskLocation.neighbor,
      cep: riskLocation.cep,
      complemento: riskLocation.complement,
      identificacao: riskLocation.name,
      latitude: lat,
      longitude: long,
      localidade: riskLocation.city,
      logradouro: riskLocation.street,
      numero: riskLocation.number || "",
      uf: riskLocation.state,
    };
  });

  return payload;
}
