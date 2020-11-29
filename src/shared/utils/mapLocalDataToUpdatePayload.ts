import { Plano } from "types/ModelsAPI";
import { PlanData } from "types/Plan";

export default function mapLocalDataToUpdatePayload(planData: PlanData) {
  const payload: Partial<Plano> = {};

  Object.keys(planData).forEach((k) => {
    const key = k as keyof PlanData;

    if (key === "generalDescription") {
      if (planData.generalDescription.title) {
        payload.titulo = planData.generalDescription.title;
      }
      if (planData.generalDescription.description) {
        payload.descricao = planData.generalDescription.description;
      }
    } //
    else if (Array.isArray(planData[key])) {
    }
  });

  return payload;
}
