import { Scenario, Threat } from "types/Plan";

export interface SuggestionList {
  id: string;
  cobrade: string;
  risco: string;
  medida: string;
}

export interface ScenarioDTO {
  disabledColumnsCheckbox: {
    address: boolean;
    threat: boolean;
    hypothese: boolean;
    risk: boolean;
    measure: boolean;
    responsible: boolean;
  };
  handleCheckItem: (attr: keyof Scenario, value: any) => void;
  verifyIfPreviousScenariosHasValue: (
    attr: keyof Scenario,
    value: any,
  ) => boolean;
  addedCobrades: Array<Threat>;
}
