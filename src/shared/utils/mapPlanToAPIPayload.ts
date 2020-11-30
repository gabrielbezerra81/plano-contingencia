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

  return payload;
}
