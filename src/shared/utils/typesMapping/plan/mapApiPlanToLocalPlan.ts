import { Plano } from "types/ModelsAPI";
import { PlanData } from "types/Plan";
import mapEnderecoToAddress from "../address/mapEnderecoToAddress";
import mapMembroToLocalMember from "../member/mapMembroToLocalMember";

export default function mapApiPlanToLocalPlan(apiPlan: Plano): PlanData {
  const plan: PlanData = {
    generalDescription: { title: "", description: "" },
    riskLocations: [],
    workGroup: [],
    resources: [],
    scenarios: [],
  };

  plan.generalDescription.title = apiPlan.titulo;
  plan.generalDescription.description = apiPlan.descricao;

  plan.workGroup = apiPlan.membros.map((apiMember) =>
    mapMembroToLocalMember(apiMember),
  );

  plan.riskLocations = apiPlan.locaisDeRisco.map((apiLocation) =>
    mapEnderecoToAddress(apiLocation),
  );

  plan.resources = apiPlan.recursos.map((recurso) => ({
    address: recurso.endereco
      ? mapEnderecoToAddress(recurso.endereco)
      : undefined,
    value1: recurso.valor1,
    value2: recurso.valor2,
    value3: recurso.valor3,
    id: recurso.id || "",
    type: recurso.tipo as any,
    responsibles: recurso.responsaveis.map((responsavel) => ({
      name: responsavel.nome,
      permission: responsavel.permissao as any,
      personId: responsavel.pessoaId,
      phone: responsavel.telefone,
      role: responsavel.funcao_atribuicao,
      status: responsavel.aceite ? 1 : 0,
      group: !!responsavel.grupo,
      id: responsavel.id || "",
    })),
  }));

  // plan.scenarios = apiPlan.cenarios.map((cenario) => ({
  //   id: cenario.id,
  //   title: cenario.titulo,
  //   addressId: cenario.enderecoId,
  //   threat: {
  //     cobrade: cenario.ameaca.cobrade,
  //     description: cenario.ameaca.descricao,
  //     mergeKey: 0,
  //   },
  //   hypothese: { hypothese: cenario.hipotese, mergeKey: 0 },
  //   risk: {
  //     id: cenario.risco.id,
  //     description: cenario.risco.descricao,
  //     mergeKey: 0,
  //   },
  //   measure: {
  //     id: cenario.medida.id,
  //     description: cenario.medida.descricao,
  //     mergeKey: 0,
  //   },
  //   responsibles: cenario.responsaveis.map((responsavel) =>
  //     mapMembroToLocalMember(responsavel),
  //   ),
  //   resourceId: {
  //     resourceId: cenario.recursoId,
  //     mergeKey: 0,
  //   },
  // }));

  return plan;
}
