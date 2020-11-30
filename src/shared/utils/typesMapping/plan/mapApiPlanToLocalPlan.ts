import { Plano } from "types/ModelsAPI";
import { PlanData } from "types/Plan";
import mapLocalRiscoToRiskLocation from "../riskLocation/mapLocalRiscoToRiskLocation";
import mapMembroToLocalMember from "../member/mapMembroToLocalMember";

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

  plan.riskLocations = apiPlan.locaisDeRisco.map((apiLocation) =>
    mapLocalRiscoToRiskLocation(apiLocation),
  );

  return plan;
}
