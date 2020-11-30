import api from "api/config";
import { Plano } from "types/ModelsAPI";
import { PlanData } from "types/Plan";
import mapMembroToLocalMember from "./mapMembroToLocalMember";

export default function mapApiPlanToLocalPlan(apiPlan: Plano): PlanData {
  const plan: PlanData = {
    generalDescription: { title: "", description: "" },
    riskLocations: [],
    workGroup: [],
  };

  plan.generalDescription.title = apiPlan.titulo;
  plan.generalDescription.description = apiPlan.descricao;

  plan.workGroup = apiPlan.membros.map((apiMember) =>
    mapMembroToLocalMember(apiMember),
  );

  return plan;
}
