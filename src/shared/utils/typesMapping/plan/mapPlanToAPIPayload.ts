import numberFormatter from "shared/utils/format/numberFormatter";
import { Plano } from "types/ModelsAPI";
import { PlanData } from "types/Plan";
import mapAddressToEndereco from "../address/mapAddressToEndereco";

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
    id: member.id,
  }));

  payload.locaisDeRisco = planData.riskLocations.map((riskLocation) => {
    const latitude = riskLocation.lat
      ? numberFormatter({ value: riskLocation.lat, stringToNumber: true })
      : undefined;

    const longitude = riskLocation.long
      ? numberFormatter({ value: riskLocation.long, stringToNumber: true })
      : undefined;

    return {
      bairro: riskLocation.neighbor,
      cep: riskLocation.cep,
      complemento: riskLocation.complement,
      identificacao: riskLocation.identification,
      latitude,
      longitude,
      localidade: riskLocation.city,
      logradouro: riskLocation.street,
      numero: riskLocation.number || "",
      uf: riskLocation.state,
      referencia: riskLocation.refPoint,
      id: riskLocation.id,
    };
  });

  payload.recursos = planData.resources.map((resource) => ({
    id: resource.id,
    endereco: resource.address
      ? mapAddressToEndereco(resource.address)
      : undefined,
    valor1: resource.value1,
    valor2: resource.value2,
    valor3: resource.value3,
    responsaveis: resource.responsibles.map((responsible) => ({
      funcao_atribuicao: responsible.role,
      grupo: !!responsible.group,
      nome: responsible.name,
      permissao: responsible.permission,
      pessoaId: responsible.personId,
      telefone: responsible.phone,
      id: responsible.id,
    })),
    tipo: resource.type,
  }));

  payload.cenarios = planData.scenarios.map((scenario) => ({
    id: scenario.id,
    titulo: scenario.title,
    enderecoId: scenario.addressId,
    ameaca: {
      cobrade: scenario.threat.cobrade,
      descricao: scenario.threat.description,
    },
    hipotese: scenario.hypothese.hypothese,
    risco: { id: scenario.risk.id, descricao: scenario.risk.description },
    medida: {
      id: scenario.measure.id,
      descricao: scenario.measure.description,
    },
    recursoId: scenario.resourceId.resourceId,
    responsaveis: scenario.responsibles.map((responsible) => ({
      nome: responsible.name,
      funcao_atribuicao: responsible.role,
      telefone: responsible.phone,
      permissao: responsible.permission,
      pessoaId: responsible.personId,
      id: responsible.id,
    })),
  }));

  return payload;
}
